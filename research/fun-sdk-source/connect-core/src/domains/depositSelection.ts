import { isAddressEquivalent } from '@funkit/utils'
import type { UDAConfig } from '~/domains/checkoutTransfer'

/**
 * Pure token-first deposit selection: grouping the curated transfer tokens by
 * symbol, resolving a (token, chain) pick, and choosing the default pair. Shared
 * so web and RN pick the same source token and network for the same config.
 */

/**
 * One curated deposit token (chain + asset), produced from the resolved
 * `tokentransferconfig`.
 */
export interface SupportedDepositToken {
  id: string
  symbol: string
  /** The token's display name from `/assets/supported`, e.g. "USD Coin". */
  name?: string
  /** The token's logo URL from `/assets/supported`. */
  logo?: string
  /** Chain shown on the trailing side, e.g. "Ethereum". */
  chainLabel: string
  /** Numeric chain id — used to derive the available-chains list + re-target. */
  chainId?: number
  /** Token contract address. */
  address?: string
  /**
   * Required for `lockAmount` unless curated metadata supplies precision for
   * this chain and address. Tokens without precision are excluded in locked flows.
   */
  decimals?: number
}

/** The part of a network row selection needs; platforms add display fields. */
export interface DepositChain {
  /** Numeric chain id as a string. */
  id: string
}

export interface DepositSourceToken extends SupportedDepositToken {
  chainId: number
  address: string
  decimals: number
}

export interface DepositAsset {
  id: string
  symbol: string
  tokens: DepositSourceToken[]
}

export interface DepositAssetExclusion {
  symbol: string
  chainId?: number
  reason: 'invalid-metadata' | 'ambiguous-contract'
  conflictingAddresses?: string[]
}

/** A picker selection resolved to its source token and network. */
export interface ResolvedDepositSelection<
  Chain extends DepositChain = DepositChain,
> {
  token: DepositSourceToken
  chain: Chain
}

export function assetId(symbol: string): string {
  return symbol.toUpperCase()
}

export function depositAddressesEqual(left?: string, right?: string) {
  if (typeof left !== 'string' || typeof right !== 'string') {
    return false
  }
  return isAddressEquivalent({ firstAddress: left, secondAddress: right })
}

function resolveDecimals(
  configured: SupportedDepositToken,
  metadata: SupportedDepositToken[],
): number | undefined {
  return (
    configured.decimals ??
    metadata.find(
      (entry) =>
        entry.chainId === configured.chainId &&
        depositAddressesEqual(entry.address, configured.address),
    )?.decimals
  )
}

function isValidChainId(chainId: number | undefined): chainId is number {
  return chainId !== undefined && Number.isSafeInteger(chainId) && chainId > 0
}

function isValidDecimals(decimals: number | undefined): decimals is number {
  return (
    decimals !== undefined &&
    Number.isInteger(decimals) &&
    decimals >= 0 &&
    decimals <= 255
  )
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim())
}

function toSourceToken(
  token: SupportedDepositToken,
  decimals: number | undefined,
): DepositSourceToken | undefined {
  const { chainId, address, symbol } = token
  if (
    !isValidChainId(chainId) ||
    !isNonBlankString(address) ||
    !isValidDecimals(decimals) ||
    !isNonBlankString(symbol)
  ) {
    return undefined
  }
  return { ...token, chainId, address, decimals }
}

type DepositAssetInput = DepositSourceToken | DepositAssetExclusion

function groupBySymbol(inputs: DepositAssetInput[]): {
  assets: DepositAsset[]
  exclusions: DepositAssetExclusion[]
} {
  const groups = new Map<string, DepositAsset>()
  const ambiguous = new Set<string>()
  const exclusions: DepositAssetExclusion[] = []
  for (const input of inputs) {
    if ('reason' in input) {
      exclusions.push(input)
      continue
    }
    const id = assetId(input.symbol)
    const group = groups.get(id) ?? { id, symbol: input.symbol, tokens: [] }
    const networkKey = `${id}:${input.chainId}`
    if (ambiguous.has(networkKey)) {
      continue
    }
    const existing = group.tokens.find(
      (entry) => entry.chainId === input.chainId,
    )
    if (existing) {
      if (depositAddressesEqual(existing.address, input.address)) {
        continue
      }
      group.tokens = group.tokens.filter(
        (entry) => entry.chainId !== input.chainId,
      )
      exclusions.push({
        symbol: input.symbol,
        chainId: input.chainId,
        reason: 'ambiguous-contract',
        conflictingAddresses: [existing.address, input.address],
      })
      ambiguous.add(networkKey)
      continue
    }
    group.tokens.push(input)
    groups.set(id, group)
  }
  return {
    assets: [...groups.values()].filter((group) => group.tokens.length > 0),
    exclusions,
  }
}

