import { COINBASE_ENDPOINTS } from '@fun-xyz/fiat-contract/coinbase'
import type {
  CoinbaseErrorBody,
  CoinbaseFaultReason,
  CoinbaseNextRequest,
  CoinbaseResponseFor,
} from '@fun-xyz/fiat-contract/coinbase'

import {
  type FiatRouteContext,
  FiatRouteError,
  type FiatRouteFault,
  sendFiatRoute,
} from '~/domains/fiat/fiatRoute'

/** An action the client sends. `wait` has no request: the client sends `observe` after it. */
export type CoinbaseRequestAction = CoinbaseNextRequest['action']

/**
 * A `POST /fiat/next` body. A Fun login's body names the recipient as `depositAddress` (typed here
 * until the contract carries it); the route takes it off before its strict check.
 */
export type CoinbaseNextBody = CoinbaseNextRequest & { depositAddress?: string }

export type CoinbaseNextRequestOf<A extends CoinbaseRequestAction> = Extract<
  CoinbaseNextBody,
  { action: A }
>

/** The one telemetry event per `/fiat/next` call. */
export const COINBASE_NEXT_EVENT = 'connect-core:fiat:coinbase_next'

const FAULT_REASONS: readonly CoinbaseFaultReason[] = [
  'SESSION_BUDGET_SPENT',
  'RATE_LIMITED',
  'PROVIDER_UNAVAILABLE',
  'KYC_PROVIDER_UNAVAILABLE',
  'SERVICE_UNAVAILABLE',
  'INVALID_REQUEST',
]

/** A fault's reason, when it is one Coinbase's route names. */
export function coinbaseFaultReason(
  fault: FiatRouteFault | undefined,
): CoinbaseFaultReason | undefined {
  return FAULT_REASONS.find((reason) => reason === fault?.reason)
}

/** The Coinbase fault a call failed with, if the route sent one. */
export function coinbaseFault(error: unknown): CoinbaseErrorBody | undefined {
  return error instanceof FiatRouteError &&
    coinbaseFaultReason(error.fault) !== undefined
    ? (error.fault as CoinbaseErrorBody)
    : undefined
}

/**
 * `POST /fiat/next` for one Coinbase action. A retry sends the same body, and every answer is the
 * current prompt, `done` or `refused`.
 */
export async function sendCoinbaseNext<A extends CoinbaseRequestAction>(
  context: FiatRouteContext,
  request: CoinbaseNextRequestOf<A>,
): Promise<CoinbaseResponseFor[A]> {
  const startedAt = Date.now()
  const logged = {
    action: request.action,
    checkoutAttemptId: context.checkoutAttemptId,
    ...('orderId' in request ? { orderId: request.orderId } : {}),
  }
  try {
    const response = await sendFiatRoute<
      CoinbaseResponseFor[A],
      CoinbaseFaultReason
    >(context, {
      endpoint: COINBASE_ENDPOINTS.next,
      body: request,
      reasons: FAULT_REASONS,
    })
    context.logger.info(COINBASE_NEXT_EVENT, {
      ...logged,
      durationMs: Date.now() - startedAt,
      result: response.next,
    })
    return response
  } catch (error) {
    const fault = coinbaseFault(error)
    context.logger.warn(COINBASE_NEXT_EVENT, {
      ...logged,
      durationMs: Date.now() - startedAt,
      result: fault?.reason ?? 'transport_error',
      recovery: fault?.recovery,
      reqId: fault?.reqId,
    })
    throw error
  }
}
