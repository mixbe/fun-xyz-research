import {
  type CheckoutHistoryItem,
  type DirectExecution,
  DirectExecutionType,
  RelayExecutionStatus,
} from '@funkit/api-base'
import { PaymentMethod } from '~/domains/paymentMethods'
import {
  getDirectExecutionCreatedTimeMs,
  getDirectExecutionUpdatedTimeMs,
} from '~/utils/directExecution'

/**
 * Pure, platform-agnostic logic backing the checkout-notifications feature:
 * merging multi-step direct-execution chains, classifying deposits vs
 * withdrawals vs token transfers, applying the recency/variant filters, and
 * deriving which records changed relative to an initial snapshot.
 *
 * No React / DOM dependencies. Extracted out of `hooks/queries/useRecentDeposits`
 * (the polling hook) and `modals/.../CheckoutNotifications.tsx` (the view) so the
 * same derivation runs on both platforms.
 */

/**
 * Default cutoff for notification recency: direct executions / checkouts older
 * than this window are not surfaced as notifications.
 */
export const DEFAULT_NOTIF_CUTOFF = 7 * 24 * 60 * 60 * 1000

export type NotificationVariant =
  | 'deposit'
  | 'withdrawal'
  | 'token_transfer'
  | 'bitcoin_lightning'

export interface MergedMultiStepDirectExecution extends DirectExecution {
  /**
   * In a multi-step DE chain, represents the latest **present** DE of the chain.
   *
   * Always `undefined` for single-step DEs.
   */
  latestStep?: DirectExecution
}

const isRecent = (de: DirectExecution, timestampCutoff: number) =>
  de.createdTimeMs > timestampCutoff

export function mergeMultiStepDirectExecutions(
  directExecutions: DirectExecution[],
): MergedMultiStepDirectExecution[] {
  const directExecutionsByToTxId: {
    [toTxId in string]?: DirectExecution
  } = {}

  const directExecutionsByTriggeringTxHash: {
    [triggeringTxHash in string]?: DirectExecution
  } = {}

  for (const de of directExecutions) {
    if (de.toTxId) {
      directExecutionsByToTxId[de.toTxId.toLowerCase()] = de
    }

    if (de.triggeringTxHash) {
      directExecutionsByTriggeringTxHash[de.triggeringTxHash.toLowerCase()] = de
    }
  }

  // Returns the direct parent DE (if present)
  function getParentDE(de: DirectExecution) {
    return de.triggeringTxHash
      ? directExecutionsByToTxId[de.triggeringTxHash.toLowerCase()]
      : undefined
  }

  // Returns the direct child DE (if present)
  function getNextMultiStepDE(de: DirectExecution) {
    return de.toTxId
      ? directExecutionsByTriggeringTxHash[de.toTxId.toLowerCase()]
      : undefined
  }

  // Returns the latest present DE of a chain
  function getLatestMultiStepDE(de: DirectExecution): DirectExecution {
    const next = getNextMultiStepDE(de)
    return next ? getLatestMultiStepDE(next) : de
  }

  return (
    directExecutions
      // Remove DEs with parents (i.e. only keep single-step DEs and first DEs of multi-step chains)
      .filter((de) => !getParentDE(de))
      .map<MergedMultiStepDirectExecution>((de) => {
        // Multi-step DE => find the latest DE of chain, for which we will poll the current status
        if (de.isIntermediaryPhase) {
          return { ...de, latestStep: getLatestMultiStepDE(de) }
        }

        // Single-step DE => return directly
        return de
      })
  )
}

export function isTokenTransferDirectExecution(de: DirectExecution) {
  return (
    de.clientMetadata.selectedPaymentMethodInfo?.paymentMethod ===
      PaymentMethod.TOKEN_TRANSFER && !de.clientMetadata.isWithdrawal
  )
}

export function isWithdrawalDirectExecution(de: DirectExecution) {
  return !!de.clientMetadata.isWithdrawal
}

export function isBitcoinLightningDirectExecution(de: DirectExecution) {
  return de.type === DirectExecutionType.FLASHNET
}

/**
 * Pure transform: filters, merges multi-step chains, and sorts direct executions.
 * Testable without React.
 */
