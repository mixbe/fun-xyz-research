import { CheckoutState, RelayExecutionStatus } from '@funkit/api-base'
import { RELAY_TERMINAL_STATUSES } from '@funkit/fun-relay'

/** Map a Relay execution status onto the checkout-history domain state. */
export function mapRelayExecutionStatusToCheckoutState(
  status: RelayExecutionStatus,
): CheckoutState {
  switch (status) {
    case RelayExecutionStatus.SUCCESS:
      return CheckoutState.COMPLETED
    case RelayExecutionStatus.FAILURE:
    case RelayExecutionStatus.REFUND:
      return CheckoutState.CHECKOUT_ERROR
    default:
      return CheckoutState.PENDING_RECEIVAL
  }
}

/**
 * Has this relay execution stopped moving? Wraps the relay SDK's terminal set
 * so callers can ask without depending on `@funkit/fun-relay` themselves.
 */
export function isTerminalRelayStatus(
  status: RelayExecutionStatus | undefined,
): boolean {
  return !!status && RELAY_TERMINAL_STATUSES.includes(status)
}
