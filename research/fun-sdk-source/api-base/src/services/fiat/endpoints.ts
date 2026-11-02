import {
  AccessDeniedError,
  ErrorCode,
  InvalidParameterError,
  ThrottlingError,
} from '@funkit/utils'
import type { AttemptContext } from '@lifeomic/attempt'
import type { BaseApiRequest } from '../../consts'
import { API_BASE_URL } from '../../consts'
import { getResponseErrorBody, sendRequest } from '../../utils'
import { errorAbortHandler } from '../../utils/error'
import type {
  FiatClientCapability,
  FiatEndpointParts,
  FiatHttpVerb,
  SendFiatTransitionParams,
} from './types'

export function isFiatAuthenticationError(error: unknown): boolean {
  return (
    error instanceof AccessDeniedError &&
    error.code === ErrorCode.AuthenticationRequired
  )
}

/**
 * Both fiat 429s carry `retryAfterSeconds`: a login's budget names what is left of its window, and
 * the busy verification guard always 1 s, which a transport retry of a failed check runs into.
 */
const BUSY_RETRY_AFTER_SECONDS = 1

/** The backend's per-login rate limit (429) on a fiat route: a 429 that names a wait over 1 s. */
export function isFiatRateLimitError(error: unknown): boolean {
  return getFiatRetryAfterSeconds(error) !== undefined
}

/** Seconds until a fiat rate limit's window resets; undefined for any other error. */
export function getFiatRetryAfterSeconds(error: unknown): number | undefined {
  if (!(error instanceof ThrottlingError)) {
    return undefined
  }
  const seconds = getResponseErrorBody(error)?.retryAfterSeconds
  return typeof seconds === 'number' &&
    Number.isFinite(seconds) &&
    seconds > BUSY_RETRY_AFTER_SECONDS
    ? seconds
    : undefined
}

// - Retrying the same rejected assertion cannot recover
// - On a transition the limit counts the retry too, so it only spends the next slot
function abortUnrecoverable(
  abortOn429: boolean,
  onAttemptFailed: ((error: Error) => void) | undefined,
) {
  return (error: Error, context: AttemptContext) => {
    try {
      onAttemptFailed?.(error)
    } catch {
      // A listener that throws must not replace the request's own error.
    }
    errorAbortHandler(error, context)
    if (
      isFiatAuthenticationError(error) ||
      (abortOn429 && isFiatRateLimitError(error))
    ) {
      context.abort()
    }
  }
}

const FIAT_ENDPOINT_PATTERN = /^(GET|POST) (\/fiat\/\S*)$/

/** Parses and validates a backend-supplied fiat endpoint. */
export function parseFiatEndpoint(endpoint: string): FiatEndpointParts {
  const match = FIAT_ENDPOINT_PATTERN.exec(endpoint)
  const path = match?.[2]
  // Query values may legitimately contain two periods.
  const pathSegment = path?.split('?')[0]

  if (!match || !path || pathSegment?.includes('..')) {
    throw new InvalidParameterError(
      ErrorCode.InvalidParameter,
      `unusable fiat endpoint ${JSON.stringify(endpoint)}`,
      'Malformed fiat endpoint',
      { endpoint },
      'endpoint must read "<GET|POST> /fiat/…" with no path traversal',
      'https://docs.fun.xyz',
    )
  }

  return { method: match[1] as FiatHttpVerb, path }
}

/** Sends a transition endpoint supplied by the fiat backend. */
export async function sendFiatTransition<T = unknown>({
  params,
  getIdentityAssertion,
  maxAttempts,
  abortOn429 = false,
  onAttemptFailed,
  checkoutId,
  clientCapabilities = [],
  ...options
}: BaseApiRequest & {
  params: SendFiatTransitionParams
  /** Returns the host-signed identity assertion sent as the bearer credential. */
  getIdentityAssertion?: () => Promise<string>
  /** Transport attempts, for a caller that retries on its own; defaults to the shared policy's. */
  maxAttempts?: number
  /** Gives up on a rate limit at once; true only for transitions, which the per-login limit counts. */
  abortOn429?: boolean
  /** Hears each failed transport attempt, the last included, in order; its throws are ignored. */
  onAttemptFailed?: (error: Error) => void
  /** The client flow's checkout id, so server logs join the client's. */
  checkoutId?: string
  /** What this client can do beyond the contract; the server enrolls it only in matching experiments. */
  clientCapabilities?: readonly FiatClientCapability[]
}): Promise<T> {
  const { endpoint, body, idempotencyKey } = params
  const { method, path } = parseFiatEndpoint(endpoint)

  // Writes must keep the same key across transport retries.
  if (method === 'POST' && !idempotencyKey) {
    throw new InvalidParameterError(
      ErrorCode.InvalidParameter,
      `fiat ${endpoint} requires an idempotency key`,
      'Missing idempotency key',
      { endpoint },
      'mint one key per transition-fire and reuse it across that fire’s retries',
      'https://docs.fun.xyz',
    )
  }

  // Authentication failures are refreshed by the caller, not the retry loop.
  const identityAssertion =
    getIdentityAssertion === undefined
      ? undefined
      : await getIdentityAssertion()

  const headers = {
    ...(idempotencyKey === undefined
      ? {}
      : { 'Idempotency-Key': idempotencyKey }),
    ...(identityAssertion === undefined
      ? {}
      : { Authorization: `Bearer ${identityAssertion}` }),
    ...(checkoutId === undefined ? {} : { 'X-Fun-Checkout-Id': checkoutId }),
    ...(clientCapabilities.length === 0
      ? {}
      : { 'X-Fun-Client-Capabilities': clientCapabilities.join(',') }),
  }

  return sendRequest<T>({
    ...options,
    uri: `${API_BASE_URL}${path}`,
    method,
    ...(body === undefined ? {} : { body }),
    ...(Object.keys(headers).length === 0 ? {} : { headers }),
    retryOptions: {
      handleError: abortUnrecoverable(abortOn429, onAttemptFailed),
      ...(maxAttempts === undefined ? {} : { maxAttempts }),
    },
  })
}
