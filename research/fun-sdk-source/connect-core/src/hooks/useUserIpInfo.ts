import { getFunGeoIpAddress } from '@funkit/api-base'
import { useQuery } from '@tanstack/react-query'

import type { FunLogger } from '~/utils/funLogger'
import { useDynamicConfig, useFeatureGate } from './statsig'

// Public Moonpay live key — web and RN both use it purely to read the caller's
// IP → country; it grants no account access. ipapi.co is the keyless fallback.
const MOONPAY_LIVE_API_KEY = 'pk_live_IxayBRQuBC3RzpPZkbGPrwUsRWAaeO'

// Bounds each provider: `fetch` has no default timeout, so an ad-blocked or
// hung request would otherwise stall the geo gate indefinitely.
const PROVIDER_TIMEOUT_MS = 10_000

const ALL_COUNTRIES = '*'

/** Promotes the first-party endpoint from shadow to authoritative. */
const GEO_PRIMARY_GATE = 'enable-fun-geo-primary'

/**
 * Rollout state of the first-party geo endpoint, from the
 * {@link GEO_PRIMARY_GATE} feature gate:
 * - `shadow` (gate off) — Moonpay stays authoritative; Fun runs detached, for
 *   comparison only.
 * - `primary` (gate on) — Fun first, with Moonpay then ipapi as fallbacks.
 *
 * Two states, so a gate rather than a dynamic config: it cannot hold an
 * unparseable value, and a gate that fails to resolve is `false`, which lands on
 * `shadow`. There is no third "off" state because `shadow` already is one — it
 * cannot change what any user sees and cannot slow the lookup down (see
 * {@link resolveWithShadowCompare}).
 */
type GeoProviderMode = 'shadow' | 'primary'

/** ISO 3166-1 alpha-2 country + region code for the current user's IP. */
export interface FunkitUserIpInfo {
  alpha2: string
  state: string
}

export interface UseUserIpInfoParams {
  logger: FunLogger
  /**
   * Funkit customer key, forwarded so the first-party endpoint can tag its logs.
   * Without it the Fun provider is skipped and only Moonpay → ipapi run.
   */
  apiKey?: string
  /**
   * Whether to run the lookup. Web gates on wallet login (`isUserLoggedIn`);
   * React Native is login-agnostic and passes `true`. Defaults to `true`.
   */
  enabled?: boolean
  /**
   * react-query `staleTime`. RN passes `Infinity` (session-stable, login-
   * agnostic). Web omits it to keep its prior default, so a logged-out →
   * network/VPN-change → login sequence re-resolves the country instead of
   * reusing a cached one.
   */
  staleTime?: number
  /**
   * Keep asking providers until one names a subdivision. RN's fiat rail needs
   * it — pricing is per-state licensing. Web reads only the country and omits
   * it, so the first answer wins and no second lookup is spent on a field with
   * no consumer. Defaults to `false`.
   */
  requireState?: boolean
}

export interface UseUserIpInfoResult {
  userIpInfo: FunkitUserIpInfo | undefined
  isLoadingGeoCheck: boolean
}

interface GeoProvider {
  name: 'fun' | 'moonpay' | 'ipapi'
  resolve: () => Promise<FunkitUserIpInfo>
}

type Timed<T> =
  | { ok: true; value: T; ms: number }
  | { ok: false; error: unknown; ms: number }

function errData(error: unknown): { error: string } {
  return { error: error instanceof Error ? error.message : String(error) }
}

/**
 * Timeout signal from a plain `AbortController` rather than
 * `AbortSignal.timeout`. Older WebViews and React Native runtimes ship
 * `AbortController` without the static method, where calling it throws *before*
 * the request goes out — that would fail every provider and
 * geoblock the user. Same reason `nadoFetch` builds its own.
 *
 * `DOMException` is avoided for the same portability reason; the reason is a
 * plain `Error` so `errData` still reports "timed out" in the fallback log.
 */
function abortAfter(ms: number): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    const timeout = new Error(`Geo provider timed out after ${ms}ms`)
    timeout.name = 'TimeoutError'
    controller.abort(timeout)
  }, ms)
  // Callers must clear this on the success path, or every lookup leaves a timer
  // pending for the full timeout.
  return { signal: controller.signal, cleanup: () => clearTimeout(timer) }
}

async function getIpViaFun(
  apiKey: string,
  logger: FunLogger,
): Promise<FunkitUserIpInfo> {
  const timeout = abortAfter(PROVIDER_TIMEOUT_MS)
  try {
    const { alpha2, region } = await getFunGeoIpAddress({
      apiKey,
      logger,
      signal: timeout.signal,
    })
    // The endpoint answers 200 with empty fields when Vercel's geo headers are
    // missing. Accepting that would fail the user closed while a fallback could
    // still place them, so treat it as a miss and try the next provider.
    if (!alpha2) {
      throw new Error('Fun geo endpoint resolved no country')
    }
    // `region` lands on `state`, the same normalization ipapi's `region_code`
    // gets — every provider answers into Moonpay's shape. The endpoint's `ip`
    // and `city` have no consumer in the SDK, so they are dropped here.
    return { alpha2, state: region }
  } finally {
    timeout.cleanup()
  }
}

