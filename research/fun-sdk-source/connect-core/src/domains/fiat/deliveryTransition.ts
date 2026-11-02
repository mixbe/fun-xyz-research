import type { FiatStepResponse } from '@fun-xyz/fiat-contract/types'

/** The contract's name for an order's `AWAIT` onto `GET /fiat/delivery/:deliveryId`. */
const DELIVERY_TRANSITION_ID = 'delivery'

/**
 * Whether a provider checkout's order body offers the `delivery` transition: the purchase goes on
 * past the provider's order, converting its payout into the request's `destinationAsset`.
 * - The checkout stops reading its order and hands this body to the flow, which follows the
 *   delivery to its end as it does for any order.
 * - Only `delivery`: an `orderPending` body without it is read again by the checkout's own `order`.
 */
export function offersDeliveryTransition(
  order: FiatStepResponse | null | undefined,
): order is FiatStepResponse {
  // `transitions` is required, but a body that leaves it out offers nothing rather than throwing.
  return (
    order?.transitions?.some(
      (transition) =>
        transition.mode === 'AWAIT' && transition.id === DELIVERY_TRANSITION_ID,
    ) ?? false
  )
}
