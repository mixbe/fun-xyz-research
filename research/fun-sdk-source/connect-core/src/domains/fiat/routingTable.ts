import type {
  FiatRoutingTableResponse,
  RoutingAmountErrorBody,
  RoutingNoRouteErrorBody,
  RoutingProvider,
  RoutingTableInterval,
  RoutingTableMethod,
  RoutingUnavailableReason,
} from '@fun-xyz/fiat-contract/routing'
import { ROUTING_ENDPOINTS } from '@fun-xyz/fiat-contract/routing'
import type {
  DestinationAsset as FiatDestinationAsset,
  FiatProvider,
} from '@fun-xyz/fiat-contract/types'
import { getResponseErrorBody } from '@funkit/api-base'
import { isRecord } from '@funkit/utils'
import type { QueryClient } from '@tanstack/react-query'

import type { QuoteGeo, QuoteRequest } from './quoteRequest'

export const ROUTING_QUOTE_ENDPOINT = ROUTING_ENDPOINTS.quote

export const ROUTING_TABLE_SCOPE = ['fiat', 'routing-table'] as const

/** The table's currency when the query names none. */
const TABLE_DEFAULT_CURRENCY = 'USD'

/** `POST /fiat/quote`'s body with the one provider to price in place of the overrides. */
export type RoutingQuoteRequest = Omit<QuoteRequest, 'routingOverrides'> & {
  provider: RoutingProvider
  /** Ask the backend to open Coinbase's Apple Pay payment session with the quote. */
  preparePaymentSession?: true
  /** The table's Stripe `limitRead`, so the server skips reading it again. It takes no other provider's. */
  providerInputs?: { STRIPE: { limitRead: OpaqueLimitRead } }
}

/** A provider's limit read as the table returned it: the server's own record, sent back unchanged. */
export type OpaqueLimitRead = Readonly<Record<string, unknown>>

// TODO: read `limitRead` from the fiat-contract type once it carries the field.
/** The limit read the table's probe made for `provider` in this interval; anything but a record is not one. */
export function limitReadOf(
  interval: RoutingTableInterval,
  provider: RoutingProvider,
): OpaqueLimitRead | undefined {
  const entry: unknown = interval.providers.find(
    (candidate) => candidate.provider === provider,
  )
  if (!isRecord(entry)) {
    return undefined
  }
  const read = entry.limitRead
  return isRecord(read) && !Array.isArray(read) ? read : undefined
}

/**
 * Marks the table stale without fetching it, so the remount that follows fetches it once.
 * Fetching here too would spend a request the remount's unmount then aborts.
 */
export function refreshRoutingTable(client: QueryClient): void {
  void client.invalidateQueries({
    queryKey: ROUTING_TABLE_SCOPE,
    refetchType: 'none',
  })
}

/**
 * Drops the held table, so the remount that follows routes only once a fresh one lands. A stale
 * table keeps routing until its deadline, and a query disabled while the flow holds a step is not
 * refetched, so a caller that must not route on the old table forgets it instead.
 */
export function forgetRoutingTable(client: QueryClient): void {
  client.removeQueries({ queryKey: ROUTING_TABLE_SCOPE })
}

// TODO: import the POST request types from fiat-contract once 0.27.0 is published.
export interface RoutingTableProviderInputs {
  MOONPAY?: { accessToken?: string }
}

/** The backend schema is strict, so an unknown field fails every table. */
export interface RoutingTableRequestBody {
  fiatCurrencyCode?: string
  cryptoCurrencyCode: string
  chainId: string
  country: string
  region?: string
  methods: string[]
  providers?: RoutingTableProviderInputs
  destinationAsset?: FiatDestinationAsset
  /**
   * Mode 2 (Fun login): the recipient the app chose, which the backend uses to answer
   * conversion routes and fee subsidies. Typed here until connect-core pins fiat-contract 0.46.0.
   */
  depositAddress?: string
}

export const ROUTING_TABLE_ENDPOINT = 'POST /fiat/routing/table' as const

export function routingTableRequest({
  currency,
  cryptoCurrencyCode,
  chainId,
  geo,
  paymentMethod,
  providers,
  destinationAsset,
  depositAddress,
}: {
  currency: string
  cryptoCurrencyCode: string
  chainId: string
  geo: QuoteGeo
  paymentMethod: string
  providers?: RoutingTableProviderInputs
  destinationAsset: FiatDestinationAsset | undefined
  depositAddress?: string
}): RoutingTableRequestBody {
  const body: RoutingTableRequestBody = {
    cryptoCurrencyCode,
    chainId,
    country: geo.alpha2,
    methods: [paymentMethod],
  }
  if (currency !== TABLE_DEFAULT_CURRENCY) {
    body.fiatCurrencyCode = currency
  }
  if (geo.region) {
    body.region = geo.region
  }
  if (providers !== undefined) {
    body.providers = providers
  }
  if (destinationAsset !== undefined) {
    body.destinationAsset = destinationAsset
  }
  if (depositAddress !== undefined) {
    body.depositAddress = depositAddress
  }
  return body
}

