import { FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO } from '@funkit/chains'
import { type PublicClient, createPublicClient, fallback, http } from 'viem'

// One lazy client per chain, owned by the SDK — callers ask for a chain, not
// for a client, so no host has to supply RPC plumbing to move funds.
const clients = new Map<number, Pick<PublicClient, 'readContract'>>()

/**
 * Read-only client for a funkit-supported chain, built over the chain's
 * fallback RPC list from @funkit/chains (the chain's default RPC may be
 * private — e.g. the Robinhood chain — so the curated list matters).
 * `undefined` for unsupported chain ids.
 */
export function getPublicClientFor(
  chainId: number,
): Pick<PublicClient, 'readContract'> | undefined {
  const cached = clients.get(chainId)
  if (cached) {
    return cached
  }

  const info = FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[chainId]
  if (!info) {
    return undefined
  }

  const client = createPublicClient({
    chain: info.chainInfo,
    transport: info.fallbackRpcUrls.length
      ? fallback(info.fallbackRpcUrls.map((url) => http(url)))
      : http(),
  })
  clients.set(chainId, client)
  return client
}
