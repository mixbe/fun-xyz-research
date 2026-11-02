import { retry } from '@lifeomic/attempt'
import type { BaseRequest, Logger } from '../consts/request'
import {
  type BaseResponse,
  DEFAULT_RETRY_OPTIONS,
  type RetryOptions,
} from '../consts/retry'

import {
  AccessDeniedError,
  ClientError,
  ErrorBaseType,
  ErrorCode,
  InternalFailureError,
  InvalidParameterError,
  ResourceNotFoundError,
  ThrottlingError,
  UserOpFailureError,
  getHostBigIntToJSONSource,
  jsonStringifyWithBigIntSanitization,
} from '@funkit/utils'
import type {
  DeleteRequest,
  GetRequest,
  PostRequest,
  PutRequest,
} from './../consts/request'
import { serializeHeaders } from './error'

export interface RequestError {
  errorCode: string
  errorMsg: string
  relayErrorCode?: string
  [field: string]: unknown
}

export interface ResponseError extends Error {
  /** The non-sensitive error payload returned by the API. */
  responseBody: RequestError
}

/** Reads a structured API refusal without depending on one installed Error class. */
export function getResponseErrorBody(error: unknown): RequestError | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }
  const responseBody = (error as { responseBody?: unknown }).responseBody
  if (typeof responseBody !== 'object' || responseBody === null) {
    return undefined
  }
  const { errorCode, errorMsg } = responseBody as Record<string, unknown>
  return typeof errorCode === 'string' && typeof errorMsg === 'string'
    ? (responseBody as RequestError)
    : undefined
}

function withResponseBody<TError extends Error>(
  error: TError,
  responseBody: RequestError,
): TError & ResponseError {
  return Object.assign(error, { responseBody })
}

// Messages fetch() rejects with when it fails at the network layer (DNS, TCP,
// TLS, tab closed mid-flight, offline): Chrome/Edge, Safari (incl. iOS),
// Firefox, then React Native's two. These are recovered on the next request.
const NETWORK_ERROR_MESSAGES = [
  'Failed to fetch',
  'Load failed',
  'NetworkError when attempting to fetch resource.',
  'Network request failed',
  'Network request timed out',
]

/**
 * Whether `fetch` rejected at the network layer — recoverable, so WARN not ERROR.
 * - Host-page fetch wrappers (e.g. Sentry) append the host, `Failed to fetch (api.fun.xyz)`, so match the prefix too.
 * - Only `TypeError`: a bare message match would also downgrade serialization bugs that should page.
 */
export function isNetworkError(error: unknown): error is TypeError {
  if (!(error instanceof TypeError)) {
    return false
  }
  return NETWORK_ERROR_MESSAGES.some(
    (message) =>
      error.message === message || error.message.startsWith(`${message} (`),
  )
}

/**
 * Why a request failed. Logged on `api-base:fetch_error` so dashboards filter
 * on the same decision that sets its severity: only `server` logs at error.
 */
type FetchFailure = 'caller_abort' | 'network' | 'client' | 'server'

function classifyFetchFailure(
  err: unknown,
  signal: AbortSignal | undefined,
): FetchFailure {
  // A caller's own `signal` firing is their decision to stop waiting, not a
  // server failure — they own the fallback (e.g. the geo provider chain in
  // `useUserIpInfo`). Read off the signal rather than the error, since the
  // abort reason is caller-constructed and need not be a `DOMException`.
  if (signal?.aborted === true) {
    return 'caller_abort'
  }
  if (isNetworkError(err)) {
    return 'network'
  }
  if (
    err instanceof ClientError &&
    err.baseType === ErrorBaseType.ClientError
  ) {
    return 'client'
  }
  return 'server'
}

// Once per page load: the value is a property of the environment, not of any one request.
let hasReportedHostBigIntToJSON = false

