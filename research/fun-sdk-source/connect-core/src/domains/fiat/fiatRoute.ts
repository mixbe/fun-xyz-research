import { getResponseErrorBody } from '@funkit/api-base'

import {
  NO_CLIENT_CAPABILITIES,
  sendAuthedFiatTransition,
} from '~/domains/fiat/authedTransport'
import { fiatLogRedactor } from '~/domains/fiat/fiatLogRedactor'
import type { IdentityAssertionProvider } from '~/domains/fiat/identityAssertion'
import type { FunLogger } from '~/utils/funLogger'
import { randomUuid } from '~/utils/randomUuid'

export type FiatRouteRecovery = 'RETRY' | 'REQUOTE' | 'NONE'

/** The 4xx/5xx body of a provider-owned route: the shared error body plus `reason` and `recovery`. */
export interface FiatRouteFault<Reason extends string = string> {
  errorCode: string
  errorMsg: string
  reqId?: string
  reason: Reason
  recovery: FiatRouteRecovery
  /** A 429's wait before the same request may go again. */
  retryAfterSeconds?: number
}

/** A route call that failed. `fault` is absent when no route error body came back (network, gateway). */
export class FiatRouteError<Reason extends string = string> extends Error {
  constructor(
    readonly endpoint: string,
    readonly fault: FiatRouteFault<Reason> | undefined,
    readonly cause: unknown,
  ) {
    super(`${endpoint} failed: ${fault?.reason ?? 'no fault body'}`)
    this.name = 'FiatRouteError'
  }
}

export interface FiatRouteContext {
  apiKey: string
  logger: FunLogger
  identityAssertionProvider: IdentityAssertionProvider | undefined
  /** The caller's checkout attempt, logged on each call's event. */
  checkoutAttemptId?: string
}

/**
 * One POST to a fiat route. A failure throws `FiatRouteError`, with the route's fault when its body
 * names one of `reasons`. The transport requires a key on every POST; these routes ignore it.
 */
export async function sendFiatRoute<T, Reason extends string>(
  { apiKey, logger, identityAssertionProvider }: FiatRouteContext,
  {
    endpoint,
    body,
    reasons,
  }: {
    endpoint: `POST /fiat/${string}`
    body: object
    reasons: readonly Reason[]
  },
): Promise<T> {
  try {
    return await sendAuthedFiatTransition<T>(
      {
        apiKey,
        logger,
        // The bodies carry SDK credentials and KYC values.
        redactBodyForLog: fiatLogRedactor(logger),
        // The provider routes read no client capability; main's #8345 made the field required.
        clientCapabilities: NO_CLIENT_CAPABILITIES,
        params: { endpoint, body, idempotencyKey: randomUuid() },
      },
      identityAssertionProvider,
    )
  } catch (error) {
    throw new FiatRouteError(endpoint, parseRouteFault(error, reasons), error)
  }
}

const RECOVERIES: readonly FiatRouteRecovery[] = ['RETRY', 'REQUOTE', 'NONE']

/**
 * The route error body a call failed with, if it names one of `reasons`.
 *
 * api-base attaches the body to every error status but 403 and 504, and
 * neither of those carries a route fault.
 */
export function parseRouteFault<Reason extends string>(
  error: unknown,
  reasons: readonly Reason[],
): FiatRouteFault<Reason> | undefined {
  const body: Record<string, unknown> | undefined = getResponseErrorBody(error)
  if (
    body === undefined ||
    typeof body.errorCode !== 'string' ||
    typeof body.errorMsg !== 'string' ||
    !reasons.includes(body.reason as Reason) ||
    !RECOVERIES.includes(body.recovery as FiatRouteRecovery)
  ) {
    return undefined
  }
  return {
    errorCode: body.errorCode,
    errorMsg: body.errorMsg,
    reason: body.reason as Reason,
    recovery: body.recovery as FiatRouteRecovery,
    ...(typeof body.reqId === 'string' ? { reqId: body.reqId } : {}),
    ...(typeof body.retryAfterSeconds === 'number' &&
    Number.isFinite(body.retryAfterSeconds) &&
    body.retryAfterSeconds > 0
      ? { retryAfterSeconds: body.retryAfterSeconds }
      : {}),
  }
}