const CENTS_AMOUNT = /^(\d+)(?:\.(\d{1,2}))?$/
const MAX_AMOUNT_LENGTH = 32

/** Integer cents, so interval edges compare exactly; undefined past two decimals. */
export function toCents(amount: string): number | undefined {
  const match =
    amount.length > MAX_AMOUNT_LENGTH ? null : CENTS_AMOUNT.exec(amount)
  if (match === null) {
    return undefined
  }
  const [, whole = '', fraction = ''] = match
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(cents) ? cents : undefined
}

/** Where an amount falls against a method's intervals. */
export type RoutingPlacement =
  | { kind: 'INSIDE'; interval: RoutingTableInterval }
  | { kind: 'BELOW'; min: string }
  | { kind: 'ABOVE'; max: string }
  /** Between two intervals: the lower one's `max` and the upper one's `min`. */
  | { kind: 'GAP'; max: string; min: string }

/** What the table path does with a provider; one with none is quoted in table order. */
export type ProviderStatus = 'EXCLUDED' | 'DEFERRED'

export interface ProviderDisposition {
  status: ProviderStatus
  /** Why, for the decision log, such as a failover cause or the wallet's cards. */
  reason: string
}

/**
 * One disposition per provider, so a provider is excluded or deferred, never
 * both. The legacy `POST /fiat/quote` path takes no order: the caller turns
 * this into its allow-list.
 */
export type ProviderSelection = Readonly<
  Partial<Record<FiatProvider, ProviderDisposition>>
>

export const NO_PROVIDER_SELECTION: ProviderSelection = {}

export function statusOf(
  selection: ProviderSelection,
  provider: FiatProvider,
): ProviderStatus | undefined {
  return selection[provider]?.status
}

export function excludedProvidersOf(
  selection: ProviderSelection,
): FiatProvider[] {
  return (Object.keys(selection) as FiatProvider[]).filter(
    (provider) => statusOf(selection, provider) === 'EXCLUDED',
  )
}

/** An interval's providers in the order they are quoted; each part keeps the table's order. */
export function quoteOrder(
  interval: RoutingTableInterval,
  selection: ProviderSelection,
): RoutingProvider[] {
  const eligible = interval.providers
    .map((entry) => entry.provider)
    .filter((provider) => statusOf(selection, provider) !== 'EXCLUDED')
  return [
    ...eligible.filter(
      (provider) => statusOf(selection, provider) !== 'DEFERRED',
    ),
    ...eligible.filter(
      (provider) => statusOf(selection, provider) === 'DEFERRED',
    ),
  ]
}

/** Below every interval names its minimum, above every one its maximum, and a gap both edges. */
export function placeAmount(
  intervals: readonly RoutingTableInterval[],
  amount: string,
): RoutingPlacement | undefined {
  const cents = toCents(amount)
  if (cents === undefined) {
    return undefined
  }
  let previous: RoutingTableInterval | undefined
  for (const interval of intervals) {
    const min = toCents(interval.min)
    const max = toCents(interval.max)
    if (min === undefined || max === undefined) {
      return undefined
    }
    if (cents <= max) {
      if (cents >= min) {
        return { kind: 'INSIDE', interval }
      }
      if (previous === undefined) {
        return { kind: 'BELOW', min: interval.min }
      }
      return { kind: 'GAP', max: previous.max, min: interval.min }
    }
    previous = interval
  }
  return previous === undefined
    ? undefined
    : { kind: 'ABOVE', max: previous.max }
}

/**
 * The least an amount must be raised to once every provider of its interval is in
 * `excludedProviders`: the `min` of the nearest interval above with a provider left. Undefined
 * while the interval still has one, or when none above does.
 *
 * - Up, never down: a lower interval would only serve a smaller deposit than the one asked for.
 */
export function nextServedMinimum(
  intervals: readonly RoutingTableInterval[],
  interval: RoutingTableInterval,
  excludedProviders: readonly string[],
): string | undefined {
  const isServed = (candidate: RoutingTableInterval) =>
    candidate.providers.some(
      (entry) => !excludedProviders.includes(entry.provider),
    )
  if (isServed(interval)) {
    return undefined
  }
  const index = intervals.indexOf(interval)
  if (index === -1) {
    return undefined
  }
  return intervals.slice(index + 1).find(isServed)?.min
}

/**
 * The most this buyer can deposit with the method now, without another auth or KYC step: the
 * highest `currentLimit` a provider not in `excludedProviders` states. A limit counts only where it lands in an interval that
 * provider serves, so a cap under its minimum is never offered. Unknown limits are left out, so the
 * figure is a floor some provider serves today; undefined when none is stated.
 */
