import { getResponseErrorBody } from '@funkit/api-base'

/**
 * Why no provider would price a quote, as fun-backend's `FiatNoRouteError`
 * names it.
 *
 * - A backend that predates `PROVIDER_OUTAGE` also answers an outage with
 *   `NO_CANDIDATE`, so that reason is final only when the body says so.
 */
export type FiatQuoteNoRouteKind =
  | 'NO_PROVIDER'
  | 'PROVIDER_DECLINED'
  | 'KYC_UNSERVABLE'
  | 'USER_LIMIT'
  | 'PROVIDER_OUTAGE'

export interface FiatQuoteNoRoute {
  kind: FiatQuoteNoRouteKind
  /** Whether sending the same quote request again can get a different answer. */
  retryable: boolean
}

const NO_ROUTE_KINDS: ReadonlyMap<string, FiatQuoteNoRoute> = new Map<
  string,
  FiatQuoteNoRoute
>([
  ['NO_CANDIDATE', { kind: 'NO_PROVIDER', retryable: true }],
  ['PROVIDER_DECLINED', { kind: 'PROVIDER_DECLINED', retryable: false }],
  ['KYC_INSUFFICIENT', { kind: 'KYC_UNSERVABLE', retryable: false }],
  ['KYC_REJECTED', { kind: 'KYC_UNSERVABLE', retryable: false }],
  ['USER_LIMIT', { kind: 'USER_LIMIT', retryable: false }],
  ['PROVIDER_OUTAGE', { kind: 'PROVIDER_OUTAGE', retryable: true }],
])

/**
 * Reads the backend's typed no-route refusal off a failed quote request.
 *
 * - Undefined for anything else, including a reason this build does not know:
 *   that one keeps the generic retry rather than guessing it is final.
 */
export function quoteNoRouteFromError(
  error: unknown,
): FiatQuoteNoRoute | undefined {
  const response = getResponseErrorBody(error)
  if (
    response?.errorCode !== 'FiatNoRouteError' ||
    typeof response.reason !== 'string'
  ) {
    return undefined
  }
  const known = NO_ROUTE_KINDS.get(response.reason)
  if (known === undefined || typeof response.retryable !== 'boolean') {
    return known
  }
  return { kind: known.kind, retryable: response.retryable }
}
