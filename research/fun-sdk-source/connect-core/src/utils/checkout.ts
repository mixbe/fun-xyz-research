import {
  type CheckoutHistoryItem,
  type CheckoutRefundState,
  CheckoutState,
  type DirectExecution,
} from '@funkit/api-base'
import { FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO } from '@funkit/chains'
import { type Hex, isAddress } from 'viem'

/**
 * Customer-agnostic checkout-history helpers shared by web and React Native.
 * The web-coupled pieces (wagmi balance/decimals reads, quote math, customer
 * branches) stay in `@funkit/connect`'s `utils/checkout.ts`.
 */

/**
 * @returns whether we should show the checkout to the user (ie. supported in current sdk version & not cancelled)
 */
export const isCheckoutValid = (
  checkout: CheckoutHistoryItem | MergedCheckoutHistoryItem,
): boolean => {
  if (checkout.state === CheckoutState.CANCELLED) {
    return false
  }

  const isSupported =
    !!FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[checkout.fromChainId] &&
    !!FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[checkout.toChainId]
  return isSupported
}

export const isCheckoutHistoryDirectExecution = (checkoutId: string) => {
  // Since non-DE checkout is defined by a deposit _address_, we can define DE checkoutId as anything that is not an address...
  return !isAddress(checkoutId)
}

export type MergedCheckoutHistoryItem = {
  directExecution: boolean
  /** For direction execution this is the tx hash, for checkouts it is the deposit address */
  id: Hex
  refundState?: CheckoutRefundState
  state: CheckoutState
} & (
  | (CheckoutHistoryItem & {
      directExecution: false
    })
  | (DirectExecution & {
      directExecution: true
    })
)

export function toMergedCheckoutHistoryItem(
  item: CheckoutHistoryItem | DirectExecution,
): MergedCheckoutHistoryItem {
  if ('depositAddr' in item) {
    return {
      ...item,
      directExecution: false,
      id: item.depositAddr,
    }
  }

  return {
    ...item,
    directExecution: true,
    id: item.txHash,
    state: CheckoutState.COMPLETED, // TODO: Get state from BE! (also refundState)
  }
}
