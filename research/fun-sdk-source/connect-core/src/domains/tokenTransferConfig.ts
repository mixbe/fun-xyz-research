import type {
  GetSupportedAssetsResponse,
  SupportedAssetInfo,
} from '@funkit/api-base'
import { FUNKIT_CONNECT_CHECKOUT_NATIVE_CURRENCY_ADDRESS } from '@funkit/chains'
import { isAddressEquivalent } from '@funkit/utils'

/**
 * Pure, platform-agnostic resolution of the token-transfer (UDA deposit) token
 * list. The displayed tokens are NOT the full `/assets/supported` allow-list —
 * they're the curated set from the Statsig `tokentransferconfig` (chains +
 * specific asset addresses), with `/assets/supported` only supplying metadata
 * (symbol / name / logo / decimals) for those addresses. This is the half of
 * web's `useTokenTransferConfig` that touches no DOM / providers, lifted here so
 * `@funkit/connect` (web) and `@funkit/connect-rn` (RN) share it. The React
 * hooks (Statsig reads + react-query) stay per-platform.
 */

/** Minimal logger surface used to warn about config/metadata mismatches. */
interface ResolverLogger {
  warn: (title: string, data?: object) => void
}

/** Raw asset entry from the Statsig `tokentransferconfig`. */
export interface TokenTransferAssetConfig {
  address: string
  /** Show a "New" badge. `'primary'` promotes it as the highlighted new token. */
  showNewBadge?: 'primary' | true
}

/** API metadata merged with the config-driven fields. */
export type ResolvedAssetInfo = SupportedAssetInfo & TokenTransferAssetConfig

/** Raw chain entry from the Statsig `tokentransferconfig`. */
export interface TokenTransferChainConfig {
  readonly chainId: number
  readonly isDefault?: boolean
  readonly assets: readonly TokenTransferAssetConfig[]
}

/** Resolved token-transfer config (the platform hook adds `isLoading`). */
export interface TokenTransferConfigResult {
  /** Supported assets filtered to the config, keyed by [chainId][address]. */
  supportedAssets: GetSupportedAssetsResponse
  /** chainId → display symbols. */
  symbolsByChainId: Record<number, string[]>
  /** Chain ids in config display order. */
  chainIdSortOrder: number[]
  /** Default chain id (from `isDefault`). */
  defaultChainId: number | undefined
  /** Symbols to prioritize at the top of the list. */
  priorityTokenSymbols: string[]
  /** Symbols with a "New" badge; the `'primary'` symbol is first. */
  newBadgeSymbols: Set<string>
  /**
   * chainId → (display symbol or alias) → original-case token address.
   * Lets callers resolve a selected symbol to its on-chain address without a
   * round-trip. Addresses keep their source casing (checksummed EVM, base58
   * Solana/Tron) — unlike `supportedAssets`, which is lowercase-keyed.
   */
  addressBySymbolByChainId: Record<number, Record<string, string>>
}

/**
 * Disabled overrides. Keys are chainId strings; values are token addresses, or
 * `["*"]` to disable the whole chain.
 */
export type DisabledChainsAndAssets = Record<string, string[]>

/** True if an entire chain is disabled (`["*"]`). */
export function isChainDisabled(
  disabledConfig: DisabledChainsAndAssets,
  chainId: number | string,
): boolean {
  return !!disabledConfig?.[String(chainId)]?.includes('*')
}

/** True if a chain+asset is disabled (chain `["*"]`, or the address). */
export function isAssetDisabled(
  disabledConfig: DisabledChainsAndAssets,
  chainId: number | string,
  tokenAddress: string,
): boolean {
  const disabledTokens = disabledConfig?.[String(chainId)]
  if (!disabledTokens) {
    return false
  }
  if (disabledTokens.includes('*')) {
    return true
  }
  return disabledTokens.some((disabledTokenAddress) =>
    isAddressEquivalent({
      firstAddress: disabledTokenAddress,
      secondAddress: tokenAddress,
    }),
  )
}

// Polygon mainnet — its native token was renamed MATIC → POL; show both.
const POLYGON_CHAIN_ID = 137
const POLYGON_NATIVE_TOKEN_ALIAS = 'MATIC'

/** Backend symbol inconsistencies normalized for display. */
const SYMBOL_OVERRIDES: Record<string, string> = {
  'USD₮0': 'USDT',
  USDT0: 'USDT',
}

function isNativeTokenAddress(address: string): boolean {
  return isAddressEquivalent({
    firstAddress: address,
    secondAddress: FUNKIT_CONNECT_CHECKOUT_NATIVE_CURRENCY_ADDRESS,
  })
}

function lowercaseAddressKeys(
  response: GetSupportedAssetsResponse,
): GetSupportedAssetsResponse {
  return Object.fromEntries(
    Object.entries(response).map(([chainId, chainAssets]) => [
      chainId,
      Object.fromEntries(
        Object.entries(chainAssets).map(([address, metadata]) => [
          address.toLowerCase(),
          metadata,
        ]),
      ),
    ]),
  )
}

