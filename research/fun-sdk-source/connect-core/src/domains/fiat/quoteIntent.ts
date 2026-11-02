import { randomUuid } from '~/utils/randomUuid'

/** Why the buyer is shown a new price. */
export type FiatQuoteReason =
  | 'amount_changed'
  | 'expired'
  | 'fun_session'
  | 'kyc_requote'
  | 'provider_failover'
  | 'retry'

/**
 * The price the screen asks for. Only an event replaces it, and a new one is a
 * new price: its scope keys the quote, so nothing has to be dropped or remounted.
 */
export interface FiatQuoteIntent {
  /** Unique per intent: a quoteRef is transaction state, so it cannot cross a flow boundary. */
  scope: string
  reason: FiatQuoteReason
}

export function quoteIntent(reason: FiatQuoteReason): FiatQuoteIntent {
  return { scope: randomUuid(), reason }
}

/** What sent a quote request: the intent itself, or a change under it. */
export type FiatQuoteRequestCause =
  | FiatQuoteReason
  /** Geo, currency, provider set or table changed under the same intent and amount. */
  | 'inputs_changed'
  /** The same request again: expiry, reconnect or a retry. */
  | 'refetch'

export interface FiatQuoteRequest {
  scope: string
  amount: string
  /** The query's hash: the whole request. */
  hash: string
}

export function quoteRequestCause(
  previous: FiatQuoteRequest | undefined,
  next: FiatQuoteRequest,
  reason: FiatQuoteReason,
): FiatQuoteRequestCause {
  if (previous === undefined || previous.scope !== next.scope) {
    return reason
  }
  if (previous.amount !== next.amount) {
    return 'amount_changed'
  }
  return previous.hash === next.hash ? 'refetch' : 'inputs_changed'
}
