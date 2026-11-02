import { MOONPAY_ENDPOINTS } from '@fun-xyz/fiat-contract/moonpay'
import type {
  MoonPayErrorBody,
  MoonPayFaultReason,
  MoonPayNextRequest,
  MoonPayResponseFor,
} from '@fun-xyz/fiat-contract/moonpay'

import {
  type FiatRouteContext,
  FiatRouteError,
  type FiatRouteFault,
  sendFiatRoute,
} from '~/domains/fiat/fiatRoute'

/** An action the client sends. `wait` has no request: the client sends `observe` after it. */
export type MoonPayRequestAction = MoonPayNextRequest['action']

/**
 * A `POST /fiat/next` body. A Fun login's body names the recipient as `depositAddress` (typed here
 * until connect-core pins fiat-contract 0.46.0); a host with a minter names it in its assertion.
 */
export type MoonPayNextBody = MoonPayNextRequest & { depositAddress?: string }

export type MoonPayNextRequestOf<A extends MoonPayRequestAction> = Extract<
  MoonPayNextBody,
  { action: A }
>

/** The one telemetry event per `/fiat/next` call. */
export const MOONPAY_NEXT_EVENT = 'connect-core:fiat:moonpay_next'

const FAULT_REASONS: readonly MoonPayFaultReason[] = [
  'SESSION_BUDGET_SPENT',
  'RATE_LIMITED',
  'PROVIDER_UNAVAILABLE',
  'KYC_PROVIDER_UNAVAILABLE',
  'SERVICE_UNAVAILABLE',
  'INVALID_REQUEST',
]

/**
 * A Fun login's recipient refused on `/fiat/next`: missing, or not a wallet. The route answers the
 * contract's `INVALID_REQUEST` and names the code at the end of its message.
 */
export type MoonPayRecipientRefusal = 'NO_WALLET' | 'RECIPIENT_NOT_A_WALLET'

const RECIPIENT_REFUSALS: readonly MoonPayRecipientRefusal[] = [
  'NO_WALLET',
  'RECIPIENT_NOT_A_WALLET',
]

/** The recipient refusal an `INVALID_REQUEST` fault names, if it names one. */
export function moonPayRecipientRefusal(
  fault: FiatRouteFault | undefined,
): MoonPayRecipientRefusal | undefined {
  if (fault?.reason !== 'INVALID_REQUEST') {
    return undefined
  }
  return RECIPIENT_REFUSALS.find((code) => fault.errorMsg.endsWith(`(${code})`))
}

/** A fault's reason, when it is one MoonPay's route names. */
export function moonPayFaultReason(
  fault: FiatRouteFault | undefined,
): MoonPayFaultReason | undefined {
  return FAULT_REASONS.find((reason) => reason === fault?.reason)
}

/** The MoonPay fault a call failed with, if the route sent one. */
export function moonPayFault(error: unknown): MoonPayErrorBody | undefined {
  return error instanceof FiatRouteError &&
    moonPayFaultReason(error.fault) !== undefined
    ? (error.fault as MoonPayErrorBody)
    : undefined
}

/**
 * `POST /fiat/next` for one MoonPay action. Each write is idempotent on what the request carries,
 * so a retry sends the same body, and every answer is the current prompt, `done` or `refused`.
 */
export async function sendMoonPayNext<A extends MoonPayRequestAction>(
  context: FiatRouteContext,
  request: MoonPayNextRequestOf<A>,
): Promise<MoonPayResponseFor[A]> {
  const startedAt = Date.now()
  const logged = {
    action: request.action,
    checkoutAttemptId: context.checkoutAttemptId,
    ...('orderId' in request ? { orderId: request.orderId } : {}),
  }
  try {
    const response = await sendFiatRoute<
      MoonPayResponseFor[A],
      MoonPayFaultReason
    >(context, {
      endpoint: MOONPAY_ENDPOINTS.next,
      body: request,
      reasons: FAULT_REASONS,
    })
    context.logger.info(MOONPAY_NEXT_EVENT, {
      ...logged,
      durationMs: Date.now() - startedAt,
      result: response.next,
    })
    return response
  } catch (error) {
    const fault = moonPayFault(error)
    context.logger.warn(MOONPAY_NEXT_EVENT, {
      ...logged,
      durationMs: Date.now() - startedAt,
      result:
        moonPayRecipientRefusal(fault) ?? fault?.reason ?? 'transport_error',
      recovery: fault?.recovery,
      reqId: fault?.reqId,
    })
    throw error
  }
}