function resolveSymbols(
  backendSymbol: string,
  chainId: number,
  address: string,
): { displaySymbol: string; alias?: string } {
  const displaySymbol = SYMBOL_OVERRIDES[backendSymbol] ?? backendSymbol
  const alias =
    chainId === POLYGON_CHAIN_ID && isNativeTokenAddress(address)
      ? POLYGON_NATIVE_TOKEN_ALIAS
      : undefined
  return { displaySymbol, alias }
}

function resolveChainAssets(
  chainConfig: TokenTransferChainConfig,
  chainAssets: Record<string, SupportedAssetInfo> | undefined,
  disabledChainAssets: DisabledChainsAndAssets,
  logger?: ResolverLogger,
): {
  assets: Record<string, ResolvedAssetInfo>
  symbols: string[]
  addressBySymbol: Record<string, string>
} {
  const { chainId } = chainConfig

  const resolvedChainAssets = chainConfig.assets
    .filter(
      (configAsset) =>
        !isAssetDisabled(disabledChainAssets, chainId, configAsset.address),
    )
    .map((configAsset) => {
      const address = configAsset.address.toLowerCase()
      const metadata = chainAssets?.[address]
      if (!metadata) {
        logger?.warn('tokenTransferConfig:tokenMetadataMissing', {
          chainId,
          address: configAsset.address,
        })
        return null
      }
      const { displaySymbol, alias } = resolveSymbols(
        metadata.symbol,
        chainId,
        address,
      )
      return {
        address,
        // Original casing for on-chain use (checksummed EVM, base58 Solana/Tron).
        originalAddress: configAsset.address,
        metadata: { ...configAsset, ...metadata, symbol: displaySymbol },
        alias,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const assets = Object.fromEntries(
    resolvedChainAssets.map(({ address, metadata }) => [address, metadata]),
  )

  const symbols = [
    ...new Set(
      resolvedChainAssets.flatMap(({ metadata, alias }) =>
        alias ? [metadata.symbol, alias] : [metadata.symbol],
      ),
    ),
  ]

  // Both the display symbol and its alias map to the same original-case address.
  const addressBySymbol: Record<string, string> = {}
  for (const { originalAddress, metadata, alias } of resolvedChainAssets) {
    addressBySymbol[metadata.symbol] = originalAddress
    if (alias) {
      addressBySymbol[alias] = originalAddress
    }
  }

  return { assets, symbols, addressBySymbol }
}

function resolveNewBadgeSymbols(
  resolvedChains: readonly {
    resolvedChainAssets: { assets: Record<string, ResolvedAssetInfo> }
  }[],
): Set<string> {
  const allBadgeAssets = resolvedChains.flatMap(({ resolvedChainAssets }) =>
    Object.values(resolvedChainAssets.assets).filter((a) => !!a.showNewBadge),
  )
  return new Set([
    ...allBadgeAssets
      .filter((a) => a.showNewBadge === 'primary')
      .map((a) => a.symbol),
    ...allBadgeAssets
      .filter((a) => a.showNewBadge !== 'primary')
      .map((a) => a.symbol),
  ])
}

/**
 * Build the token-transfer config by filtering `/assets/supported` through the
 * Statsig chain config + disabled list. Pure: pass the already-fetched data in.
 */
export function resolveTokenTransferConfig({
  chainConfigs,
  priorityTokens,
  disabledChainAssets,
  supportedAssets,
  logger,
}: {
  chainConfigs: readonly TokenTransferChainConfig[]
  priorityTokens: readonly string[]
  disabledChainAssets: DisabledChainsAndAssets
  supportedAssets: GetSupportedAssetsResponse
  logger?: ResolverLogger
}): TokenTransferConfigResult {
  const lowercasedAssets = lowercaseAddressKeys(supportedAssets)

  const resolvedChains = chainConfigs
    .filter((c) => !isChainDisabled(disabledChainAssets, c.chainId))
    .map((chainConfig) => ({
      chainConfig,
      resolvedChainAssets: resolveChainAssets(
        chainConfig,
        lowercasedAssets[String(chainConfig.chainId)],
        disabledChainAssets,
        logger,
      ),
    }))
    .filter(({ resolvedChainAssets }) => resolvedChainAssets.symbols.length > 0)

  const supportedAssetsOut = Object.fromEntries(
    resolvedChains.map(({ chainConfig, resolvedChainAssets }) => [
      chainConfig.chainId,
      resolvedChainAssets.assets,
    ]),
  )

  const symbolsByChainId = Object.fromEntries(
    resolvedChains.map(({ chainConfig, resolvedChainAssets }) => [
      chainConfig.chainId,
      resolvedChainAssets.symbols,
    ]),
  )

  return {
    supportedAssets: supportedAssetsOut,
    symbolsByChainId,
    chainIdSortOrder: resolvedChains.map(
      ({ chainConfig }) => chainConfig.chainId,
    ),
    defaultChainId: resolvedChains.find(
      ({ chainConfig }) => chainConfig.isDefault,
    )?.chainConfig.chainId,
    priorityTokenSymbols: [...priorityTokens],
    newBadgeSymbols: resolveNewBadgeSymbols(resolvedChains),
    addressBySymbolByChainId: Object.fromEntries(
      resolvedChains.map(({ chainConfig, resolvedChainAssets }) => [
        chainConfig.chainId,
        resolvedChainAssets.addressBySymbol,
      ]),
    ),
  }
}