export function practicalMaximumOf(
  table: FiatRoutingTableResponse | undefined,
  paymentMethod: string,
  excludedProviders: readonly string[] = [],
): string | undefined {
  const intervals =
    table?.methods.find((entry) => entry.method === paymentMethod)?.intervals ??
    []
  let best: { cents: number; amount: string } | undefined
  for (const interval of intervals) {
    for (const entry of interval.providers) {
      if (excludedProviders.includes(entry.provider)) {
        continue
      }
      // Typed `string | null`, but `parseRoutingTable` doesn't check it: an older backend omits it.
      const amount = entry.currentLimit
      if (typeof amount !== 'string') {
        continue
      }
      const cents = toCents(amount)
      if (cents === undefined || (best !== undefined && cents <= best.cents)) {
        continue
      }
      const placement = placeAmount(intervals, amount)
      const isServed =
        placement?.kind === 'INSIDE' &&
        placement.interval.providers.some(
          (served) => served.provider === entry.provider,
        )
      if (isServed) {
        best = { cents, amount }
      }
    }
  }
  return best?.amount
}

/** Which quote path the amount screen takes. */
export type RoutingMode =
  | { kind: 'LEGACY' }
  | { kind: 'PENDING' }
  /** Nothing to quote: `error` stands in for the quote's own refusal. */
  | {
      kind: 'UNROUTED'
      reason: 'TABLE_FAILED' | 'METHOD_UNAVAILABLE'
      error: unknown
    }
  | { kind: 'TABLE'; method: RoutingTableMethod }

/** `NOT_SERVED` or no reason at all is the quote's `NO_CANDIDATE`. */
function noRouteReason(
  reason: Exclude<RoutingUnavailableReason, 'USER_LIMIT'> | undefined,
): Exclude<RoutingNoRouteErrorBody['reason'], 'USER_LIMIT'> {
  if (reason === undefined || reason === 'NOT_SERVED') {
    return 'NO_CANDIDATE'
  }
  return reason
}

/**
 * The `FiatNoRouteError` `POST /fiat/quote` sends when no provider serves the
 * method, so the quote's own parsers read it.
 */
export function unroutedMethodRefusal(
  reason: RoutingUnavailableReason | undefined,
): Error & { responseBody: RoutingNoRouteErrorBody } {
  const responseBody: RoutingNoRouteErrorBody =
    reason === 'USER_LIMIT'
      ? {
          errorCode: 'FiatNoRouteError',
          errorMsg: 'Your current provider limits do not allow this purchase.',
          reason,
          code: 'LIMITS_EXCEEDED',
          recovery: 'REQUOTE',
          serviceableRanges: [],
          retryable: false,
        }
      : {
          errorCode: 'FiatNoRouteError',
          errorMsg: 'No provider can price that purchase right now.',
          reason: noRouteReason(reason),
          serviceableRanges: [],
          retryable: reason === 'PROVIDER_OUTAGE',
        }
  return Object.assign(new Error(responseBody.errorMsg), { responseBody })
}

/** A failed table, or a method it leaves no interval, quotes nothing. */
export function routingModeFor({
  isEnabled,
  tableError,
  table,
  paymentMethod,
}: {
  isEnabled: boolean
  /** The failed table request's error; undefined while none has failed. */
  tableError: unknown
  table: FiatRoutingTableResponse | undefined
  paymentMethod: string
}): RoutingMode {
  if (!isEnabled) {
    return { kind: 'LEGACY' }
  }
  if (tableError !== undefined) {
    return { kind: 'UNROUTED', reason: 'TABLE_FAILED', error: tableError }
  }
  if (table === undefined) {
    return { kind: 'PENDING' }
  }
  const method = table.methods.find((entry) => entry.method === paymentMethod)
  if (method === undefined || method.intervals.length === 0) {
    return {
      kind: 'UNROUTED',
      reason: 'METHOD_UNAVAILABLE',
      error: unroutedMethodRefusal(method?.unavailableReason),
    }
  }
  return { kind: 'TABLE', method }
}

type FallThroughErrorCode =
  | RoutingNoRouteErrorBody['errorCode']
  | RoutingAmountErrorBody['errorCode']

const FALL_THROUGH_ERROR_CODES: ReadonlySet<string> =
  new Set<FallThroughErrorCode>([
    'FiatNoRouteError',
    'FiatAmountBelowMinimumError',
    'FiatAmountAboveMaximumError',
  ])

/** A refusal that is the named provider's alone, so the next one may still price. */
export function isFallThroughRefusal(error: unknown): boolean {
  const errorCode = getResponseErrorBody(error)?.errorCode
  return (
    typeof errorCode === 'string' && FALL_THROUGH_ERROR_CODES.has(errorCode)
  )
}

