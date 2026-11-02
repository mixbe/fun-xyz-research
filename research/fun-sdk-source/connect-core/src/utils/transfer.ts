import type {
  CheckoutInitTokenTransferResponse,
  FunAddress,
} from '@funkit/api-base'
import { bitcoinChain, solanaChain, tronChain } from '@funkit/chains'
import { isEvmChainId } from './address'

export function getDepositAddressForChain(
  chainId: number,
  transferInit: CheckoutInitTokenTransferResponse | undefined,
): FunAddress | undefined {
  if (chainId === solanaChain.id) {
    return transferInit?.solanaAddr
  }
  if (chainId === bitcoinChain.id) {
    return transferInit?.btcAddrSegwit
  }
  if (chainId === tronChain.id) {
    return transferInit?.tronAddr
  }
  return transferInit?.depositAddr
}

/**
 * Whether a curated transfer chain should be offered to the user, given the
 * deposit init response. The non-EVM chains (Solana / Bitcoin / Tron) each need
 * their own deposit address, which is only present in the init response when the
 * backend minted one — so they're hidden until that address exists. EVM chains
 * share the single `depositAddr` and are always enabled. Withdrawals don't
 * deposit, so every chain is enabled there. Shared by web
 * (`useEnabledTokenTransferChainTokens`) and RN so the two can't drift.
 */
export function isTransferChainEnabled(
  chainId: number,
  transferInit: CheckoutInitTokenTransferResponse | undefined,
  isWithdrawal = false,
): boolean {
  if (isWithdrawal) {
    return true
  }
  if (chainId === solanaChain.id) {
    return !!transferInit?.solanaAddr
  }
  if (chainId === bitcoinChain.id) {
    return !!transferInit?.btcAddrSegwit
  }
  if (chainId === tronChain.id) {
    return !!transferInit?.tronAddr
  }
  return true
}

export type TransferTokenQrCodeType = 'ethereum' | 'solana' | 'bitcoin' | 'tron'

/** The address and URI family a transfer chain belongs to; every EVM chain is `ethereum`. */
export type TransferChainFamily = TransferTokenQrCodeType

/**
 * Which address family `chainId` deposits into. Address copy, QR URIs and
 * deposit-address lookup all branch on it, so one mapping keeps them agreeing.
 */
export function transferChainFamily(
  chainId: number | undefined,
): TransferChainFamily {
  if (chainId === solanaChain.id) {
    return 'solana'
  }
  if (chainId === bitcoinChain.id) {
    return 'bitcoin'
  }
  if (chainId === tronChain.id) {
    return 'tron'
  }
  return 'ethereum'
}

interface TransferTokenQrCodeUriParams {
  depositAddress: FunAddress
  type: TransferTokenQrCodeType
  /** Appended as an EIP-681 `@<chainId>` suffix. Ignored unless it's a real EVM chain id. */
  chainId?: number
}

export type QRCodeUri =
  | `ethereum:${FunAddress}`
  | `ethereum:${FunAddress}@${number}`
  | `solana:${FunAddress}`
  | `bitcoin:${FunAddress}`
  | FunAddress

export const getTransferTokenQrCodeUri = (
  props: TransferTokenQrCodeUriParams,
): QRCodeUri => {
  // - `@<chainId>` matches MetaMask's own receive QRs; chainless URIs hard-fail
  //   MM mobile's scanner with "Network not found" (ENG-4812).
  // - Known trade-off: some apps (e.g. Binance) don't parse EIP-681 and show the
  //   raw URI, but camera-app deep linking depends on the prefix, so we keep it.
  const { depositAddress, type, chainId } = props
  if (type === 'ethereum') {
    // Guards against sentinel ids (e.g. HyperCore's 1337) that fall through
    // to the `ethereum` type but aren't real EVM chains.
    return chainId !== undefined && isEvmChainId(chainId.toString())
      ? `ethereum:${depositAddress}@${chainId}`
      : `ethereum:${depositAddress}`
  }
  if (type === 'solana') {
    return `solana:${depositAddress}`
  }
  if (type === 'bitcoin') {
    return `bitcoin:${depositAddress}`
  }
  if (type === 'tron') {
    return depositAddress
  }
  throw new Error(`Invalid transfer token qr code type: ${type}`)
}
