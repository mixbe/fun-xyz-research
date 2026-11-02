import type {
  DestinationAsset as FiatDestinationAsset,
  FiatProvider,
} from '@fun-xyz/fiat-contract/types'
import { getResponseErrorBody } from '@funkit/api-base'
import { FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO } from '@funkit/chains'

/** Starts a fiat flow before the backend has supplied any transitions. */
export const QUOTE_ENDPOINT = 'POST /fiat/quote'

export const ORDER_ENDPOINT = 'POST /fiat/orders'

/**
 * Authorises the payment method before any order exists — the capture-first
 * rail's way in, per `TRANSITION_TABLE['QUOTE']`. It returns PAYMENT{CAPTURE}
 * carrying the surface, so the tap is a payment even though it is not the
 * order call.
 */
export const PAYMENT_SESSION_ENDPOINT = 'POST /fiat/payment-session'

/** Opens a provider session; emitted when there is no valid session token. */
export const SESSION_ENDPOINT = 'POST /fiat/session'

/**
 * The endpoints a paying tap can land on. A session-first provider mints the
 * order behind its session, so it needs the delivery address too.
 */
export const PAY_ENDPOINTS: readonly string[] = [
  ORDER_ENDPOINT,
  PAYMENT_SESSION_ENDPOINT,
]

/**
 * The geo lookup's own answer, forwarded in its field names rather than
 * remapped — the endpoint takes what the client already holds.
 */
export interface QuoteGeo {
  /** ISO 3166-1 alpha-2 of the buyer, e.g. `AU`. */
  alpha2: string
  /** ISO 3166-2 subdivision without the country prefix, e.g. `TX`. */
  region?: string
}

/**
 * Narrows which providers the backend may route this quote to.
 *
 * - Test tooling. Every backend accepts it, production included, so a
 *   customer app that ships it pinned routes its own buyers to those providers only.
 * - Omitted means ordinary routing; an empty list allows no provider at all.
 */
export interface FiatRoutingOverrides {
  providers: readonly FiatProvider[]
}

/**
 * Stable key fragment for {@link FiatRoutingOverrides}; absent and empty stay
 * distinct. Sorted here only: the backend reads the list as a set, so a
 * reordering is the same request and must not cost a round trip. The wire
 * value is sent as given.
 */
export function routingOverridesKey(
  overrides: FiatRoutingOverrides | undefined,
): string {
  if (overrides === undefined) {
    return ''
  }
  // A JS host can pass `{}` or misspell `providers`; the key must not throw
  // for that, so the request goes out and the backend refuses it visibly.
  const providers = Array.isArray(overrides.providers)
    ? overrides.providers
    : []
  return `[${[...providers].sort().join(',')}]`
}

export interface QuoteRequest {
  /** ISO 4217, e.g. `USD`. */
  fiatCurrency: string
  /** Plain decimal string, above zero. */
  fiatAmount: string
  /** Token ticker, e.g. `USDC`. */
  cryptoCurrencyCode: string
  /** Destination chain id, decimal string. */
  chainId: string
  /** Payment method category, e.g. `apple_pay`. */
  paymentMethodId: string
  /**
   * Where the buyer is. Required: no provider prices without it, and omitting
   * it returns "geo is required and must be the geo endpoint's response
   * object."
   */
  geo: QuoteGeo
  /** Test tooling; see {@link FiatRoutingOverrides}. */
  routingOverrides?: FiatRoutingOverrides
  /** Ask capable providers to return an auth surface with the quote when terms are accepted. */
  prepareSessionAuth?: true
  /** The asset the buyer ends up with; the backend swaps into it when the rail buys something else. */
  destinationAsset?: FiatDestinationAsset
  /**
   * Providers whose own flow this client can run. When the winner is one of
   * them, the response carries `handoff` and no transitions.
   */
  handoffs?: readonly FiatProvider[]
  /** Providers this quote must not route to: their own flow already ended with `REQUOTE`. */
  excludeProviders?: readonly FiatProvider[]
  /**
   * Mode 2 (Fun login): the recipient the app chose, which the backend uses to answer
   * conversion routes and fee subsidies. Typed here until connect-core pins fiat-contract 0.46.0.
   */
  depositAddress?: string
}

export interface FiatQuoteMinimum {
  amount: string
  currency: string
}

/**
 * The ceiling a refused quote reported. It is not the corridor's maximum: the
 * backend narrows it to this buyer's own remaining allowance when a provider
 * measured one that cannot be raised, so it is the number that actually
 * refused them and the one an amount below will clear.
 */
export interface FiatQuoteMaximum {
  amount: string
  currency: string
}

// Plain decimals only — `Number` alone would admit `0x10`, `1e3`, `+10` and
// `Infinity` into requests and into the "same amount" rule. Each alternative
// is unambiguous (digits before the dot live in one quantifier), so matching
// stays linear — CodeQL flagged the earlier `\d+\.?\d*` as polynomial.
const DECIMAL_AMOUNT = /^(?:\d+(?:\.\d*)?|\.\d+)$/

// Longer than any representable amount; keeps the regex off adversarial input.
const MAX_AMOUNT_LENGTH = 32

const DECIMAL_CHAIN_ID = /^(?:0|[1-9]\d*)$/

function parseAmount(amount: string): number | undefined {
  if (amount.length > MAX_AMOUNT_LENGTH || !DECIMAL_AMOUNT.test(amount)) {
    return undefined
  }
  const value = Number(amount)
  return Number.isFinite(value) ? value : undefined
}