async function getIpViaMoonpay(): Promise<FunkitUserIpInfo> {
  const timeout = abortAfter(PROVIDER_TIMEOUT_MS)
  try {
    const res = await fetch(
      `https://api.moonpay.com/v3/ip_address?apiKey=${MOONPAY_LIVE_API_KEY}`,
      { signal: timeout.signal },
    )
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    const data = (await res.json()) as { alpha2: string; state: string }
    return { alpha2: data.alpha2, state: data.state }
  } finally {
    timeout.cleanup()
  }
}

async function getIpViaIpApi(): Promise<FunkitUserIpInfo> {
  const timeout = abortAfter(PROVIDER_TIMEOUT_MS)
  try {
    const res = await fetch('https://ipapi.co/json', {
      signal: timeout.signal,
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    const data = (await res.json()) as {
      country_code: string
      region_code: string
    }
    return { alpha2: data.country_code, state: data.region_code }
  } finally {
    timeout.cleanup()
  }
}

/**
 * Mirrors the `isCountryBlocked` predicate in @funkit/connect and
 * @funkit/connect-rn, minus their logging. Deliberately a separate copy: it only
 * scores the shadow comparison below and must not touch the live decision path,
 * which the geo-policy follow-up consolidates.
 */
function isCountryBlocked(
  blockedCountries: readonly string[],
  alpha2: string,
): boolean {
  return (
    !alpha2 ||
    blockedCountries.includes(ALL_COUNTRIES) ||
    blockedCountries.includes(alpha2)
  )
}

async function timed<T>(run: () => Promise<T>): Promise<Timed<T>> {
  const startMs = Date.now()
  try {
    return { ok: true, value: await run(), ms: Date.now() - startMs }
  } catch (error) {
    return { ok: false, error, ms: Date.now() - startMs }
  }
}

/**
 * Whether the answer is complete for this caller. Only a caller that asked for
 * a state (RN's fiat rail, priced per state) treats a stateless answer as one
 * worth trying to improve on; everyone else stops at the first country.
 */
function isCompleteFor(
  userIpInfo: FunkitUserIpInfo,
  requireState: boolean,
): boolean {
  return !requireState || userIpInfo.state.length > 0
}

/**
 * Tries each provider in order and returns the first that answers. A failure
 * with a provider still to try is recovered (WARN); running out of them gates
 * geo-compliance, so it stays an ERROR.
 *
 * With `requireState`, an answer carrying no state does not stop the walk — a
 * later provider may name one, and the frontmost one is kept only if nobody
 * does. Returning it early is what left a New York buyer unable to quote while
 * Moonpay, next in line, knew the state.
 */
async function resolveFromProviders(
  providers: readonly GeoProvider[],
  logger: FunLogger,
  requireState: boolean,
): Promise<FunkitUserIpInfo> {
  let lastError: unknown = new Error('No geo provider configured')
  let stateless: FunkitUserIpInfo | undefined

  for (const [index, provider] of providers.entries()) {
    try {
      const userIpInfo = await provider.resolve()
      logger.info('fun_geo_resolved', {
        provider: provider.name,
        alpha2: userIpInfo.alpha2,
        state: userIpInfo.state,
      })
      if (isCompleteFor(userIpInfo, requireState)) {
        return userIpInfo
      }
      stateless ??= userIpInfo
      const after = providers[index + 1]
      if (after) {
        logger.warn('fun_geo_state_missing', {
          provider: provider.name,
          next: after.name,
        })
      }
    } catch (error) {
      lastError = error
      const next = providers[index + 1]
      if (next) {
        logger.warn('fun_geo_fallback_engaged', {
          provider: provider.name,
          next: next.name,
          ...errData(error),
        })
      }
    }
  }

  // Better than nothing: the country still answers the compliance question,
  // which is what would fail the user closed.
  if (stateless !== undefined) {
    return stateless
  }

  logger.error('fun_geo_unresolved', errData(lastError))
  throw lastError
}

/** Emits the one comparison event the `primary` promotion decision reads. */
function logShadowCompare({
  moonpay,
  fun,
  blockedCountries,
  logger,
}: {
  moonpay: Timed<FunkitUserIpInfo>
  fun: Timed<FunkitUserIpInfo>
  blockedCountries: readonly string[]
  logger: FunLogger
}): void {
  const moonpayInfo = moonpay.ok ? moonpay.value : undefined
  const funInfo = fun.ok ? fun.value : undefined

  logger.info('fun_geo_shadow_compare', {
    moonpayAlpha2: moonpayInfo?.alpha2 ?? '',
    funAlpha2: funInfo?.alpha2 ?? '',
    alpha2Match: moonpayInfo?.alpha2 === funInfo?.alpha2,
    moonpayState: moonpayInfo?.state ?? '',
    funState: funInfo?.state ?? '',
    stateMatch: moonpayInfo?.state === funInfo?.state,
    // Both unresolved counts as a mismatch — `funStatus` separates "Fun was
    // down" from "Fun disagreed".
    verdictMatch:
      !!moonpayInfo &&
      !!funInfo &&
      isCountryBlocked(blockedCountries, moonpayInfo.alpha2) ===
        isCountryBlocked(blockedCountries, funInfo.alpha2),
    moonpayLatencyMs: moonpay.ms,
    funLatencyMs: fun.ms,
    funStatus: fun.ok ? 'ok' : 'error',
  })
}

/**
 * Returns the authoritative Moonpay answer the moment it lands, leaving the Fun
 * call running detached and logging the comparison whenever it settles.
 *
 * Awaiting both would hand the user the *slower* of the two: a stalled frog
 * would hold `isLoadingGeoCheck` — and with it the checkout UI — for the full
 * provider timeout even though Moonpay had already answered. Shadow mode exists
 * only to gather promotion data, so it must not be able to affect what the user
 * sees or how long they wait.
 *
 * Promotion to `primary` is gated on `verdictMatch`, not field equality — GeoIP
 * vendors agree on country far more than on region.
 */
async function resolveWithShadowCompare({
  funProvider,
  fallbackProviders,
  blockedCountries,
  logger,
  requireState,
}: {
  funProvider: GeoProvider
  fallbackProviders: readonly GeoProvider[]
  blockedCountries: readonly string[]
  logger: FunLogger
  requireState: boolean
}): Promise<FunkitUserIpInfo> {
  const moonpayPending = timed(() =>
    resolveFromProviders(fallbackProviders, logger, requireState),
  )
  const funPending = timed(funProvider.resolve)

  // Detached on purpose — this settles after the hook has already returned.
  // `timed` swallows provider failures, so the only way this rejects is the log
  // call itself throwing, which must not surface as an unhandled rejection.
  void Promise.all([moonpayPending, funPending])
    .then(([moonpay, fun]) =>
      logShadowCompare({ moonpay, fun, blockedCountries, logger }),
    )
    .catch(() => undefined)

  const moonpay = await moonpayPending
  if (!moonpay.ok) {
    throw moonpay.error
  }
  return moonpay.value
}

/**
 * Platform-agnostic resolver for the user's country (ISO alpha-2) + region from
 * their IP. Shared by `@funkit/connect` (web) and `@funkit/connect-rn`, which
 * each wrap it to inject their platform `logger`, `apiKey`, and `enabled` source
 * (web: `isUserLoggedIn`; RN: always on).
 *
 * The provider order is selected by the {@link GEO_PRIMARY_GATE} gate — see
 * {@link GeoProviderMode}. Moonpay and ipapi.co are plain `fetch` (no native
 * modules, Expo-Go-safe); the Fun endpoint goes through @funkit/api-base.
 *
 * The resolved country feeds country-conditional Statsig configs (see
 * `useDynamicConfig`) and the Swapped default-currency lookup — it is not only a
 * blocking signal. A recovered fallback logs at WARN; only exhausting every
 * provider is an ERROR, since that fails the user closed on a compliance gate.
 */
export function useUserIpInfo({
  logger,
  apiKey,
  enabled = true,
  staleTime,
  requireState = false,
}: UseUserIpInfoParams): UseUserIpInfoResult {
  const mode: GeoProviderMode = useFeatureGate(GEO_PRIMARY_GATE)
    ? 'primary'
    : 'shadow'
  // Bypasses country conditions: the country is what this hook resolves, so
  // gating on it here would be circular.
  const blockedCountries = useDynamicConfig('blockedcountries', {
    bypassCountryCode: true,
  })

  const { data: userIpInfo, isLoading: isLoadingGeoCheck } = useQuery({
    // The mode is part of the key so flipping the gate re-resolves instead of
    // serving a country the previous provider answered. So is `requireState`:
    // a caller that needs one must not be served a stateless answer another
    // caller was happy with.
    queryKey: ['getUserIpInfo', mode, requireState] as const,
    queryFn: async (): Promise<FunkitUserIpInfo> => {
      const fallbackProviders: readonly GeoProvider[] = [
        { name: 'moonpay', resolve: getIpViaMoonpay },
        { name: 'ipapi', resolve: getIpViaIpApi },
      ]

      if (!apiKey) {
        // No key means the endpoint is unreachable, so there is nothing to shadow
        // or promote. Web's config context defaults `apiKey` to '' outside a
        // provider, so an empty key is the same case as an absent one.
        logger.warn('fun_geo_skipped_no_api_key', { mode })
        return resolveFromProviders(fallbackProviders, logger, requireState)
      }

      const funProvider: GeoProvider = {
        name: 'fun',
        resolve: () => getIpViaFun(apiKey, logger),
      }

      if (mode === 'primary') {
        return resolveFromProviders(
          [funProvider, ...fallbackProviders],
          logger,
          requireState,
        )
      }

      return resolveWithShadowCompare({
        funProvider,
        fallbackProviders,
        blockedCountries,
        logger,
        requireState,
      })
    },
    enabled,
    staleTime,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  })

  return { userIpInfo, isLoadingGeoCheck }
}
