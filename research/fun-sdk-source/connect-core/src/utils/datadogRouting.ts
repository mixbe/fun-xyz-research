/**
 * Shared by `@funkit/connect` and `@funkit/connect-rn`: decides whether
 * Datadog logs go through the `puppy.fun.xyz` proxy, which ad blockers don't
 * know, or straight to Datadog's intake, from the `sdk-datadog-proxy` Statsig
 * gate. Logs are held until a route is set. The proxy is the `puppy-dd-proxy`
 * stack in fun-xyz/cfn-infra (cloudformations/puppy-dd-proxy.yaml).
 */

import { encodeBase64UrlAscii } from './base64Url'
import { STATSIG_NETWORK_TIMEOUT_MS } from './statsig'

const PROXY_GATE = 'sdk-datadog-proxy'

/** CloudFront pass-through to `browser-intake-datadoghq.com`. */
const DATADOG_PROXY_ORIGIN = 'https://puppy.fun.xyz'

/** The only Datadog site the proxy forwards to. */
export const DATADOG_PROXY_SITE = 'datadoghq.com'

// Ad-block lists match Datadog's path and query names (`/logs?ddsource=`,
// `dd-api-key`), so the URL carries neither: the proxy's CloudFront Function
// decodes `d` back into Datadog's query and restores `/api/v2/logs`.
const PROXY_PATH = '/e'

// Statsig counts its network timeout from its own init, which starts when the
// provider mounts, so the router allows a little more before giving up.
const STATSIG_GRACE_MS = 1_000

export interface DatadogRouteDecision {
  route: 'proxy' | 'direct'
  /** `statsig` when the gate value came from Statsig's server; `fallback` otherwise. */
  source: 'statsig' | 'fallback'
  /** Statsig's evaluation reason for the gate, e.g. `Cache:Recognized`. */
  statsigReason: string
}

/** The part of a Statsig client the router reads. */
export interface DatadogRouteStatsigClient {
  getFeatureGate(
    name: string,
    options?: { disableExposureLog?: boolean },
  ): { value: boolean; details: { reason: string } }
  on(event: 'values_updated', listener: () => void): void
  off(event: 'values_updated', listener: () => void): void
}

export interface DatadogRouter {
  /** Lets the router read `client`; returns a detach function. */
  attachStatsigClient: (client: DatadogRouteStatsigClient) => () => void
}

export interface DatadogRouterOptions {
  /**
   * Applies a route and sends held logs. Called again whenever the route
   * changes: Statsig's network answer can replace a provisional route (cached
   * value, timeout or app exit), and a later user update can change it.
   */
  setRoute: (decision: DatadogRouteDecision) => void
  /**
   * Calls `onExit` when the app is about to stop running JavaScript (page
   * hide, app backgrounded), so held logs can still be sent. Returns an
   * unsubscribe function.
   */
  subscribeToExit: (onExit: () => void) => () => void
}

/**
 * The proxy always forwards to Datadog's log intake, so only the query is
 * sent. `parameters` is already URL-encoded, which keeps it ASCII.
 */
export function buildDatadogProxyUrl({
  parameters,
}: {
  parameters: string
}): string {
  return `${DATADOG_PROXY_ORIGIN}${PROXY_PATH}?d=${encodeBase64UrlAscii(parameters)}`
}

/**
 * Only `<source>:Recognized` reasons carry a value Statsig's server returned,
 * now or in an earlier session. `<source>:Unrecognized`, `NoValues` and
 * `Uninitialized` mean the value is the SDK's built-in `false`.
 */
export function readDatadogRoute(
  client: DatadogRouteStatsigClient,
  { logExposure = false } = {},
): DatadogRouteDecision {
  const gate = client.getFeatureGate(PROXY_GATE, {
    disableExposureLog: !logExposure,
  })
  const statsigReason = gate.details.reason
  return {
    route: gate.value ? 'proxy' : 'direct',
    source: statsigReason.endsWith(':Recognized') ? 'statsig' : 'fallback',
    statsigReason,
  }
}

/** A cached value can be stale; any other recognized value is current. */
function isCurrent(decision: DatadogRouteDecision): boolean {
  return (
    decision.source === 'statsig' &&
    !decision.statsigReason.startsWith('Cache:')
  )
}

function isSameDecision(a: DatadogRouteDecision, b: DatadogRouteDecision) {
  return (
    a.route === b.route &&
    a.source === b.source &&
    a.statsigReason === b.statsigReason
  )
}

const NO_CLIENT_DECISION: DatadogRouteDecision = {
  route: 'direct',
  source: 'fallback',
  statsigReason: 'NoClient',
}

/**
 * Sets the route once Statsig gives a value: at once from a recognized cached
 * value, which Statsig's network answer can then correct. If no value comes
 * within Statsig's timeout, or the app is about to stop running, it sets a
 * provisional route from whatever the gate reads, so held logs are sent. It
 * keeps following the gate, so a user identified later gets their own route.
 */
export function createDatadogRouter({
  setRoute,
  subscribeToExit,
}: DatadogRouterOptions): DatadogRouter {
  let client: DatadogRouteStatsigClient | null = null
  let applied: DatadogRouteDecision | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  let unsubscribeFromExit: (() => void) | undefined

  function apply(decision: DatadogRouteDecision) {
    if (!applied) {
      clearTimeout(timer)
      unsubscribeFromExit?.()
    }
    applied = decision
    setRoute(decision)
  }

  function applyFallback() {
    if (applied) {
      return
    }
    apply(client ? readDatadogRoute(client) : NO_CLIENT_DECISION)
  }

  // During server-side rendering there is no page to leave.
  if (typeof window !== 'undefined') {
    unsubscribeFromExit = subscribeToExit(applyFallback)
  }

  return {
    attachStatsigClient(nextClient) {
      client = nextClient

      const applyIfRecognized = () => {
        const decision = readDatadogRoute(nextClient)
        if (
          decision.source !== 'statsig' ||
          (applied && isSameDecision(applied, decision))
        ) {
          return
        }
        // One exposure per current value Statsig sent, not per cached read.
        if (isCurrent(decision)) {
          readDatadogRoute(nextClient, { logExposure: true })
        }
        apply(decision)
      }

      nextClient.on('values_updated', applyIfRecognized)
      applyIfRecognized()
      if (!applied && timer === undefined) {
        timer = setTimeout(
          applyFallback,
          STATSIG_NETWORK_TIMEOUT_MS + STATSIG_GRACE_MS,
        )
      }
      return () => nextClient.off('values_updated', applyIfRecognized)
    },
  }
}
