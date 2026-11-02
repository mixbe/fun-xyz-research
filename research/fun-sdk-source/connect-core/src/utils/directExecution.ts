import type { DirectExecution } from '@funkit/api-base'
import { ETHEREAL_CHAIN_ID, hyperEvmChain } from '@funkit/chains'
import { ResourceNotFoundError, isAddressEquivalent } from '@funkit/utils'
import { type Address, type WalletClient, zeroHash } from 'viem'

import type { MergedMultiStepDirectExecution } from '../domains/checkoutNotifications'

/**
 * The backend answering "no such record", rather than failing to answer at all.
 * Only the former says anything about the record; a network or 5xx failure says
 * only that we could not ask.
 */
export function isDirectExecutionNotFound(error: unknown): boolean {
  return error instanceof ResourceNotFoundError
}

export function getDirectExecutionCreatedTimeMs(
  directExecution: DirectExecution,
) {
  const createdAt =
    // lastKnownDepositTimeMs is the user-perceived start (captured pre-sign).
    // Native paths (e.g. Aave supply) have no relay createdAt, and createdTimeMs
    // trails the block, so prefer it.
    directExecution?.lastKnownDepositTimeMs ||
    directExecution?.listenerInfo?.relayExecutionRequestDetails?.createdAt ||
    directExecution?.createdTimeMs ||
    // Fallback to 0 if updatedAt is not defined. Not ideal but should really not happen unless its a really old test direct execution record
    0

  return new Date(createdAt).getTime()
}

export function getDirectExecutionUpdatedTimeMs(
  directExecution: DirectExecution,
) {
  // Fallback to 0 if updatedAt is not defined.
  // Not ideal but should really not happen unless its a really old test direct execution record
  const updatedAtRequestDetails =
    directExecution?.listenerInfo?.relayExecutionRequestDetails?.updatedAt || 0
  const updatedAtListenerInfo = directExecution?.listenerInfo?.time || 0
  const updatedAtDirectExec = directExecution?.updatedTimeMs || 0
  // Note: using Math.max on timestamps to get the latest time
  // direct executions do NOT necessarily complete when relay request is completed
  // e.g. Lighter's DEs need to await DEX confirmation instead of transaction confirmation
  // the last DirectExecution is probably the most accurate
  // see `getDirectExecutionStatus` and direct-execution-worker in fun-backend
  return Math.max(
    new Date(updatedAtRequestDetails).getTime(),
    new Date(updatedAtListenerInfo).getTime(),
    new Date(updatedAtDirectExec).getTime(),
  )
}

/**
 * Unique key for a DE notification record, stable between synthetic and real record.
 *
 * When a synthetic deposit-detection DE is replaced by the real DE, the txHash
 * changes but triggeringTxHash stays the same. Preferring triggeringTxHash keeps
 * the identity stable across that swap, avoiding a flash/remount of the notification.
 */
export function getDirectExecutionNotificationKey(item: DirectExecution) {
  return item.triggeringTxHash || item.txHash
}

export function getDirectExecutionRunTimeSeconds(
  directExecution: DirectExecution,
): number {
  const beginTime = new Date(
    // lastKnownDepositTimeMs is a more accurate start (captured pre-sign) but
    // may be absent on older records. Native paths (e.g. Aave supply) lack a
    // relay createdAt and createdTimeMs trails the block, so prefer it.
    // Mirrors fits' records-dashboard ordering so both screens agree.
    directExecution?.lastKnownDepositTimeMs ||
      directExecution?.listenerInfo?.relayExecutionRequestDetails?.createdAt ||
      directExecution.createdTimeMs,
  ).getTime()
  const endTime = getDirectExecutionUpdatedTimeMs(directExecution)

  if (!beginTime || !endTime) {
    return 0
  }

  return (endTime - beginTime) / 1000
}

const lzOftChainEnumToChainId: Partial<Record<string, number>> = {
  hyperliquid: hyperEvmChain.id,
  ethereal: ETHEREAL_CHAIN_ID,
}

function getLzOftDestinationChain(de: DirectExecution): string | undefined {
  const lzData = de.listenerInfo?.layerzeroExecutionStatusResponse?.data?.[0]
  const lzChainEnum = lzData?.pathway?.receiver.chain
  return lzChainEnum && lzOftChainEnumToChainId[lzChainEnum]?.toString()
}

/**
 * The completion hash a host can actually look up, given what
 * {@link getCompletionTxInfo} reported.
 *
 * - Relay echoes the DE's own `txHash` back as `toTxId` while it has no fill to
 *   report, and the zero hash before that. Neither is linkable, and for an
 *   account-abstraction DE `txHash` is a userOpHash no explorer serves at `/tx`.
 * - Cross-chain, only a real destination tx is reportable: the DE's own hash is
 *   the *source*-chain one, and pairing it with the destination `chainId` the
 *   screen renders would point at the wrong explorer.
 * - Same-chain can fall back to `onChainTxHash`, the bundle tx that delivered
 *   the funds.
 *
 * Mirrors the backend's `resolveRollyDepositTxHash`, which leads with the same
 * chain check for the same reason.
 */
export function resolveOnChainCompletionTxHash(
  directExecution: MergedMultiStepDirectExecution,
  completionTxHash: string | undefined,
): string | undefined {
  const hasDestinationTx =
    !!completionTxHash &&
    completionTxHash !== directExecution.txHash &&
    completionTxHash !== zeroHash
  if (directExecution.fromChainId !== directExecution.toChainId) {
    return hasDestinationTx ? completionTxHash : undefined
  }
  return hasDestinationTx
    ? completionTxHash
    : (directExecution.onChainTxHash ?? directExecution.txHash)
}

