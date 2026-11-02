import type { FunAddress } from '@funkit/api-base'
import type { Address } from 'viem'

/**
 * Pure, platform-agnostic helpers for the QR-code / Universal-Deposit-Address
 * token-transfer flow. The React hooks that consume these (`useUDAParams`,
 * `useCheckoutTransferInit`, `useTokenTransfer`) stay in `@funkit/connect`
 * because they read web providers and carry customer/i18n branches; only the
 * customer-agnostic param-shaping logic lives here so React Native can reuse it.
 */

/**
 * Platform-agnostic config slice that {@link getCheckoutTokenTransferParams}
 * reads. The web `FunkitCheckoutConfig` satisfies this structurally (it has
 * these fields plus many more); narrowing here keeps the function free of the
 * web-only provider type. (Same pattern as `getWalletLabel` in V1 PR9.)
 */
export interface CheckoutTokenTransferConfig {
  targetChain: string
  targetAsset: Address
  /**
   * Where the deposit ends up, when it is not the connected wallet — the same
   * field web's `FunkitCheckoutConfig` carries (e.g. a Polymarket proxy).
   */
  customRecipient?: FunAddress
  qrcodeActionType?: string
  dynamicTargetAssetCandidates?: Array<{
    tokenChainId: string
    tokenAddress: Address
    isDefault?: boolean
  }>
}

/**
 * Universal Deposit Address params. Pure data describing a dynamic-routing
 * target; the web `useUDAParams` hook resolves it from dynamic config and
 * re-exports this type.
 */
export interface UDAConfig {
  targetChain: string
  targetAsset: Address
  targetAssetTicker: string
  iconSrc: string
  qrcodeActionType?: string
  defaultTokenSymbol?: string
  defaultChainId?: string
}

/** The chain, token and action one deposit actually resolves to. */
export interface DepositTarget {
  chainId: string
  address: Address
  /** A route the deposit has to run through, e.g. a customer action. */
  actionType?: string
}

/**
 * Where a deposit lands, resolved the way `/eoa` resolves it: UDA params win
 * over the config, and a dynamic candidate wins over `targetAsset`.
 *
 * Shared so callers that decide something about the destination — whether a
 * swap is needed, what to label — cannot answer for a different token than the
 * one the address is minted against.
 */
export function effectiveDepositTarget({
  checkoutConfig,
  udaParams,
  targetAssetOverride,
}: {
  checkoutConfig: CheckoutTokenTransferConfig | undefined
  udaParams?: UDAConfig | undefined
  targetAssetOverride?: Address
}): DepositTarget | undefined {
  if (!checkoutConfig?.targetChain) {
    return
  }
  if (udaParams) {
    return {
      chainId: udaParams.targetChain,
      address: udaParams.targetAsset,
      actionType: udaParams.qrcodeActionType,
    }
  }

  const candidates = checkoutConfig.dynamicTargetAssetCandidates
  if (candidates?.[0]) {
    const defaultCandidate =
      candidates.find((candidate) => candidate.isDefault) || candidates[0]
    return {
      chainId: defaultCandidate.tokenChainId,
      address: defaultCandidate.tokenAddress,
      actionType: checkoutConfig.qrcodeActionType,
    }
  }

  if (!checkoutConfig.targetAsset || checkoutConfig.targetAsset === '0x') {
    return
  }
  return {
    // The destination token may be overridden by a customer-specific rule
    // resolved on the web side (e.g. Polymarket Perps deposits land in pUSD).
    chainId: checkoutConfig.targetChain,
    address: targetAssetOverride ?? checkoutConfig.targetAsset,
    actionType: checkoutConfig.qrcodeActionType,
  }
}

export function getCheckoutTokenTransferParams({
  checkoutConfig,
  userId,
  recipientAddr,
  apiKey,
  udaParams,
  targetAssetOverride,
}: {
  checkoutConfig: CheckoutTokenTransferConfig | undefined
  userId: string
  recipientAddr: FunAddress
  apiKey: string
  udaParams?: UDAConfig | undefined
  /**
   * Resolved customer-specific destination-token override for the default
   * flow. Web supplies it (e.g. Polymarket Perps deposits target pUSD) so this
   * function stays customer-agnostic. When undefined, the config's
   * `targetAsset` is used.
   */
  targetAssetOverride?: Address
}) {
  if (recipientAddr === '0x' || userId === '0x') {
    return
  }
  const target = effectiveDepositTarget({
    checkoutConfig,
    udaParams,
    targetAssetOverride,
  })
  if (!target) {
    return
  }
  return {
    userId,
    apiKey,
    recipientAddr,
    actionType: target.actionType,
    toChainId: target.chainId,
    toTokenAddress: target.address,
  }
}

export interface MinTransferConfig {
  default: number
  chains: {
    [chainId: string]: number
  }
}

export function getMinTransferValueForChain(
  chainId: number,
  limits: MinTransferConfig | undefined,
) {
  // `limits` comes from a Statsig dynamic config that can render before it has
  // loaded (ENG-4326) — guard the lookup instead of trusting the static type.
  return limits?.chains?.[String(chainId)] ?? limits?.default ?? 0
}
