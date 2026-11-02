/**
 * Verbs the `/fiat/*` surface uses. Mirrors the contract's `HTTP_VERBS`.
 * Deliberately not imported from `@fun-xyz/fiat-contract`: this package is a
 * transport and stays free of the contract so it never inherits its
 * dependencies or its release cadence.
 */
export const FIAT_HTTP_VERBS = ['GET', 'POST'] as const

export type FiatHttpVerb = (typeof FIAT_HTTP_VERBS)[number]

/** A read: nothing to de-duplicate, so no idempotency key. */
export type FiatReadEndpoint = `GET /fiat/${string}`

/** A write: retries can double-charge, so a key is mandatory. */
export type FiatWriteEndpoint = `POST /fiat/${string}`

/**
 * A transition's endpoint, verb included: `"POST /fiat/quote"`,
 * `"GET /fiat/orders/o_31c"`. Envelopes carry the whole string, so the
 * transport takes it whole rather than making every caller split it.
 */
export type FiatEndpointString = FiatReadEndpoint | FiatWriteEndpoint

/** Narrows a server-supplied endpoint to the write arm of the params union. */
export function isFiatWriteEndpoint(
  endpoint: string,
): endpoint is FiatWriteEndpoint {
  return endpoint.startsWith('POST /fiat/')
}

export interface FiatEndpointParts {
  method: FiatHttpVerb
  /** Leading-slash path plus any query string, `API_BASE_URL` not included. */
  path: string
}

/** `{...transition.params, ...collected inputs, ...injected expects}`. */
type FiatRequestBody = object

/**
 * Split by verb so the type carries the rule the transport enforces: a write
 * cannot be expressed without an idempotency key. The endpoint arrives off a
 * server-supplied envelope, so a dynamic caller narrows it first with
 * {@link isFiatWriteEndpoint} — that branch is the price of the guarantee.
 */
export type SendFiatTransitionParams =
  | {
      endpoint: FiatReadEndpoint
      body?: FiatRequestBody
      /** Reads are not de-duplicated; passing one is a mistake, not an option. */
      idempotencyKey?: never
    }
  | {
      endpoint: FiatWriteEndpoint
      body?: FiatRequestBody
      /**
       * One key per transition-fire, reused across retries of that same fire
       * and rotated on a new one, so a retried POST cannot double-charge.
       */
      idempotencyKey: string
    }

/**
 * A client feature the server may only use once a request declares it, sent as
 * `X-Fun-Client-Capabilities`. An older client never names a newer one.
 * - `payment_sheet_first`: opens Stripe's Apple Pay sheet before an l0 round whose params ask for it
 */
export type FiatClientCapability = 'payment_sheet_first'
