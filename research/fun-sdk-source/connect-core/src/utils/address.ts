import type { FunAddress, SolanaAddress } from '@funkit/api-base'
import { NON_EVM_CHAIN_IDS, solanaChain, tronChain } from '@funkit/chains'
import { formatAddressLastFour } from '@funkit/utils'
import { isAddress as isSolanaAddress } from '@solana/addresses'
import type { TFunction } from 'i18next'
import { getAddress, isAddress } from 'viem'

/**
 * Minimal structural shape needed for the wallet-label template. Web callers
 * pass the full `FunkitTextCustomizationsConfig` (which satisfies this); RN
 * callers can pass any object with `accountBalance`.
 */
interface AccountBalanceLabelOptions {
  accountBalance: string
}

export const getWalletLabel = (
  t: TFunction,
  textCustomizations: AccountBalanceLabelOptions,
  walletAddress?: string,
) => {
  if (walletAddress) {
    const formattedAddress = formatAddressLastFour(walletAddress)
    return t('checkout.walletLabelTemplate', {
      walletLabel: textCustomizations.accountBalance,
      formattedAddress,
    })
  }
  return t('checkout.connectWalletLabelTemplate', {
    walletLabel: textCustomizations.accountBalance,
  })
}

// TODO: Needs better validation, but avoiding installing tron-web sdk just for address validation
const TRON_ADDRESS_REGEX = /^T[1-9A-HJ-NP-Za-km-z]{33}$/
function isTronAddress(address: string): boolean {
  return TRON_ADDRESS_REGEX.test(address)
}

export function isWithdrawalAddressSupported(address: string): boolean {
  return (
    isAddress(address) || isSolanaAddress(address) || isTronAddress(address)
  )
}

/**
 * EIP-55 for EVM-shaped input, trimmed-only otherwise — Solana and Tron
 * addresses are case-sensitive. Keeps a hand-typed recipient from reaching an
 * API as two different strings for one address.
 */
export function normalizeRecipientAddress(address: FunAddress): FunAddress {
  const trimmed = address.trim()
  return isAddress(trimmed, { strict: false })
    ? getAddress(trimmed)
    : (trimmed as FunAddress)
}

/**
 * Check if the recipient address is compatible with selected chain.
 * Supports EVM, Solana, and Tron chains for withdrawal.
 */
export function isAddressCompatibleWithChain(
  address: string,
  chainId: number,
): boolean {
  if (chainId === solanaChain.id) {
    return isSolanaAddress(address)
  }
  if (chainId === tronChain.id) {
    return isTronAddress(address)
  }
  return isAddress(address)
}

/**
 * True for any positive-integer chain id that isn't a known non-EVM chain (see
 * `NON_EVM_CHAIN_IDS` in `@funkit/chains`).
 */
export function isEvmChainId(chainId: string | number): boolean {
  const parsed =
    typeof chainId === 'number' ? chainId : Number.parseInt(chainId, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return false
  }
  return !NON_EVM_CHAIN_IDS.has(parsed)
}

/** Single base58 gate for host-supplied Solana addresses. */
export function toValidatedSolanaAddress(
  address: string | undefined,
): SolanaAddress | undefined {
  return address && isSolanaAddress(address)
    ? (address as SolanaAddress)
    : undefined
}
