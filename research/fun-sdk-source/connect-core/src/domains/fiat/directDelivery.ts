import type { DestinationAsset as FiatDestinationAsset } from '@fun-xyz/fiat-contract/types'
import {
  FUNKIT_CONNECT_CHECKOUT_NATIVE_CURRENCY_ADDRESS,
  isSolanaChainId,
} from '@funkit/chains'
import { isAddressEquivalent, isTokenEquivalent } from '@funkit/utils'

import type { FiatDeliveryKind } from '~/interfaces/logTransport'
import { isEvmChainId } from '~/utils/address'

/** A token, named the way both the destination and the rail name one. */
export interface FiatAssetRef {
  /** Decimal chain id, e.g. `1151111081099710`. */
  chainId: string
  /** EVM contract address, or the SPL mint on Solana. */
  address: string
}

/**
 * Whether the rail already buys exactly what the destination holds, so the
 * purchased crypto can be delivered to the recipient's own address.
 *
 * Both sides are host-declared, so this asks nothing of the network. A flow
 * with no destination answers `false`: the deposit address it would skip is
 * what covers the swap.
 */
export function isDirectFiatDelivery({
  destination,
  rail,
}: {
  destination: FiatAssetRef | undefined
  rail: FiatAssetRef
}): boolean {
  if (destination === undefined) {
    return false
  }
  return isTokenEquivalent({
    firstTokenChainId: rail.chainId,
    firstTokenAddress: rail.address,
    secondTokenChainId: destination.chainId,
    secondTokenAddress: destination.address,
  })
}

// What a rail ticker buys on each chain. Only USDC is listed because every
// fiat rail prices in it today; another ticker leaves the delivery unknown.
const RAIL_ASSET_ADDRESSES: Record<string, Record<string, string>> = {
  USDC: {
    '1': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '10': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    '137': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    '8453': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    '42161': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    '1151111081099710': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
}

/**
 * Labels a fiat deposit for logs: `direct` when the destination is the token
 * the rail buys, `long_tail` when the backend must swap into it. `null` when
 * either side is unknown, so a guess never reaches the dashboards.
 *
 * Log labelling only. Routing stays with the backend, which compares the
 * destination with the partner's configured asset.
 */
export function fiatDeliveryKindOf({
  destination,
  railTicker,
}: {
  destination: FiatAssetRef | undefined
  railTicker: string | undefined
}): FiatDeliveryKind | null {
  if (destination === undefined || railTicker === undefined) {
    return null
  }
  const railAddress =
    RAIL_ASSET_ADDRESSES[railTicker.toUpperCase()]?.[destination.chainId]
  if (railAddress === undefined) {
    return null
  }
  return isDirectFiatDelivery({
    destination,
    rail: { chainId: destination.chainId, address: railAddress },
  })
    ? 'direct'
    : 'long_tail'
}

// The contract's `DestinationAssetSchema` checks, restated so the bundle does not pull in zod.
const EVM_CHAIN_ID = /^[1-9]\d*$/
const EVM_TOKEN_ADDRESS = /^0x[0-9a-fA-F]{40}$/
const SOLANA_TOKEN_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
// The backend's spelling of native SOL; the hex sentinel is funkit's for every chain.
const SOLANA_NATIVE_TOKEN = '11111111111111111111111111111111'

const isNativeToken = (address: string): boolean =>
  isAddressEquivalent({
    firstAddress: address,
    secondAddress: FUNKIT_CONNECT_CHECKOUT_NATIVE_CURRENCY_ADDRESS,
  })

/**
 * The `destinationAsset` the fiat requests carry for this target, or `undefined`
 * when the backend's strict schema would refuse it or the target is on a chain
 * the contract cannot name: one malformed field fails every routing table, so
 * a target it cannot name is left out instead.
 */
export function fiatDestinationAssetOf(
  target: FiatAssetRef | undefined,
): FiatDestinationAsset | undefined {
  if (target === undefined) {
    return undefined
  }
  const { chainId, address } = target
  if (isSolanaChainId(chainId)) {
    if (address === SOLANA_NATIVE_TOKEN || isNativeToken(address)) {
      return {
        vm: 'SOLANA',
        asset: { kind: 'FUNGIBLE', token: { type: 'NATIVE' } },
      }
    }
    return SOLANA_TOKEN_ADDRESS.test(address)
      ? {
          vm: 'SOLANA',
          asset: { kind: 'FUNGIBLE', token: { type: 'SPL', address } },
        }
      : undefined
  }
  if (!EVM_CHAIN_ID.test(chainId) || !isEvmChainId(chainId)) {
    return undefined
  }
  const evmChainId = Number(chainId)
  if (isNativeToken(address)) {
    return {
      vm: 'EVM',
      chainId: evmChainId,
      asset: { kind: 'FUNGIBLE', token: { type: 'NATIVE' } },
    }
  }
  return EVM_TOKEN_ADDRESS.test(address)
    ? {
        vm: 'EVM',
        chainId: evmChainId,
        asset: {
          kind: 'FUNGIBLE',
          token: { type: 'ERC20', address: address as `0x${string}` },
        },
      }
    : undefined
}
