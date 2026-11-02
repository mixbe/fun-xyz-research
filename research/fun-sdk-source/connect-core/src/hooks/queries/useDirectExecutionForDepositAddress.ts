import type { DirectExecution } from '@funkit/api-base'
import { useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'

import {
  type MergedMultiStepDirectExecution,
  processRecentDepositsForNotifications,
} from '../../domains/checkoutNotifications'
import { findDirectExecutionForDepositAddress } from '../../utils/directExecution'
import type { FunLogger } from '../../utils/funLogger'
import { useRecentDepositsApiQuery } from './useRecentDepositsApiQuery'

/**
 * How many of the wallet's recent direct executions to scan. Small on purpose —
 * ours is the newest by construction, and the list is only a lookup to recover
 * the transaction hash that follows it.
 */
const RECENT_DIRECT_EXECUTION_SCAN_SIZE = 5

export interface DirectExecutionForDepositAddressParams {
  /** The address funds were sent to; nothing is polled without one. */
  depositAddress: Address | undefined
  apiKey: string
  /**
   * The wallet the deposit address was registered under — the scanner records
   * the arrival against it rather than against the address itself, so a host's
   * own user id would find nothing.
   */
  walletAddress: string
  pollIntervalMs: number
  /** Stop asking once the caller has a terminal answer. */
  hasSettled: boolean
  logger: FunLogger
}

export interface DepositAddressArrival {
  /** The direct execution recording the arrival, once one appears. */
  directExecution: MergedMultiStepDirectExecution | undefined
  /** The newest step of a multi-step route — where the status lives. */
  latestStep: DirectExecution | undefined
  /** SUCCESS on an intermediary step is not delivery; only the last step is. */
  isFinalStep: boolean
}

/**
 * Watches a deposit address for the arrival of funds sent there on our behalf,
 * for flows where nothing of ours went on-chain and there is no hash to follow.
 *
 * Finding it is all this does — what its status then means is the caller's, and
 * differs by platform.
 */
export function useDirectExecutionForDepositAddress({
  depositAddress,
  apiKey,
  walletAddress,
  pollIntervalMs,
  hasSettled,
  logger,
}: DirectExecutionForDepositAddressParams): DepositAddressArrival {
  const { data: recentDirectExecutions } = useRecentDepositsApiQuery({
    isVisible: !hasSettled && !!depositAddress,
    fetchSize: RECENT_DIRECT_EXECUTION_SCAN_SIZE,
    apiKey,
    userId: walletAddress,
    refreshIntervalMs: pollIntervalMs,
    logger,
  })

  /**
   * Merging collapses a multi-step route to its root with `latestStep` attached.
   *
   * Deliberately no `variant` filter: a same-chain withdrawal reuses the deposit
   * flow's address and inherits its metadata, so `clientMetadata.isWithdrawal` is
   * often absent — `variant: 'withdrawal'` would drop exactly those.
   */
  const mergedDirectExecutions = useMemo(
    () => processRecentDepositsForNotifications(recentDirectExecutions),
    [recentDirectExecutions],
  )

  /**
   * A deposit address is reused by every transfer sharing its destination, so an
   * earlier settled one sits in the list under the same `sourceOfFund` and would
   * match as an instant false success. Whatever was already listed when we
   * started watching isn't ours.
   *
   * Identity by `txHash` rather than a timestamp, mirroring
   * `getUpdatedDirectExecutions` — minus its "or it changed" arm, which would let
   * a touched earlier transfer back in.
   */
  const [knownTxHashes, setKnownTxHashes] = useState<ReadonlySet<string>>()
  useEffect(() => {
    if (!knownTxHashes && mergedDirectExecutions) {
      setKnownTxHashes(
        new Set(mergedDirectExecutions.map(({ txHash }) => txHash)),
      )
    }
  }, [knownTxHashes, mergedDirectExecutions])

  // Re-resolved from the list every poll rather than latched: a deposit-detection
  // DE is synthetic and gets replaced by the real one, taking its hash with it.
  // Held back until the snapshot lands — the list query's key is shared with the
  // notification banner, so cached data can arrive on the very first render.
  const directExecution = knownTxHashes
    ? findDirectExecutionForDepositAddress(
        mergedDirectExecutions,
        depositAddress,
        knownTxHashes,
      )
    : undefined

  const latestStep = directExecution?.latestStep ?? directExecution
  return {
    directExecution,
    latestStep,
    isFinalStep: !!latestStep && !latestStep.isIntermediaryPhase,
  }
}