/** A payment method's routing-table intervals, with this buyer's selection over their providers. */
export interface ProviderRoute {
  intervals: readonly RoutingTableInterval[]
  selection: ProviderSelection
}

/** Where an amount lands on a route, and who quotes it there. */
export interface AmountRoute {
  placement: RoutingPlacement
  /** The interval's providers in quote order; none outside an interval. */
  providers: RoutingProvider[]
  /** Once the selection excludes every provider of the interval: the least amount one above serves. */
  nextMinimum?: string
}

/** The one place a route is read: placement, quote order and the way past an exhausted interval. */
export function routeAmount(
  route: ProviderRoute,
  amount: string,
): AmountRoute | undefined {
  const placement = placeAmount(route.intervals, amount)
  if (placement === undefined) {
    return undefined
  }
  if (placement.kind !== 'INSIDE') {
    return { placement, providers: [] }
  }
  const nextMinimum = nextServedMinimum(
    route.intervals,
    placement.interval,
    excludedProvidersOf(route.selection),
  )
  return {
    placement,
    providers: quoteOrder(placement.interval, route.selection),
    ...(nextMinimum === undefined ? {} : { nextMinimum }),
  }
}

/**
 * TEMPORARY: the backend takes this failover over once it accepts the ordered
 * list. Quotes each provider in turn past a fall-through refusal; any other
 * failure, or the last provider's refusal, is thrown.
 */
export async function quoteThroughProviders<T>(
  providers: readonly RoutingProvider[],
  quote: (provider: RoutingProvider, attempt: number) => Promise<T>,
  onFallThrough: (
    from: RoutingProvider,
    to: RoutingProvider,
    error: unknown,
  ) => void,
): Promise<T> {
  for (const [attempt, provider] of providers.entries()) {
    try {
      return await quote(provider, attempt)
    } catch (error) {
      const next = providers[attempt + 1]
      if (next === undefined || !isFallThroughRefusal(error)) {
        throw error
      }
      onFallThrough(provider, next, error)
    }
  }
  throw new Error('Routing interval has no provider to quote')
}

function isInterval(value: unknown): value is RoutingTableInterval {
  if (!isRecord(value) || !Array.isArray(value.providers)) {
    return false
  }
  const min = typeof value.min === 'string' ? toCents(value.min) : undefined
  const max = typeof value.max === 'string' ? toCents(value.max) : undefined
  return (
    min !== undefined &&
    max !== undefined &&
    min <= max &&
    value.providers.length > 0 &&
    value.providers.every(
      (entry) => isRecord(entry) && typeof entry.provider === 'string',
    )
  )
}

function isMethod(value: unknown): value is RoutingTableMethod {
  if (
    !isRecord(value) ||
    typeof value.method !== 'string' ||
    !Array.isArray(value.intervals) ||
    !value.intervals.every(isInterval)
  ) {
    return false
  }
  // `placeAmount` walks them in order, so an unsorted list is unusable.
  const intervals: RoutingTableInterval[] = value.intervals
  return intervals.every((interval, index) => {
    const previous = intervals[index - 1]
    return (
      previous === undefined ||
      (toCents(interval.min) ?? 0) > (toCents(previous.max) ?? Infinity)
    )
  })
}

/**
 * Whether the table predicts this buyer's next order has its fee reimbursed.
 * Absent reads as no. Typed locally until the SDK takes fiat-contract 0.39.
 */
export function isFeeSubsidized(
  table: FiatRoutingTableResponse | undefined,
): boolean {
  const { feeSubsidy } = (table ?? {}) as {
    feeSubsidy?: { subsidized?: unknown }
  }
  return feeSubsidy?.subsidized === true
}

/**
 * Each checkout's waiver, as its latest table that decided one said. A failover quoting off the
 * table, a capability that re-keys it, or a table that leaves the field off keeps it.
 */
export function checkoutFeeSubsidyKey(checkoutId: string | undefined) {
  return ['fiat', 'checkout-fee-subsidy', checkoutId ?? ''] as const
}

/** The table's waiver, or undefined when it leaves the field off (a failed or capped decision). */
export function feeSubsidyDecisionOf(
  table: FiatRoutingTableResponse,
): boolean | undefined {
  const { feeSubsidy } = table as { feeSubsidy?: { subsidized?: unknown } }
  return feeSubsidy === undefined ? undefined : isFeeSubsidized(table)
}

/** Checks the fields this client reads; throws on anything it cannot route with. */
export function parseRoutingTable(value: unknown): FiatRoutingTableResponse {
  if (
    !isRecord(value) ||
    typeof value.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(value.expiresAt)) ||
    !Array.isArray(value.methods) ||
    !value.methods.every(isMethod)
  ) {
    throw new Error('Routing table response is malformed')
  }
  return value as unknown as FiatRoutingTableResponse
}