/**
 * A host page defining `BigInt.prototype.toJSON` rewrites every bigint we serialize, because
 * `JSON.stringify` calls it before any replacer. `jsonStringifyWithBigIntSanitization` is immune,
 * but sessions on older SDK builds are not, so record where it happens: this is what tells us who
 * is affected and when the API can stop accepting the corrupted form.
 *
 * Checked per request rather than at module load, since whatever defines it may run after we do.
 */
function maybeReportHostBigIntToJSON(logger: Logger | undefined) {
  if (hasReportedHostBigIntToJSON) {
    return
  }
  const source = getHostBigIntToJSONSource()
  if (!source) {
    return
  }
  hasReportedHostBigIntToJSON = true
  logger?.warn('bigint-tojson-patched', { source })
}

const TRANSPORT_OWNED_HEADER_NAMES = new Set(['content-type', 'x-api-key'])

/**
 * Bearer credentials, masked in logs — Datadog browser logs are exfiltratable
 * and retained under different access controls than the page that sent them.
 * Names still log, so a missing header stays diagnosable.
 *
 * Two headers are deliberately NOT here:
 * - `X-Api-Key` is public by policy — it ships in client code and is cheap to
 *   rotate, and masking it would cost the per-customer signal support triage
 *   reads off these lines.
 * - `Idempotency-Key` is a random correlation id, not a credential, and it is
 *   what ties a retry to its original attempt in a log search.
 */
const SECRET_HEADER_NAMES = new Set(['authorization'])

function maskSecretHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [
      name,
      SECRET_HEADER_NAMES.has(name.toLowerCase()) ? '[redacted]' : value,
    ]),
  )
}

function withoutTransportOwnedHeaders(
  extraHeaders: Record<string, string> | undefined,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(extraHeaders ?? {}).filter(
      ([name]) => !TRANSPORT_OWNED_HEADER_NAMES.has(name.toLowerCase()),
    ),
  )
}

/**
 * The thrown error carries the request body in `paramsUsed`, and the log
 * transport serializes an Error's own fields — so the body must be redacted
 * here too, or `redactBodyForLog` is bypassed on every failure.
 *
 * A copy keeps the prototype, `message` and `stack` for the transport while
 * the error rethrown to the caller stays untouched.
 */
function errorForLog(
  err: unknown,
  bodyForLog: (value: unknown) => unknown,
): unknown {
  if (!(err instanceof Error) || !('paramsUsed' in err)) {
    return err
  }
  const { paramsUsed } = err
  if (
    typeof paramsUsed !== 'object' ||
    paramsUsed === null ||
    !('body' in paramsUsed)
  ) {
    return err
  }
  const copy = Object.create(
    Object.getPrototypeOf(err),
    Object.getOwnPropertyDescriptors(err),
  ) as Error & { paramsUsed: unknown }
  copy.paramsUsed = { ...paramsUsed, body: bodyForLog(paramsUsed.body) }
  return copy
}

/**
 * Merges the caller's retry options over the defaults, then stops the walk once
 * their signal is aborted: every remaining attempt would reject the same way,
 * so retrying only spends the budget on requests that cannot succeed — and logs
 * a `sendRequest_before` line for each.
 */
function buildRetryOptions<T>(
  retryOptions: RetryOptions | undefined,
  signal: AbortSignal | undefined,
): RetryOptions<T> {
  const merged = {
    ...DEFAULT_RETRY_OPTIONS,
    ...retryOptions,
  } as RetryOptions<T>

  return {
    ...merged,
    handleError: (err, context, options) => {
      if (signal?.aborted) {
        context.abort()
        return
      }
      return merged.handleError?.(err, context, options)
    },
  } as RetryOptions<T>
}

