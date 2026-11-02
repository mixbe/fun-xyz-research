export const HYPER_EVM_CHAIN_ID = 999
export const ETHEREAL_CHAIN_ID = 5064014
export const LIGHTER_CHAIN_ID = 3586256
// Lighter's Robinhood instance (Relay chain id). Account indexes are per instance.
export const LIGHTER_RH_CHAIN_ID = 548123634
export const MONAD_CHAIN_ID = 143
export const SOLANA_MAINNET_CHAIN_ID = 1151111081099710
export const HYPERCORE_CHAIN_ID = 1337
export const BITCOIN_MAINNET_CHAIN_ID = 8253038
export const LIGHTNING_MAINNET_CHAIN_ID = 29780
export const TRON_MAINNET_CHAIN_ID = 728126428
export const ROBINHOOD_MAINNET_CHAIN_ID = 4663

// The non-EVM chains funkit supports. Add every new one here so EVM-only flows
// (EIP-747, wagmi, EVM deposit-address sharing) keep skipping it.
export const NON_EVM_CHAIN_IDS: ReadonlySet<number> = new Set([
  SOLANA_MAINNET_CHAIN_ID,
  TRON_MAINNET_CHAIN_ID,
  BITCOIN_MAINNET_CHAIN_ID,
  LIGHTNING_MAINNET_CHAIN_ID,
  HYPERCORE_CHAIN_ID,
  LIGHTER_CHAIN_ID,
  LIGHTER_RH_CHAIN_ID,
])

export function isSolanaChainId(chainId: string | number): boolean {
  return Number(chainId) === SOLANA_MAINNET_CHAIN_ID
}

export function isHypercoreChainId(chainId: string | number): boolean {
  return Number(chainId) === HYPERCORE_CHAIN_ID
}

export const LIGHTER_CHAIN_IDS = [
  LIGHTER_CHAIN_ID,
  LIGHTER_RH_CHAIN_ID,
] as const
export type LighterChainId = (typeof LIGHTER_CHAIN_IDS)[number]

/** The Lighter instance `chainId` names; undefined for any other chain. */
export function toLighterChainId(
  chainId: string | number | undefined,
): LighterChainId | undefined {
  return LIGHTER_CHAIN_IDS.find((id) => id === Number(chainId))
}

export function isLighterChainId(
  chainId: string | number | undefined,
): boolean {
  return toLighterChainId(chainId) !== undefined
}

/** Each instance's API host; the chain definitions' RPC URLs read from here. */
export const LIGHTER_API_BASE_URL_BY_CHAIN_ID: Record<LighterChainId, string> =
  {
    [LIGHTER_CHAIN_ID]: 'https://mainnet.zklighter.elliot.ai',
    [LIGHTER_RH_CHAIN_ID]: 'https://api.rh.lighter.xyz',
  }

export function getLighterApiBaseUrl(chainId: LighterChainId): string {
  return LIGHTER_API_BASE_URL_BY_CHAIN_ID[chainId]
}

/** Lighter's signing domain IDs, distinct from Relay's Lighter chain IDs. */
export const LIGHTER_SIGNER_CHAIN_ID_BY_INSTANCE: Readonly<
  Record<LighterChainId, number>
> = {
  [LIGHTER_CHAIN_ID]: 304,
  [LIGHTER_RH_CHAIN_ID]: 466324,
}