/** Extracts the actionable limit from the backend's typed quote refusal. */
export function quoteMinimumFromError(
  error: unknown,
): FiatQuoteMinimum | undefined {
  const response = getResponseErrorBody(error)
  if (
    response?.errorCode !== 'FiatAmountBelowMinimumError' ||
    typeof response.minFiatAmount !== 'string' ||
    typeof response.fiatCurrencyCode !== 'string' ||
    parseAmount(response.minFiatAmount) === undefined ||
    response.fiatCurrencyCode.length === 0
  ) {
    return undefined
  }
  return {
    amount: response.minFiatAmount,
    currency: response.fiatCurrencyCode,
  }
}

/**
 * Extracts the actionable ceiling from the backend's typed quote refusal.
 *
 * The sibling of {@link quoteMinimumFromError}, and read the same way: the
 * amount is only actionable because lowering it can clear the refusal, which
 * is what separates this response from the generic "nobody can price that".
 */
export function quoteMaximumFromError(
  error: unknown,
): FiatQuoteMaximum | undefined {
  const response = getResponseErrorBody(error)
  if (
    response?.errorCode !== 'FiatAmountAboveMaximumError' ||
    typeof response.maxFiatAmount !== 'string' ||
    typeof response.fiatCurrencyCode !== 'string' ||
    parseAmount(response.maxFiatAmount) === undefined ||
    response.fiatCurrencyCode.length === 0
  ) {
    return undefined
  }
  return {
    amount: response.maxFiatAmount,
    currency: response.fiatCurrencyCode,
  }
}

/** Compares decimal amounts while allowing formatting differences. */
export function sameAmount(a: string, b: string): boolean {
  const left = parseAmount(a)
  const right = parseAmount(b)
  if (left === undefined || right === undefined) {
    return false
  }
  return left === right
}

/**
 * Nothing this rail sells costs more — anything larger is a typo or an
 * injection attempt, and bounding it here keeps junk out of request bodies
 * rather than letting the server be the first to object.
 */
export const MAX_QUOTE_AMOUNT = 1_000_000

// Fiat minor units stop at two decimals; a longer fraction is not an amount
// a person typed.
const MAX_FRACTION_DIGITS = 2

/** An amount worth quoting: a plain decimal above zero, bounded, ≤ 2dp. */
export function isQuotableAmount(amount: string): boolean {
  const value = parseAmount(amount)
  if (value === undefined || value <= 0 || value > MAX_QUOTE_AMOUNT) {
    return false
  }
  const fraction = amount.split('.')[1] ?? ''
  return fraction.length <= MAX_FRACTION_DIGITS
}

/**
 * The canonical spelling of a quotable amount, or `undefined` if it is not one.
 *
 * - The keypad sends what was typed, so `20.`, `.5` and `020` are a buyer
 *   mid-entry; fun-backend#4950 makes the quote endpoint 400 on them (ENG-6517).
 * - Spellings of one amount (`20.`, `20.0`, `20`) share a cache key, so
 *   pausing mid-entry keeps the quote rather than re-quoting.
 */
export function toQuoteAmount(amount: string): string | undefined {
  if (!isQuotableAmount(amount)) {
    return undefined
  }
  const [whole = '', fraction = ''] = amount.split('.')
  // No regex: CodeQL flags zero-stripping patterns as polynomial. The whole
  // part is ≤ MAX_QUOTE_AMOUNT, so `Number` is exact.
  const integer = String(Number(whole))
  let end = fraction.length
  while (end > 0 && fraction[end - 1] === '0') {
    end--
  }
  const decimals = fraction.slice(0, end)
  return decimals.length > 0 ? `${integer}.${decimals}` : integer
}

/**
 * A location worth quoting: one that names a country. A US buyer also needs a
 * state — pricing is per-state licensing — but that is the server's refusal to
 * give, not ours to pre-empt. Holding the request back instead leaves the
 * screen on a spinner that never resolves, which is worse than the answer.
 */
export function isQuotableGeo(geo: QuoteGeo | undefined): boolean {
  return geo !== undefined && geo.alpha2.length > 0
}

/** A quote the server will refuse for want of a state. Worth saying out loud. */
export function isUnpriceableUsGeo(geo: QuoteGeo | undefined): boolean {
  return geo?.alpha2 === 'US' && (geo.region ?? '').length === 0
}

/** Accepts canonical IDs from FunKit's supported-chain registry. */
export function isSupportedQuoteChainId(chainId: string): boolean {
  if (!DECIMAL_CHAIN_ID.test(chainId)) {
    return false
  }
  const numericChainId = Number(chainId)
  return (
    Number.isSafeInteger(numericChainId) &&
    FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[numericChainId] !== undefined
  )
}

/**
 * A submission there is no point replaying: the terms it names are gone.
 *
 * - Every `/fiat/*` transition is scoped to a quoteRef, and a retry re-sends
 *   the body its idempotency key was minted with — the same dead reference.
 *   The way out is a new quote, not another send.
 * - The status alone is not enough. A 404 is also how the backend refuses a
 *   provider that declined, so the server's own sentence is what decides.
 * - Read off `type` rather than `instanceof`: a host that ends up with two
 *   copies of `@funkit/utils` fails the identity check on the same error.
 */
export function isStaleQuoteFailure(error: unknown): boolean {
  if (
    !(error instanceof Error) ||
    (error as { type?: unknown }).type !== RESOURCE_NOT_FOUND
  ) {
    return false
  }
  // `rawMessage` is the server's `errorMsg`; `message` embeds the whole
  // payload, and carries it for an error shaped by something other than
  // api-base.
  const said = `${(error as { rawMessage?: unknown }).rawMessage ?? ''} ${error.message}`
  return said.toLowerCase().includes(EXPIRED_QUOTE)
}

/** `ErrorType.ResourceNotFound`, which is what api-base throws on a 404. */
const RESOURCE_NOT_FOUND = 'ResourceNotFound'
/** The backend's wording, less the sentence around it. */
const EXPIRED_QUOTE = 'quote has expired'