export function processRecentDepositsForNotifications(
  directExecutions: DirectExecution[] | undefined,
  {
    createdAfterMs,
    cutOffTimeMs = DEFAULT_NOTIF_CUTOFF,
    variant,
  }: {
    createdAfterMs?: number
    cutOffTimeMs?: number
    variant?: NotificationVariant
  } = {},
): MergedMultiStepDirectExecution[] | undefined {
  if (!directExecutions) {
    return undefined
  }
  const timestampCutoff = Date.now() - cutOffTimeMs

  const recentDirectExecutions = directExecutions.filter((de) => {
    if (!isRecent(de, timestampCutoff)) {
      return false
    }
    if (createdAfterMs !== undefined && de.createdTimeMs <= createdAfterMs) {
      return false
    }
    return true
  })

  // Classify variants AFTER merging, on the chain root. A chain's steps can
  // differ from their root in both `type` and clientMetadata (a FLASHNET
  // lightning receive settles via an EOA_EXECUTION step whose backend-generated
  // metadata says `token_transfer`), so filtering pre-merge would break the
  // chain and leak settlement steps as standalone notifications.
  return mergeMultiStepDirectExecutions(recentDirectExecutions)
    .filter((de) => {
      if (variant === 'token_transfer') {
        return isTokenTransferDirectExecution(de)
      }
      if (variant === 'bitcoin_lightning') {
        return isBitcoinLightningDirectExecution(de)
      }
      if (variant === 'withdrawal') {
        return isWithdrawalDirectExecution(de)
      }
      if (variant === 'deposit') {
        return !isWithdrawalDirectExecution(de)
      }
      return true
    })
    .sort((a, b) => b.createdTimeMs - a.createdTimeMs)
}

/**
 * @returns checkouts that are either not present in the initial checkouts or the data changed somehow
 */
export const getUpdatedCheckouts = (
  checkouts: CheckoutHistoryItem[],
  initialCheckouts?: CheckoutHistoryItem[],
) => {
  return checkouts.filter((checkout) => {
    const initialCheckout = initialCheckouts?.find(
      (initialCheckout) => initialCheckout.depositAddr === checkout.depositAddr,
    )

    return (
      !initialCheckout ||
      initialCheckout.lastUpdatedTimeMs !== checkout.lastUpdatedTimeMs
    )
  })
}

/**
 * @returns direct executions that are either not present in the initial set or whose data changed
 */
export const getUpdatedDirectExecutions = (
  directExecutions: MergedMultiStepDirectExecution[],
  initialDirectExecutions?: DirectExecution[],
) => {
  return directExecutions.filter((directExecution) => {
    const initialDirectExecution = initialDirectExecutions?.find(
      (initialDirectExecution) =>
        initialDirectExecution.txHash === directExecution.txHash,
    )

    return (
      !initialDirectExecution ||
      getDirectExecutionUpdatedTimeMs(initialDirectExecution) !==
        getDirectExecutionUpdatedTimeMs(directExecution)
    )
  })
}

/**
 * Where a deposit stands from the user's side: `detected` (seen on chain, not yet
 * routed) → `processing` / `delayed` → `completed`, `failed` or `refunded`.
 */
export type DepositStatus =
  | 'detected'
  | 'processing'
  | 'delayed'
  | 'completed'
  | 'failed'
  | 'refunded'

/** Past the quoted fulfilment time with no terminal status yet. */
function isPastEstimate(de: DirectExecution, nowMs: number): boolean {
  const estimateMs = de.clientMetadata?.latestQuote?.finalTimeEstimationMs
  const startMs = getDirectExecutionCreatedTimeMs(de)
  if (!estimateMs || !startMs) {
    return false
  }
  return startMs + estimateMs < nowMs
}

/**
 * The status a deposit notification shows for a (merged) direct execution.
 *
 * - Reads the latest step of a multi-step chain: an intermediate step's success
 *   only means the next step started, so it stays `processing`.
 * - `delayed` covers both Relay reporting a delay and the quoted time running
 *   out, the same rule the web checkout notification applies.
 */
export function depositStatus(
  record: MergedMultiStepDirectExecution,
  nowMs: number = Date.now(),
): DepositStatus {
  if (record.isDepositDetectionDE) {
    return 'detected'
  }
  const latest = record.latestStep ?? record
  const status = latest.listenerInfo?.status ?? RelayExecutionStatus.PENDING
  switch (status) {
    case RelayExecutionStatus.SUCCESS:
      return latest.isIntermediaryPhase ? 'processing' : 'completed'
    case RelayExecutionStatus.FAILURE:
      return 'failed'
    case RelayExecutionStatus.REFUND:
      return 'refunded'
    case RelayExecutionStatus.DELAYED:
      return 'delayed'
    default:
      return isPastEstimate(latest, nowMs) ? 'delayed' : 'processing'
  }
}