/**
 * Resolves the completion transaction chain, hash, and explorer URL for a direct execution.
 *
 * Chain resolution: if LayerZero OFT data is present, use the LZ destination chain;
 * otherwise fall back to the DE's toChainId.
 *
 * Hash resolution: for Lighter L1 deposits (new user flow where toChainId is NOT Lighter),
 * the completion explorer should point to Lighter using lighterExecutionStatusResponse.hash.
 * For the existing user flow (toChainId IS Lighter), relay already puts the correct
 * Lighter hash into listenerInfo.txHashes, so the default path works.
 */
export function getCompletionTxInfo(directExecution: DirectExecution): {
  chainId: string
  txHash: string | undefined
  customRedirectUrl: string | undefined
} {
  const chainId =
    getLzOftDestinationChain(directExecution) ?? directExecution.toChainId

  const listenerInfoTxHashes = directExecution.listenerInfo?.txHashes || []
  // BE appends additional hashes outside of relay flow via listenerInfo.txHashes
  // We should take the last item in the array instead of the first to represent the final txHash.
  const defaultTxHash =
    listenerInfoTxHashes[listenerInfoTxHashes.length - 1] ??
    directExecution.toTxId

  const lighterHash =
    directExecution.listenerInfo?.lighterExecutionStatusResponse?.hash
  if (lighterHash) {
    return {
      chainId,
      txHash: lighterHash,
      customRedirectUrl: `https://app.lighter.xyz/explorer/logs/${lighterHash}`,
    }
  }

  return {
    chainId,
    txHash: defaultTxHash,
    customRedirectUrl: undefined,
  }
}

const GET_CAPABILITIES_TIMEOUT_MS = 2000

/**
 * Calls wallet.getCapabilities with a timeout guard.
 * Some wallet-as-a-service providers (e.g. Dynamic) aggressively retry failed
 * getCapabilities RPC calls, which can block the signing flow. The timeout
 * ensures we bail out quickly instead of waiting on endless retries.
 */
async function getCapabilitiesWithTimeout(
  wallet: WalletClient,
  chainId: number,
) {
  if (!wallet.account) {
    return null
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      wallet.getCapabilities({ account: wallet.account, chainId }),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), GET_CAPABILITIES_TIMEOUT_MS)
      }),
    ])
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// That's what relay uses to detect if the wallet supports atomic batch
// https://github.com/relayprotocol/relay-kit/blob/79c7548511a1773d867078f0cd185fa9afd41944/packages/sdk/src/utils/viemWallet.ts#L194
async function needsOverrideAtomicBatch(
  wallet: WalletClient,
  chainId: number,
): Promise<boolean> {
  const capabilities = await getCapabilitiesWithTimeout(wallet, chainId)
  // override getCapabilities call if it failed or timedout
  if (!capabilities) {
    return true
  }

  return (
    capabilities.atomicBatch?.supported ??
    capabilities.atomic?.status === 'supported'
  )
}

/**
 * Returns a proxied wallet with getCapabilities patched to disable atomic batch support.
 * This forces Relay to use sequential transactions instead of batched ones.
 */
export async function disableAtomicBatchIfSupported(
  wallet: WalletClient,
  chainId: number,
): Promise<WalletClient> {
  const needsOverride = await needsOverrideAtomicBatch(wallet, chainId)
  if (!needsOverride) {
    return wallet
  }

  return new Proxy(wallet, {
    get(target, prop, receiver) {
      if (prop === 'getCapabilities') {
        return async (
          params: Parameters<WalletClient['getCapabilities']>[0],
        ) => {
          const capabilities = await getCapabilitiesWithTimeout(
            target,
            params?.chainId ?? chainId,
          )
          return {
            ...capabilities,
            atomicBatch: { supported: false },
            atomic: undefined,
          }
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

/**
 * The direct execution recording an arrival at `depositAddress`, if one has
 * appeared since we started watching.
 *
 * - The scanner stamps the address it saw the transfer at into `sourceOfFund`
 *   (`eoa_scanner|eoa|0x…`), the only field on a DE carrying the full address —
 *   `clientMetadata.depositAddress` comes back null.
 * - A deposit address is reused by every withdrawal sharing its destination, so
 *   `knownTxHashes` must exclude whatever was already listed when watching
 *   began, or an earlier settled withdrawal matches as an instant success. Two
 *   concurrent withdrawals to the same destination cannot be told apart by any
 *   field a DE carries.
 */
export function findDirectExecutionForDepositAddress(
  directExecutions: MergedMultiStepDirectExecution[] | undefined,
  depositAddress: Address | undefined,
  knownTxHashes: ReadonlySet<string>,
): MergedMultiStepDirectExecution | undefined {
  if (!depositAddress) {
    return undefined
  }
  return directExecutions?.find((directExecution) => {
    if (knownTxHashes.has(directExecution.txHash)) {
      return false
    }
    const sourceSegments = directExecution.sourceOfFund?.split('|') ?? []
    const sourceAddress = sourceSegments[sourceSegments.length - 1]
    return (
      !!sourceAddress &&
      isAddressEquivalent({
        firstAddress: sourceAddress,
        secondAddress: depositAddress,
      })
    )
  })
}
