import { decodeBase64Url } from '~/utils/base64Url'

/**
 * Mints a short-lived JWT asserting the current user's identity, signed by the host's
 * own backend. Sent as the bearer credential on `/fiat/*` requests, which is
 * where it is verified — nothing here trusts its claims.
 */
export type GetIdentityAssertion = () => Promise<string>

export interface IdentityAssertionProvider {
  /** Returns a fresh or cached assertion. */
  get(): Promise<string>
  /** Clears an assertion the server rejected. */
  invalidate(): void
  /**
   * The server rejected a fresh assertion too, so the identity behind it is
   * over. Only a provider that can end its own identity implements it.
   * - `assertion` is the one refused, so a late answer cannot end a newer identity.
   */
  reject?(assertion: string): void
}

const EXPIRY_MARGIN_MS = 15_000
const UNREADABLE_EXP_TTL_MS = 30_000

const mintFailures = new WeakSet<object>()

/**
 * The host's minter threw this. Its wrapper already retried what was worth
 * retrying, so a request retry on top would only multiply mints.
 */
export function isIdentityMintFailure(error: unknown): boolean {
  return typeof error === 'object' && error !== null && mintFailures.has(error)
}

/**
 * Caches an assertion until shortly before it expires.
 *
 * The `exp` claim is read for one purpose, scheduling the refresh. A host that
 * breaks the JWT contract is tolerated rather than trusted: an unreadable
 * expiry falls back to a short TTL, so the flow keeps working and the cost is
 * only a more frequent mint.
 */
export function createIdentityAssertionProvider(
  mint: GetIdentityAssertion,
  now: () => number = Date.now,
): IdentityAssertionProvider {
  let cached: { assertion: string; staleAtMs: number } | undefined
  let inflight: Promise<string> | undefined

  return {
    get() {
      if (cached !== undefined && now() < cached.staleAtMs) {
        return Promise.resolve(cached.assertion)
      }
      if (inflight !== undefined) {
        return inflight
      }
      inflight = mint()
        .then((assertion) => {
          cached = {
            assertion,
            staleAtMs: staleAt(assertion, now()),
          }
          return assertion
        })
        .catch((error: unknown) => {
          if (typeof error === 'object' && error !== null) {
            mintFailures.add(error)
          }
          throw error
        })
        .finally(() => {
          inflight = undefined
        })
      return inflight
    },
    invalidate() {
      cached = undefined
    },
  }
}

function staleAt(assertion: string, nowMs: number): number {
  const exp = readExpSeconds(assertion)
  if (exp === undefined) {
    return nowMs + UNREADABLE_EXP_TTL_MS
  }
  return exp * 1000 - EXPIRY_MARGIN_MS
}

/** Reads `exp` only to schedule refresh; the backend still verifies the token. */
export function readExpSeconds(jwt: string): number | undefined {
  const exp = decodeJwtClaims(jwt)?.exp
  return typeof exp === 'number' && Number.isFinite(exp) ? exp : undefined
}

/** A JWT's claim set, or `undefined` if it is not a readable JWT. */
export function decodeJwtClaims(
  jwt: string,
): Record<string, unknown> | undefined {
  const payload = jwt.split('.')[1]
  if (payload === undefined) {
    return undefined
  }
  try {
    const claims: unknown = JSON.parse(decodeBase64Url(payload))
    return typeof claims === 'object' && claims !== null
      ? (claims as Record<string, unknown>)
      : undefined
  } catch {
    return undefined
  }
}
