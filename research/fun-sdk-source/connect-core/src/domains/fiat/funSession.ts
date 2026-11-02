import type {
  FiatAuthRefreshResponse,
  FiatSession,
} from '@fun-xyz/fiat-contract/types'
import { isFiatAuthenticationError, sendFiatTransition } from '@funkit/api-base'

import { randomUuid } from '~/utils/randomUuid'

import { FUN_AUTH_REFRESH_ENDPOINT, FUN_AUTH_REVOKE_ENDPOINT } from './funAuth'
import type { IdentityAssertionProvider } from './identityAssertion'
import { redactFiatBodyForLog } from './fiatLogRedactor'

/**
 * Where the host keeps Fun's session across launches — Keychain, SecureStore,
 * or anything with this shape. The value is a credential; store it encrypted.
 */
export interface FunSessionStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
}

export type FunSessionClearReason = 'expired' | 'signed_out' | 'lost'

export type FunSessionEvent =
  | { type: 'created' | 'restored' | 'refreshed' }
  | { type: 'cleared'; reason: FunSessionClearReason }

export interface FunSessionStore {
  /** Bearer source for `/fiat/*` while a session is held. */
  provider: IdentityAssertionProvider
  /** Restores a stored session; `true` when one was found or is already held. */
  hydrate(): Promise<boolean>
  /**
   * Where the login stands now, read as a verification is sent. Passed back
   * to `set`, it drops a session verified across a `clear`.
   */
  mark(): number
  /**
   * Holds the session a VERIFIED response carried. With `since`, a session
   * whose verification was sent before the last `clear` is dropped.
   */
  set(session: FiatSession, since?: number): void
  /** Forgets the session here and in storage, held or not. */
  clear(reason: FunSessionClearReason): Promise<void>
  /**
   * Ends the session on the server, reading a stored one first without
   * restoring it; the local copy stays until `clear`. When the server doesn't
   * confirm, that `clear` keeps the login in storage, marked, and the next
   * restore ends it instead of restoring it. Never rejects, and gives up
   * after a few seconds so a sign-out can go on.
   */
  revoke(): Promise<void>
  current(): FiatSession | undefined
  subscribe(listener: (event: FunSessionEvent) => void): () => void
  /**
   * Stops the background refresh. A refresh already in flight still lands —
   * the server has spent the old handle — and a remount restores into the
   * store again.
   */
  dispose(): void
}

type Send = typeof sendFiatTransition
type Schedule = (run: () => void, delayMs: number) => () => void

export interface CreateFunSessionStoreParams {
  apiKey: string
  /**
   * The customer's own id for the user (their `externalUserId`). Each user
   * keeps their own login in storage, so another user on the device neither
   * reads it nor ends it. Omitted, the api key alone names the stored login.
   */
  userId?: string
  logger: Parameters<Send>[0]['logger']
  /** Without it the session lives in memory, for as long as the store does. */
  storage?: FunSessionStorage
  send?: Send
  now?: () => number
  schedule?: Schedule
}

const STORAGE_PREFIX = 'funkit.fiat.session.v1.'
/** A token closer than this to expiry is refreshed before it is sent. */
const MIN_REMAINING_MS = 60_000
/** The share of a token's lifetime gone when the background refresh runs. */
const BACKGROUND_REFRESH_SHARE = 0.8
/** Keeps a session restored late in its life from refreshing in a tight loop. */
const MIN_BACKGROUND_DELAY_MS = 30_000
/** How long a sign-out waits on the server before forgetting the session anyway. */
const REVOKE_DEADLINE_MS = 5_000
/** The lifetime the server issues, used when the device clock disagrees. */
const NOMINAL_LIFETIME_MS = 3_600_000
const MIN_PLAUSIBLE_LIFETIME_MS = 5 * 60_000
const MAX_PLAUSIBLE_LIFETIME_MS = 24 * 3_600_000
const LOG_TITLE = 'connect-core:fiat:fun_session'