export async function sendRequest<T = BaseResponse>({
  uri,
  method,
  apiKey,
  body = {},
  logger,
  retryOptions = {},
  signal,
  headers: extraHeaders,
  redactBodyForLog,
}: BaseRequest): Promise<T> {
  maybeReportHostBigIntToJSON(logger)

  const bodyForLog = (value: unknown): unknown =>
    redactBodyForLog === undefined ? value : redactBodyForLog(value)

  // Transport owns auth and encoding: a caller must not be able to override
  // them, and fetch matches header names case-insensitively — so strip caller
  // variants instead of relying on object-spread precedence.
  const headers = {
    ...withoutTransportOwnedHeaders(extraHeaders),
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
  }

  let latestResponse: Response | undefined
  let latestBody: unknown | undefined
  try {
    const finalRetryOptions = buildRetryOptions<T>(retryOptions, signal)

    return await retry<T>(async (context) => {
      // reset the latest response and body so we will not log the previous response and body
      latestResponse = undefined
      latestBody = undefined

      const startTimeMs = Date.now()
      const fetchParams = {
        method,
        headers,
        redirect: 'follow',
        signal,
        body:
          method !== 'GET'
            ? jsonStringifyWithBigIntSanitization(body)
            : undefined,
      } as RequestInit

      const loggedFetchParams = {
        ...fetchParams,
        headers: maskSecretHeaders(headers),
        body: method !== 'GET' ? bodyForLog(body) : undefined,
      }

      logger?.info('api-base:sendRequest_before', {
        uri,
        fetchParams: loggedFetchParams,
        startTimeMs,
      })
      const response = await fetch(uri, fetchParams)
      latestResponse = response
      const responseBody = (await response.text()) as string
      latestBody = responseBody
      const json = response.status === 204 ? {} : JSON.parse(responseBody)
      // if we got there then JSON.parse didn't throw, so we update latestBody with parsed body
      latestBody = json

      const endTimeMs = Date.now()
      logger?.info('api-base:sendRequest_after', {
        url: uri,
        fetchParams: loggedFetchParams,
        endTimeMs,
        response: {
          body: bodyForLog(json),
          status: response.status,
        },
        durationMs: endTimeMs - startTimeMs,
        retries: context.attemptNum,
      })

      if (response.ok) {
        return json
      }

      const { errorMsg, errorCode, relayErrorCode } = json as RequestError

      if (relayErrorCode) {
        throw new RelayQuoteError(response.status, relayErrorCode, errorMsg)
      }

      if (response.status === 400 || response.status === 422) {
        throw withResponseBody(
          new InvalidParameterError(
            ErrorCode.InvalidParameter,
            `bad request ${JSON.stringify(json)}`,
            errorMsg,
            { body },
            'check the api call parameters. its mostly because some call parameters are wrong',
            'https://docs.fun.xyz',
          ),
          json as RequestError,
        )
      }
      // A refused payment fails the order, so a retry under the same idempotency
      // key only reaches an order that can no longer pay, and its 400 replaces
      // the decline. The body carries the reason and recovery.
      if (response.status === 402) {
        throw withResponseBody(
          new InvalidParameterError(
            ErrorCode.PaymentRequired,
            `payment declined ${JSON.stringify(json)}`,
            errorMsg,
            { body },
            'the payment was declined. try another payment method',
            'https://docs.fun.xyz',
          ),
          json as RequestError,
        )
      }
      // Treated as a refreshable end-user credential, which is what a 401 means
      // on `/fiat/*`. Some services answer 401 for a bad API key too, so a caller
      // that refreshes and retries must still give up after one attempt.
      if (response.status === 401) {
        throw withResponseBody(
          new AccessDeniedError(
            ErrorCode.AuthenticationRequired,
            'Missing or expired end-user credential.',
            errorMsg,
            { status: 401 },
            'Supply a fresh identity assertion and retry the request',
            'https://docs.fun.xyz',
          ),
          json as RequestError,
        )
      }
      if (response.status === 403) {
        throw new AccessDeniedError(
          ErrorCode.Unauthorized,
          'Invalid API key or insufficient access.',
          errorMsg,
          { apiKey },
          'Check your api key at https://app.fun.xyz and check with fun team if you believe something is off',
          'https://docs.fun.xyz',
        )
      }
      if (response.status === 404) {
        throw withResponseBody(
          new ResourceNotFoundError(
            ErrorCode.ServerMissingData,
            JSON.stringify(json),
            errorMsg,
            { body },
            'check the api call parameters. its mostly because some call parameters are wrong',
            'https://docs.fun.xyz',
          ),
          json as RequestError,
        )
      }
      if (response.status === 429) {
        throw withResponseBody(
          new ThrottlingError(
            ErrorCode.RequestLimitExceeded,
            `too many requests ${JSON.stringify(json)}`,
            'Too many requests',
            { body },
            'you are making too many requests. please slow down. Reach out to fun team if you need more quota',
            'https://docs.fun.xyz',
          ),
          json as RequestError,
        )
      }
      if (response.status === 500) {
        if (errorCode === ErrorCode.UserOpFailureError) {
          throw new UserOpFailureError(
            ErrorCode.UserOpFailureError,
            JSON.stringify(json), // UserOpFailureError may JSON.parse this! Do not modify!
            errorMsg,
            { body },
            'fix user op failure. Most of the time this is due to invalid parameters',
            'https://docs.fun.xyz',
          )
        }
        throw withResponseBody(
          new InternalFailureError(
            ErrorCode.ServerFailure,
            `server failure ${JSON.stringify(json)}`,
            errorMsg,
            { body },
            'retry later. if it still fails, please contact us.',
            'https://docs.fun.xyz',
          ),
          json as RequestError,
        )
      }
      if (response.status === 504) {
        throw new InternalFailureError(
          ErrorCode.ServerTimeout,
          `server timeout failure ${JSON.stringify(json)}`,
          errorMsg,
          { body },
          'retry later. if it still fails, please contact us.',
          'https://docs.fun.xyz',
        )
      }
      if (!response.ok) {
        throw withResponseBody(
          new InternalFailureError(
            ErrorCode.UnknownServerError,
            `unknown server failure ${JSON.stringify(json)}`,
            errorMsg,
            { body, status: response.status },
            'retry later. if it still fails, please contact us.',
            'https://docs.fun.xyz',
          ),
          json as RequestError,
        )
      }
      return {}
    }, finalRetryOptions)
  } catch (err) {
    const failure = classifyFetchFailure(err, signal)
    const logType: keyof Logger = failure === 'server' ? 'error' : 'warn'

    logger?.[logType]('api-base:fetch_error', {
      failure,
      url: uri,
      method,
      request: {
        body: bodyForLog(body),
        headers: maskSecretHeaders(headers),
      },
      // latestResponse will be undefined if the fetch failed because of a network error.
      response: latestResponse
        ? {
            status: latestResponse.status,
            statusText: latestResponse.statusText,
            headers: serializeHeaders(latestResponse.headers),
            url: latestResponse.url,
            body: bodyForLog(latestBody),
          }
        : null,
      error:
        redactBodyForLog === undefined ? err : errorForLog(err, bodyForLog),
    })

    // Rethrow the error to match existing behavior
    if (err instanceof Error) {
      throw err
    }

    throw new InternalFailureError(
      ErrorCode.ServerConnectionError,
      `Cannot connect to Fun API Service ${err}`,
      '',
      { body },
      'retry later. if it still fails, please contact us.',
      'https://docs.fun.xyz',
    )
  }
}

export async function sendGetRequest<T = BaseResponse>(
  options: GetRequest,
): Promise<T> {
  return await sendRequest({ ...options, method: 'GET' })
}

export async function sendPostRequest<T = BaseResponse>(
  options: PostRequest,
): Promise<T> {
  return await sendRequest({ ...options, method: 'POST' })
}

export async function sendPutRequest<T = BaseResponse>(
  options: PutRequest,
): Promise<T> {
  return await sendRequest({ ...options, method: 'PUT' })
}

export async function sendDeleteRequest(options: DeleteRequest): Promise<void> {
  await sendRequest({ ...options, method: 'DELETE' })
}

export class RelayQuoteError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly relayErrorCode: string,
    message: string,
  ) {
    super(message)
    this.name = new.target.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
