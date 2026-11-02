import type { QueryClient } from '@tanstack/react-query'

import { type FiatRoutingOverrides, routingOverridesKey } from './quoteRequest'
import { refreshRoutingTable } from './routingTable'

/**
 * What this session has learned about a route, held under a key that names the
 * route rather than the amount asked for. A maximum does not depend on the
 * amount, so learning it once answers every later amount on the same route.
 *
 * The record is deliberately open: the provider chosen for a route belongs here
 * too once that mapping exists, and it is keyed the same way. Adding it should
 * be a field, not a second cache.
 */
export interface RouteLimits {
  /** The most this buyer may spend on this route, as the server last said. */
  max: string
  /** The currency `max` is quoted in; a figure under another symbol is not it. */
  currency: string
}

export const ROUTE_LIMITS_SCOPE = ['fiat', 'route-limits'] as const

export interface RouteIdentity {
  apiKey: string
  userId: string
  currency: string | undefined
  paymentMethod: string
  cryptoCurrencyCode: string
  chainId: string
  geo: { alpha2?: string; region?: string } | undefined
  routingOverrides?: FiatRoutingOverrides | undefined
}

/**
 * The quote key without the amount or the per-mount scope — those are what make
 * a quote one-shot, and neither describes the route.
 */
export function routeLimitsKey(route: RouteIdentity): readonly unknown[] {
  return [
    ...ROUTE_LIMITS_SCOPE,
    route.apiKey,
    route.userId,
    route.currency ?? '',
    route.paymentMethod,
    route.cryptoCurrencyCode,
    route.chainId,
    route.geo?.alpha2 ?? '',
    route.geo?.region ?? '',
    routingOverridesKey(route.routingOverrides),
  ] as const
}

export function readRouteLimits(
  client: QueryClient,
  route: RouteIdentity,
): RouteLimits | undefined {
  return client.getQueryData<RouteLimits>(routeLimitsKey(route))
}

/**
 * Only ever narrows within a session. Two answers can be in flight for one
 * route — a corridor maximum from a priced quote and the buyer's own remaining
 * allowance from a refusal — and the lower is the one they meet first. A wider
 * figure arriving late would otherwise raise a ceiling the server still holds.
 *
 * Whatever really widened it — a completed step-up, a spent deposit, a new
 * window — clears the route instead, so the next quote teaches it afresh.
 */
export function recordRouteLimits(
  client: QueryClient,
  route: RouteIdentity,
  observed: RouteLimits,
): void {
  if (observed.max.trim() === '') {
    return
  }
  const max = Number(observed.max)
  if (!Number.isFinite(max) || max < 0) {
    return
  }
  const key = routeLimitsKey(route)
  const held = client.getQueryData<RouteLimits>(key)
  if (
    held !== undefined &&
    held.currency === observed.currency &&
    Number(held.max) <= max
  ) {
    return
  }
  client.setQueryData<RouteLimits>(key, observed)
}

export interface RouteMinimum {
  min: string
  currency: string
}

function routeMinimumKey(route: RouteIdentity): readonly unknown[] {
  return [...routeLimitsKey(route), 'minimum'] as const
}

const ROUTE_MINIMUM_FRESHNESS_MS = 60_000

export function readRouteMinimum(
  client: QueryClient,
  route: RouteIdentity,
): RouteMinimum | undefined {
  const state = client.getQueryState<RouteMinimum>(routeMinimumKey(route))
  if (
    state?.data === undefined ||
    Date.now() - state.dataUpdatedAt >= ROUTE_MINIMUM_FRESHNESS_MS
  ) {
    return undefined
  }
  return state.data
}

export function recordRouteMinimum(
  client: QueryClient,
  route: RouteIdentity,
  observed: RouteMinimum,
): void {
  const min = Number(observed.min)
  if (observed.min.trim() === '' || !Number.isFinite(min) || min <= 0) {
    return
  }
  client.setQueryData<RouteMinimum>(routeMinimumKey(route), observed)
}

/** Every route this session had learned. The next quote teaches them again. */
export function forgetRouteLimits(client: QueryClient): void {
  client.removeQueries({ queryKey: ROUTE_LIMITS_SCOPE })
  refreshRoutingTable(client)
}