interface Held {
  session: FiatSession
  /** Device clock at receipt; freshness is measured from here, never from `expiresAtMs`. */
  receivedAtMs: number
  lifetimeMs: number
}

const scheduleTimeout: Schedule = (run, delayMs) => {
  const timer = setTimeout(run, delayMs)
  return () => clearTimeout(timer)
}

export function funSessionStorageKey(apiKey: string, userId?: string): string {
  return userId === undefined
    ? `${STORAGE_PREFIX}${apiKey}`
    : `${STORAGE_PREFIX}${apiKey}.${userId}`
}

/**
 * Holds Fun's own login for a host that mints no identity assertion.
 *
 * - The access token is refreshed in the background at 80% of its lifetime,
 *   so requests never wait on it; a request only refreshes inline when the
 *   token is within a minute of expiry or the server rejected it.
 * - Concurrent callers share one refresh: the handle rotates on every
 *   refresh, so a second one in parallel would spend a handle already gone.
 * - A 401 on refresh, or on a request sent with a just-refreshed token, ends
 *   the session; the next entry quote then asks for the email again.
 */
export function createFunSessionStore({
  apiKey,
  userId,
  logger,
  storage,
  send = sendFiatTransition,
  now = Date.now,
  schedule = scheduleTimeout,
}: CreateFunSessionStoreParams): FunSessionStore {
  const key = funSessionStorageKey(apiKey, userId)
  let held: Held | undefined
  let stale = false
  // A background refresh failed; the next request retries it, off its own path.
  let refreshDue = false
  // Bumped whenever `held` is set or cleared, so a late refresh or restore
  // cannot overwrite a session set or cleared after it started.
  let generation = 0
  // Bumped only by `clear`: a verification sent before one has been signed out of.
  let clears = 0
  // Bumped when a sign-in or restore starts a login and when `clear` ends one;
  // a refresh keeps it, so a revoke can tell its login from the next.
  let login = 0
  let disposed = false
  // A session whose sign-out revoke failed: the clear that follows keeps it
  // in storage, marked, for the next restore to revoke instead of restore.
  let unrevoked: Stored | undefined
  let legacyRetired = false
  let skewWarned = false
  // Keyed by the generation it started under: a refresh that never answers
  // must not stand in for the next login's.
  let inflight: { generation: number; token: Promise<string> } | undefined
  let cancelTimer: (() => void) | undefined
  // Writes and removals land in call order, so a sign-out is never followed
  // by an earlier, slower write of the session it ended.
  let storageQueue: Promise<void> = Promise.resolve()
  const listeners = new Set<(event: FunSessionEvent) => void>()

  const notify = (event: FunSessionEvent) => {
    for (const listener of [...listeners]) {
      listener(event)
    }
  }

  const warnStorage = (op: string) => (error: unknown) => {
    logger.warn('connect-core:fiat:fun_session_storage_failed', {
      op,
      reason: errorName(error),
    })
  }

  const enqueueStorage = (op: () => Promise<void>): Promise<void> => {
    const next = storageQueue.then(op)
    // One op that throws (a host `remove` that throws synchronously) must not
    // stop every write after it.
    storageQueue = next.catch(() => undefined)
    return next
  }

  const persist = ({ session, receivedAtMs }: Held) =>
    enqueueStorage(async () => {
      if (storage === undefined) {
        return
      }
      try {
        await storage.set(key, JSON.stringify({ session, receivedAtMs }))
      } catch (error) {
        // The session still serves from memory; only the next launch loses it.
        logger.warn(LOG_TITLE, {
          event: 'persist_failed',
          reason: errorName(error),
        })
      }
    })

  const removeStored = () =>
    enqueueStorage(async () => {
      try {
        await storage?.remove(key)
      } catch (error) {
        warnStorage('remove')(error)
      }
    })

  const lifetimeOf = (session: FiatSession, receivedAtMs: number): number => {
    const lifetimeMs = session.expiresAtMs - receivedAtMs
    if (
      lifetimeMs >= MIN_PLAUSIBLE_LIFETIME_MS &&
      lifetimeMs <= MAX_PLAUSIBLE_LIFETIME_MS
    ) {
      return lifetimeMs
    }
    if (!skewWarned) {
      skewWarned = true
      logger.warn(LOG_TITLE, { event: 'clock_skew', lifetimeMs })
    }
    return NOMINAL_LIFETIME_MS
  }

  const install = (
    session: FiatSession,
    receivedAtMs: number,
    event: 'created' | 'restored' | 'refreshed',
  ): Promise<void> => {
    generation += 1
    unrevoked = undefined
    if (event !== 'refreshed') {
      login += 1
    }
    held = {
      session,
      receivedAtMs,
      lifetimeMs: lifetimeOf(session, receivedAtMs),
    }
    stale = false
    refreshDue = false
    scheduleBackgroundRefresh(held)
    logger.info(LOG_TITLE, { event, expiresAtMs: session.expiresAtMs })
    notify({ type: event })
    return event === 'restored' ? Promise.resolve() : persist(held)
  }

  const scheduleBackgroundRefresh = ({ receivedAtMs, lifetimeMs }: Held) => {
    cancelTimer?.()
    cancelTimer = undefined
    if (disposed) {
      return
    }
    const refreshAt = receivedAtMs + BACKGROUND_REFRESH_SHARE * lifetimeMs
    cancelTimer = schedule(
      () => {
        cancelTimer = undefined
        refreshInBackground()
      },
      Math.max(MIN_BACKGROUND_DELAY_MS, refreshAt - now()),
    )
  }

  const refreshInBackground = () => {
    refresh().catch((error: unknown) => {
      refreshDue = held !== undefined
      logger.warn('connect-core:fiat:fun_session_refresh_failed', {
        reason: errorName(error),
      })
    })
  }

  const rotate = async (
    refreshHandle: string,
    startedOn: number,
  ): Promise<string> => {
    try {
      const { session } = await send<FiatAuthRefreshResponse>({
        apiKey,
        logger,
        redactBodyForLog: redactFiatBodyForLog,
        params: {
          endpoint: FUN_AUTH_REFRESH_ENDPOINT,
          body: { refreshHandle },
          idempotencyKey: randomUuid(),
        },
      })
      // Installed even after `dispose`: the old handle is spent either way.
      // The token is usable now; a slow storage write must not hold the request.
      if (startedOn === generation) {
        void install(session, now(), 'refreshed')
        return session.accessToken
      }
      // A newer session replaced the one this refresh was for.
      if (held !== undefined) {
        return held.session.accessToken
      }
      throw noSession()
    } catch (error) {
      if (isFiatAuthenticationError(error) && startedOn === generation) {
        await clear('expired')
      }
      throw error
    }
  }

  const refresh = (): Promise<string> => {
    if (inflight !== undefined && inflight.generation === generation) {
      return inflight.token
    }
    if (held === undefined) {
      return Promise.reject(noSession())
    }
    const started = {
      generation,
      token: rotate(held.session.refreshHandle, generation).finally(() => {
        if (inflight === started) {
          inflight = undefined
        }
      }),
    }
    inflight = started
    return started.token
  }

  const clear = async (reason: FunSessionClearReason) => {
    const wasHeld = held !== undefined
    // Bumped even with nothing held, so a restore still reading storage
    // cannot bring back what a sign-out just ended.
    generation += 1
    clears += 1
    login += 1
    held = undefined
    stale = false
    refreshDue = false
    cancelTimer?.()
    cancelTimer = undefined
    if (wasHeld) {
      if (reason === 'expired') {
        logger.warn(LOG_TITLE, { event: 'cleared', reason })
      } else {
        logger.info(LOG_TITLE, { event: 'cleared', reason })
      }
      notify({ type: 'cleared', reason })
    }
    const owed = reason === 'signed_out' ? unrevoked : undefined
    unrevoked = undefined
    if (owed === undefined) {
      await removeStored()
      return
    }
    // Its handle is still live on the server; dropping it here would leave
    // nothing able to end it.
    await enqueueStorage(async () => {
      try {
        await storage?.set(key, JSON.stringify({ ...owed, revokeOwed: true }))
      } catch (error) {
        warnStorage('set')(error)
      }
    })
  }

  const stopBackgroundRefresh = () => {
    cancelTimer?.()
    cancelTimer = undefined
  }

  /**
   * Ends `target`, or the held session, on the server. `true` once it is
   * ended, including a handle the server no longer accepts, or when there is
   * nothing to end; `false` when it may still be live.
   */
  const revokeOnServer = async (target?: Stored): Promise<boolean> => {
    let session = target?.session
    if (session === undefined) {
      const signingOut = login
      // A background refresh during the send would rotate the handle being
      // revoked and leave the new one live on the server.
      stopBackgroundRefresh()
      // A refresh in flight rotates the handle; revoke the one it leaves.
      if (inflight?.generation === generation) {
        await inflight.token.catch(() => undefined)
      }
      // That refresh re-arms the timer as it installs.
      stopBackgroundRefresh()
      if (held === undefined || login !== signingOut) {
        return true
      }
      session = held.session
    }
    try {
      await send({
        apiKey,
        logger,
        redactBodyForLog: redactFiatBodyForLog,
        params: {
          endpoint: FUN_AUTH_REVOKE_ENDPOINT,
          body: { refreshHandle: session.refreshHandle },
          idempotencyKey: randomUuid(),
        },
      })
      return true
    } catch (error) {
      if (isFiatAuthenticationError(error)) {
        return true
      }
      logger.warn('connect-core:fiat:fun_session_revoke_failed', {
        reason: errorName(error),
      })
      return false
    }
  }

  const readRaw = async (storageKey: string): Promise<string | null> => {
    try {
      return (await storage?.get(storageKey)) ?? null
    } catch (error) {
      warnStorage('get')(error)
      return null
    }
  }

  /** A login whose sign-out revoke failed earlier: ended now, never restored. */
  const revokeOwed = async (stored: Stored) => {
    const startedOn = generation
    // Removed only if nothing was verified meanwhile: the key now holds that login.
    if ((await revokeOnServer(stored)) && generation === startedOn) {
      await removeStored()
    }
  }

  /**
   * The login saved before logins were kept per user, under the api key
   * alone: whose it is can't be told, so it is ended rather than restored.
   */
  const retireLegacyLogin = async () => {
    const legacyKey = funSessionStorageKey(apiKey)
    const raw = await readRaw(legacyKey)
    if (raw === null) {
      return
    }
    const stored = parseStored(raw)
    if (stored !== undefined && !(await revokeOnServer(stored))) {
      return
    }
    await enqueueStorage(async () => {
      try {
        await storage?.remove(legacyKey)
      } catch (error) {
        warnStorage('remove')(error)
      }
    })
  }

  /** `true` once `work` settles, `false` if `ms` passes first. */
  const withinDeadline = (work: Promise<void>, ms: number) =>
    new Promise<boolean>((resolve) => {
      const cancel = schedule(() => resolve(false), ms)
      const settle = () => {
        cancel()
        resolve(true)
      }
      work.then(settle, settle)
    })

  const provider: IdentityAssertionProvider = {
    get() {
      if (held === undefined) {
        return Promise.reject(noSession())
      }
      const { session, receivedAtMs, lifetimeMs } = held
      const freshForMs = receivedAtMs + lifetimeMs - now()
      if (stale || freshForMs < MIN_REMAINING_MS) {
        return refresh()
      }
      if (refreshDue) {
        refreshDue = false
        refreshInBackground()
      }
      return Promise.resolve(session.accessToken)
    },
    invalidate() {
      stale = held !== undefined
    },
    reject(assertion) {
      if (held?.session.accessToken === assertion) {
        void clear('expired')
      }
    },
  }

  const store: FunSessionStore = {
    provider,
    async hydrate() {
      disposed = false
      // A remount over a store that kept its session only needs its timer back.
      if (held !== undefined) {
        scheduleBackgroundRefresh(held)
        return true
      }
      if (storage === undefined) {
        return false
      }
      const startedOn = generation
      let raw: string | null
      try {
        raw = await storage.get(key)
      } catch (error) {
        warnStorage('get')(error)
        return false
      }
      // After this user's read, so their restore never waits on it.
      if (userId !== undefined && !legacyRetired) {
        legacyRetired = true
        void retireLegacyLogin()
      }
      if (raw === null) {
        return false
      }
      // A session verified or cleared while storage was being read is newer.
      if (startedOn !== generation) {
        return held !== undefined
      }
      const stored = parseStored(raw)
      if (stored === undefined) {
        logger.warn(LOG_TITLE, { event: 'cleared', reason: 'lost' })
        await removeStored()
        return false
      }
      if (stored.revokeOwed) {
        void revokeOwed(stored)
        return false
      }
      await install(stored.session, stored.receivedAtMs, 'restored')
      return true
    },
    mark: () => clears,
    set(session, since) {
      if (since !== undefined && since !== clears) {
        // The flow is on the verified tick; it goes back to the entry.
        logger.warn(LOG_TITLE, { event: 'verified_after_clear' })
        notify({ type: 'cleared', reason: 'signed_out' })
        return
      }
      void install(session, now(), 'created')
    },
    clear,
    async revoke() {
      const clearsAtStart = clears
      // Kept for the clear that follows, only while this sign-out is current:
      // a late answer must not mark a login made after it.
      const owe = (target: Stored | undefined) => {
        if (target !== undefined && clears === clearsAtStart) {
          unrevoked = target
        }
      }
      const heldNow = () =>
        held === undefined
          ? undefined
          : { session: held.session, receivedAtMs: held.receivedAtMs }
      const revokeOne = async () => {
        if (held !== undefined) {
          if (!(await revokeOnServer())) {
            owe(heldNow())
          }
          return
        }
        // Only in storage: its handle is read without restoring the login, so
        // no listener hears a login in the middle of a sign-out.
        const raw = await readRaw(key)
        const stored = raw === null ? undefined : parseStored(raw)
        if (stored === undefined || clears !== clearsAtStart) {
          return
        }
        if (!(await revokeOnServer(stored))) {
          owe(stored)
        }
      }
      // A stalled read or send can't hold a sign-out past the deadline.
      const settled = await withinDeadline(revokeOne(), REVOKE_DEADLINE_MS)
      if (!settled) {
        logger.warn('connect-core:fiat:fun_session_revoke_failed', {
          reason: 'timeout',
        })
        owe(heldNow())
      }
    },
    current: () => held?.session,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    dispose() {
      disposed = true
      cancelTimer?.()
      cancelTimer = undefined
    },
  }
  return store
}

type Stored = Pick<Held, 'session' | 'receivedAtMs'> & {
  /** Signed out, but the server never confirmed the revoke. */
  revokeOwed?: boolean
}

function parseStored(raw: string): Stored | undefined {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return undefined
  }
  if (typeof value !== 'object' || value === null) {
    return undefined
  }
  const { session, receivedAtMs, revokeOwed } = value as Partial<
    Record<keyof Stored, unknown>
  >
  if (!isFiatSession(session) || typeof receivedAtMs !== 'number') {
    return undefined
  }
  return revokeOwed === true
    ? { session, receivedAtMs, revokeOwed }
    : { session, receivedAtMs }
}

function isFiatSession(value: unknown): value is FiatSession {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { accessToken, refreshHandle, expiresAtMs } = value as Record<
    string,
    unknown
  >
  return (
    typeof accessToken === 'string' &&
    typeof refreshHandle === 'string' &&
    typeof expiresAtMs === 'number'
  )
}

function noSession(): Error {
  return new Error('no Fun session is held')
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : typeof error
}
