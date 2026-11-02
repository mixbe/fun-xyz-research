import {
  LIGHTER_CHAIN_ID,
  LIGHTER_RH_CHAIN_ID,
  type LighterChainId,
} from '@funkit/chains'
import {
  type CheckoutHistoryItem,
  type CheckoutState,
  type DirectExecution,
  DirectExecutionType,
  RelayExecutionStatus,
} from '@funkit/api-base'
import type { ApiFunkitCheckoutActionParams } from '@funkit/utils'

import type { Address, Hex } from 'viem'
import type { MergedMultiStepDirectExecution } from '~/domains/checkoutNotifications'
import { getDirectExecutionUpdatedTimeMs } from './directExecution'
import { mapRelayExecutionStatusToCheckoutState } from './relayStatus'

export type PurifiedCheckoutHistoryItem = {
  depositAddr?: Address
  directExecution: boolean
  id: Hex
  fromAmountBaseUnit: string
  fromChainId: string
  fromTokenAddress: Address
  state: CheckoutState
  toAmountBaseUnit: string
  toChainId: string
  toTokenAddress: Address
  createdTimeMs: number
  updatedTimeMs: number
  additionalActions: ApiFunkitCheckoutActionParams[]
  isWithdrawal: boolean
  /**
   * Customer-specific, presentation-only metadata. Kept in its own bag so
   * customer concepts don't leak onto the shared top-level shape. Only present
   * when there's something to surface for the item's customer.
   */
  customerMetadata?: {
    /**
     * For Lighter withdrawal direct executions: which route was used.
     * `'secure'` is Lighter's native bridge to mainnet (recorded as
     * `EXTERNALLY_FULFILLED`); `'fast'` routes through Fun + Relay.
     */
    lighterWithdrawalType?: 'fast' | 'secure'
  }
} & (
  | {
      depositAddr: Address
      directExecution: false
    }
  | {
      depositAddr?: never
      directExecution: true
      txHashes: Hex[]
    }
)

function resolveLastDirectExecution(de: MergedMultiStepDirectExecution) {
  return de.latestStep ?? de
}

/**
 * Lighter's Fun customer id per instance (mainnet mirrors `Clients.LIGHTER` in
 * `apps/frog`; RH is `isLighterRhCustomer`'s key in connect).
 */
const LIGHTER_CUSTOMER_IDS: Record<LighterChainId, string> = {
  [LIGHTER_CHAIN_ID]: 'y1f4kbskv0',
  [LIGHTER_RH_CHAIN_ID]: 'q1aj098ygl',
}

function isLighterCustomerId(customerId: string | undefined): boolean {
  return Object.values(LIGHTER_CUSTOMER_IDS).some((id) => id === customerId)
}

/**
 * For Lighter direct executions only, classify the withdrawal route. Secure
 * withdrawals are recorded as `EXTERNALLY_FULFILLED` (Lighter's native bridge);
 * everything else routes through Fun + Relay and is `'fast'`. Returns
 * `undefined` for non-Lighter items or non-withdrawals.
 */
function resolveLighterWithdrawalType(
  de: DirectExecution,
  isWithdrawal: boolean,
): 'fast' | 'secure' | undefined {
  if (!isLighterCustomerId(de.customerId) || !isWithdrawal) {
    return undefined
  }
  return de.type === DirectExecutionType.EXTERNALLY_FULFILLED
    ? 'secure'
    : 'fast'
}

function getTransactionHashes(first: DirectExecution, last: DirectExecution) {
  // get from/to tx hashes from first and last steps, then dedupe
  const all = [first.txHash, first.toTxId, last.txHash, last.toTxId].filter(
    Boolean,
  )
  return Array.from(new Set(all)) as Hex[]
}

export const purifyCheckoutHistoryItem = (
  item: CheckoutHistoryItem | MergedMultiStepDirectExecution,
): PurifiedCheckoutHistoryItem => {
  if ('depositAddr' in item) {
    return {
      directExecution: false,
      id: item.depositAddr,
      depositAddr: item.depositAddr,
      fromAmountBaseUnit: item.fromAmountBaseUnit,
      fromChainId: item.fromChainId,
      fromTokenAddress: item.fromTokenAddress,
      state: item.state,
      toChainId: item.toChainId,
      toTokenAddress: item.toTokenAddress,
      toAmountBaseUnit: item.toAmountBaseUnit,
      createdTimeMs: item.createdTimeMs,
      updatedTimeMs: item.lastUpdatedTimeMs,
      additionalActions: item?.clientMetadata?.evaluatedActionsParams ?? [],
      isWithdrawal: item.clientMetadata?.isWithdrawal ?? false,
    }
  }
  const de = resolveLastDirectExecution(item)
  const lighterWithdrawalType = resolveLighterWithdrawalType(
    de,
    de.clientMetadata?.isWithdrawal ?? false,
  )

  return {
    directExecution: true,
    id: de.txHash,
    // use first step's deposit address for source
    fromAmountBaseUnit: item.fromAmountBaseUnit,
    fromChainId: item.fromChainId,
    fromTokenAddress: item.fromTokenAddress,
    // use last step's status for target
    toChainId: de.toChainId,
    toTokenAddress: de.toTokenAddress,
    toAmountBaseUnit: de.toAmountBaseUnit,
    state: mapRelayExecutionStatusToCheckoutState(
      de?.listenerInfo?.status ?? RelayExecutionStatus.SUCCESS,
    ),
    txHashes: getTransactionHashes(item, de),
    // needs to use the original item's createdTimeMs for the earliest time
    createdTimeMs: item.createdTimeMs,
    updatedTimeMs: getDirectExecutionUpdatedTimeMs(de),
    additionalActions: de?.clientMetadata?.evaluatedActionsParams ?? [],
    isWithdrawal: de.clientMetadata?.isWithdrawal ?? false,
    ...(lighterWithdrawalType && {
      customerMetadata: { lighterWithdrawalType },
    }),
  }
}
