import type { XstocksNetwork } from './types'

/**
 * Map an EVM chain id to its xStocks network name. xStocks deployments are keyed
 * by network name, and EVM deployments of the same asset share one token address
 * across chains — so callers must select a deployment by network, not address.
 *
 * EVM chains only (the wrapped-token direct-transfer path is ERC-20); the
 * non-EVM networks (Solana, Tron, Ton) are intentionally omitted.
 */
const XSTOCKS_NETWORK_BY_CHAIN_ID: Record<number, XstocksNetwork> = {
  1: 'Ethereum',
  10: 'Optimism',
  56: 'BinanceSmartChain',
  100: 'Gnosis',
  137: 'Polygon',
  146: 'Sonic',
  196: 'XLayer',
  250: 'Fantom',
  999: 'HyperEVM',
  1135: 'Lisk',
  5000: 'Mantle',
  8453: 'Base',
  42161: 'Arbitrum',
  42793: 'Etherlink',
  43114: 'Avalanche',
  57073: 'Ink',
}

/**
 * Resolve the xStocks network name for a chain id (string or number), or
 * `undefined` for a non-EVM / unknown chain.
 */
export function xstocksNetworkFromChainId(
  chainId: string | number,
): XstocksNetwork | undefined {
  const id =
    typeof chainId === 'number' ? chainId : Number.parseInt(chainId, 10)
  return Number.isNaN(id) ? undefined : XSTOCKS_NETWORK_BY_CHAIN_ID[id]
}