/** Group curated tickers; exclude all contracts for a symbol/network collision. */
export function depositAssets(
  tokens: SupportedDepositToken[],
  chains: DepositChain[],
  metadata: SupportedDepositToken[] = tokens,
): { assets: DepositAsset[]; exclusions: DepositAssetExclusion[] } {
  const enabled = new Set(chains.map((chain) => chain.id))
  const inputs: DepositAssetInput[] = []
  for (const configured of tokens) {
    // A missing chain ID is invalid metadata, not a disabled network.
    if (
      configured.chainId !== undefined &&
      !enabled.has(String(configured.chainId))
    ) {
      continue
    }
    const token = toSourceToken(
      configured,
      resolveDecimals(configured, metadata),
    )
    inputs.push(
      token ?? {
        symbol: configured.symbol,
        chainId: configured.chainId,
        reason: 'invalid-metadata',
      },
    )
  }
  return groupBySymbol(inputs)
}

export function assetChains<Chain extends DepositChain>(
  assets: DepositAsset[],
  chains: Chain[],
): Chain[] {
  return chains.filter((chain) =>
    assets.some((asset) => tokenOnChain(asset, chain) !== undefined),
  )
}

export function tokenOnChain(
  asset: DepositAsset,
  chain: DepositChain,
): DepositSourceToken | undefined {
  return asset.tokens.find((token) => String(token.chainId) === chain.id)
}

export function resolveDepositSelection<Chain extends DepositChain>(
  assets: DepositAsset[],
  chains: Chain[],
  selection: { symbol: string; chainId: number },
): ResolvedDepositSelection<Chain> | undefined {
  const asset = assets.find((entry) => entry.id === assetId(selection.symbol))
  const chain = chains.find((entry) => Number(entry.id) === selection.chainId)
  if (!asset || !chain) {
    return undefined
  }
  const token = tokenOnChain(asset, chain)
  return token ? { token, chain } : undefined
}

/** A token symbol and the chains that carry it, as the token & chain grid lists them. */
export interface PickerToken {
  symbol: string
  chainIds: number[]
}

/** The chains, in display order, that can carry `symbol`. */
export function pickerChainsForToken<Chain extends DepositChain>(
  tokens: PickerToken[],
  chains: Chain[],
  symbol: string,
): Chain[] {
  const supported =
    tokens.find((token) => token.symbol === symbol)?.chainIds ?? []
  return chains.filter((chain) => supported.includes(Number(chain.id)))
}

export function pickerChainForToken(
  tokens: PickerToken[],
  chains: DepositChain[],
  symbol: string,
  preferred?: number,
): number | undefined {
  const compatible = pickerChainsForToken(tokens, chains, symbol)
  const chain =
    compatible.find((entry) => Number(entry.id) === preferred) ?? compatible[0]
  return chain ? Number(chain.id) : undefined
}

function pickerTokens(assets: DepositAsset[]): PickerToken[] {
  return assets.map((asset) => ({
    symbol: asset.id,
    chainIds: asset.tokens.map((token) => token.chainId),
  }))
}

/** The chains that carry `symbol`, in display order. */
export function depositChainsForToken<Chain extends DepositChain>(
  assets: DepositAsset[],
  chains: Chain[],
  symbol: string,
): Chain[] {
  return pickerChainsForToken(pickerTokens(assets), chains, assetId(symbol))
}

/**
 * The token as `symbol`, on `preferredChainId` when that chain carries it and
 * otherwise on the first chain that does — the same rule as the token & chain
 * grid.
 */
export function selectDepositToken<Chain extends DepositChain>(
  assets: DepositAsset[],
  chains: Chain[],
  symbol: string,
  preferredChainId?: number,
): ResolvedDepositSelection<Chain> | undefined {
  const chainId = pickerChainForToken(
    pickerTokens(assets),
    chains,
    assetId(symbol),
    preferredChainId,
  )
  if (chainId === undefined) {
    return undefined
  }
  return resolveDepositSelection(assets, chains, { symbol, chainId })
}

/** The token as `symbol` on `chain`; undefined when the chain doesn't carry it. */
export function depositTokenOnChain(
  assets: DepositAsset[],
  chains: DepositChain[],
  symbol: string,
  chain: DepositChain,
): DepositSourceToken | undefined {
  return resolveDepositSelection(assets, chains, {
    symbol,
    chainId: Number(chain.id),
  })?.token
}

/** Which input decided the default pair; callers log it at the decision point. */
export type DefaultTransferSelectionSource =
  | 'override'
  | 'uda'
  | 'config'
  | 'first'

export interface DefaultTransferSelection<
  Chain extends DepositChain = DepositChain,
> extends ResolvedDepositSelection<Chain> {
  source: DefaultTransferSelectionSource
}

function parseChainId(chainId: string | number | undefined) {
  const parsed = Number(chainId)
  return isValidChainId(parsed) ? parsed : undefined
}

/** The first asset, in priority order, that `chain` carries. */
function firstTokenOnChain<Chain extends DepositChain>(
  assets: DepositAsset[],
  chain: Chain,
): ResolvedDepositSelection<Chain> | undefined {
  for (const asset of assets) {
    const token = tokenOnChain(asset, chain)
    if (token) {
      return { token, chain }
    }
  }
  return undefined
}

/**
 * The (token, chain) a transfer opens on before the user picks.
 *
 * Priority: a valid `override` pair (a remembered or in-flow pick) > the UDA
 * `defaultTokenSymbol`/`defaultChainId` > the config's default chain > the first
 * chain carrying any asset.
 * - An override only applies as a whole pair, so a stale pick never keeps its
 *   chain while silently swapping the token.
 * - A UDA token outranks the config chain: it moves to a chain that carries it.
 */
export function resolveDefaultTransferSelection<Chain extends DepositChain>({
  assets,
  chains,
  override,
  udaParams,
  configDefaultChainId,
}: {
  assets: DepositAsset[]
  chains: Chain[]
  override?: { symbol: string; chainId: number }
  udaParams?: Pick<UDAConfig, 'defaultTokenSymbol' | 'defaultChainId'>
  configDefaultChainId?: number
}): DefaultTransferSelection<Chain> | undefined {
  const overridden =
    override && resolveDepositSelection(assets, chains, override)
  if (overridden) {
    return { ...overridden, source: 'override' }
  }

  const udaChainId = parseChainId(udaParams?.defaultChainId)
  const configChainId = parseChainId(configDefaultChainId)
  const preferredChainIds: {
    chainId: number
    source: DefaultTransferSelectionSource
  }[] = []
  if (udaChainId !== undefined) {
    preferredChainIds.push({ chainId: udaChainId, source: 'uda' })
  }
  if (configChainId !== undefined) {
    preferredChainIds.push({ chainId: configChainId, source: 'config' })
  }

  const udaSymbol = udaParams?.defaultTokenSymbol
  if (udaSymbol) {
    const carrying = depositChainsForToken(assets, chains, udaSymbol)
    const preferred = preferredChainIds.find(({ chainId }) =>
      carrying.some((chain) => Number(chain.id) === chainId),
    )
    const selected = selectDepositToken(
      assets,
      chains,
      udaSymbol,
      preferred?.chainId,
    )
    if (selected) {
      return { ...selected, source: 'uda' }
    }
  }

  for (const { chainId, source } of preferredChainIds) {
    const chain = chains.find((entry) => Number(entry.id) === chainId)
    const selected = chain && firstTokenOnChain(assets, chain)
    if (selected) {
      return { ...selected, source }
    }
  }

  for (const chain of chains) {
    const selected = firstTokenOnChain(assets, chain)
    if (selected) {
      return { ...selected, source: 'first' }
    }
  }
  return undefined
}
