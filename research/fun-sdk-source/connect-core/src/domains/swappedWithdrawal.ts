import { DirectExecutionType, createDirectExecution } from '@funkit/api-base'
import { FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO } from '@funkit/chains'
import type { RelayQuoteResult } from '@funkit/fun-relay'
import {
  type ApiCheckoutClientMetadata,
  type CheckoutQuoteResponse,
  isTokenEquivalent,
} from '@funkit/utils'
import {
  type Address,
  type Hex,
  type PublicClient,
  erc20Abi,
  isAddress,
  parseUnits,
} from 'viem'
import type { SwappedSellOrderData } from '../interfaces/swappedTransport'
import type { WithdrawalClient } from '../interfaces/withdrawalClient'
import {
  isAddressCompatibleWithChain,
  isWithdrawalAddressSupported,
} from '../utils/address'
import type { FunLogger } from '../utils/funLogger'
import { randomUuid } from '../utils/randomUuid'
import { isUserRejectedError } from '../utils/signature'
import { PaymentMethod } from './paymentMethods'
import { fetchExactOutQuote, toClientMetadataQuote } from './quote'
import { ensureOnSourceChain, executeWithdrawalRelayQuote } from './withdrawal'

// The Swapped fiat off-ramp WITHDRAWAL domain: routing (source→accepted-token),
// order validation, and the on-chain execution pipeline. Quoting is a shared,
// provider-agnostic concern and lives in ./quote — this module consumes it.

// ── Routing ────────────────────────────────────────────────────────────────

/** Swapped's minimum sell amount, in EUR (its internal unit). */
export const SWAPPED_MIN_SELL_EUR = 7

/**
 * Balance-derived EUR cap for a Swapped sell: floor the USD balance converted
 * at `eurRate` so the sell never exceeds what the user holds and the /fops
 * query key stays stable against sub-unit balance jitter. Undefined when there
 * is no positive balance or the rate hasn't resolved (→ no cap).
 */
export function getSwappedSellCapEur(
  usdBalance: number,
  eurRate: number | undefined,
): number | undefined {
  return eurRate && usdBalance > 0
    ? Math.floor(usdBalance * eurRate)
    : undefined
}

/**
 * USD equivalent of Swapped's EUR sell minimum, for the "balance too low for
 * cash" gate. Undefined while the EUR rate is unresolved (gate stays open).
 */
export function getSwappedCashMinUsd(
  eurRate: number | undefined,
): number | undefined {
  return eurRate ? SWAPPED_MIN_SELL_EUR / eurRate : undefined
}

export interface SwappedSellLimits {
  defaultMinAmount: number
  defaultMaxAmount?: number
}

/**
 * The `checkoutLimitsCriteria` for a Swapped sell: always the fixed EUR
 * minimum, plus the balance-derived cap only when it clears the minimum (a max
 * at/below the min is a contradictory range for Swapped's iframe).
 */
export function buildSwappedSellLimits(
  eurMax: number | null | undefined,
): SwappedSellLimits {
  const capForwarded = eurMax != null && eurMax > SWAPPED_MIN_SELL_EUR
  return {
    defaultMinAmount: SWAPPED_MIN_SELL_EUR,
    ...(capForwarded ? { defaultMaxAmount: eurMax } : {}),
  }
}

/**
 * Operator override (Statsig `swappedwithdrawalsourceoverrides`) pinning a
 * Swapped withdrawal to a known-good accepted asset, keyed on the source asset,
 * for when the config's requested target isn't supported by Swapped. `when`
 * matches the source; `use` is the target the Relay quote delivers.
 */
export interface SwappedSourceRouteOverride {
  when: { chainId: string; tokenAddress: string }
  use: { chainId: string; tokenAddress: Address; symbol: string }
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0
const isSupportedChainId = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d+$/.test(value) &&
  Boolean(FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[Number(value)])
const isEvmAddress = (value: unknown): value is string =>
  typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value)

/**
 * Reject malformed/invalid entries (Statsig JSON is unchecked) so a bad rule
 * falls through to the config target instead of feeding a broken leg into the
 * quote. chainId must resolve to a funkit-supported chain, tokenAddress must be
 * a valid EVM address. Token-on-chain validity isn't purely checkable (no
 * registry — only async on-chain reads), so a wrong-but-well-formed address is
 * caught downstream when the quote reads its decimals.
 */
function isWellFormedOverride(override: SwappedSourceRouteOverride): boolean {
  return (
    isSupportedChainId(override.when?.chainId) &&
    isEvmAddress(override.when?.tokenAddress) &&
    isSupportedChainId(override.use?.chainId) &&
    isEvmAddress(override.use?.tokenAddress) &&
    isNonEmptyString(override.use?.symbol)
  )
}

/**
 * First well-formed override whose `when` matches the source asset, or
 * `undefined`. First match wins so ops can order more specific rules ahead of
 * broader ones.
 */
export function findSwappedSourceOverride(
  overrides: readonly SwappedSourceRouteOverride[] | undefined,
  source: { chainId: string; tokenAddress: string },
): SwappedSourceRouteOverride | undefined {
  return overrides?.find(
    (override) =>
      isWellFormedOverride(override) &&
      isTokenEquivalent({
        firstTokenChainId: override.when.chainId,
        firstTokenAddress: override.when.tokenAddress,
        secondTokenChainId: source.chainId,
        secondTokenAddress: source.tokenAddress,
      }),
  )
}

/** The token the user holds/sells (the on-chain source leg). */
export interface SwappedWithdrawalSourceToken {
  /** Numeric chain id as a string, matching api-base's token shapes. */
  chainId: string
  address: string
  symbol: string
}

/** The token Swapped accepts (the on-chain target leg), when ≠ source. */
export interface SwappedWithdrawalTargetToken {
  chainId: string
  address: string
  symbol: string
}

/**
 * On-chain legs of a Swapped order (source the user holds, target the provider
 * accepts). Target precedence: Statsig override `use` > configured target >
 * source (same-asset). Single source of truth for the FOP fetch and the quote —
 * they must agree or the `/fops` rail and the delivered asset diverge.
 */
export function resolveSwappedWithdrawalLegs({
  source,
  target,
  override,
}: {
  source: SwappedWithdrawalSourceToken
  target?: SwappedWithdrawalTargetToken
  override?: SwappedSourceRouteOverride
}) {
  const sourceChainId = Number(source.chainId)
  return {
    sourceChainId,
    sourceTokenAddress: source.address as Address,
    sourceTokenSymbol: source.symbol,
    targetTokenAddress: (override?.use.tokenAddress ??
      target?.address ??
      source.address) as Address,
    targetChainId:
      override?.use.chainId ?? target?.chainId ?? String(sourceChainId),
    targetTokenSymbol: override?.use.symbol ?? target?.symbol ?? source.symbol,
    overrideApplied: Boolean(override),
  }
}
export type SwappedWithdrawalLegs = ReturnType<
  typeof resolveSwappedWithdrawalLegs
>

// ── Order shape + validation ─────────────────────────────────────────────────

/**
 * Provider-agnostic fiat off-ramp order: deliver `amount` of the accepted
 * token to `destinationAddress`. Mirrors @funkit/connect's `FiatWithdrawalOrder`
 * (useFiatWithdrawal.ts) — keep the shapes in sync until web migrates here.
 */
export interface FiatWithdrawalOrder {
  orderId: string
  destinationAddress: Address
  /** Amount (human units) of the target/accepted token the provider expects. */
  amount: string
  /**
   * Provider-reported accepted asset, by name (e.g. `'USDC'` / `'base'`).
   * Informational only — surfaced in the route-decision log for reconciliation,
   * never used to determine routing (routing comes from the resolved legs).
   */
  providerCrypto?: string
  providerNetwork?: string
}

// Matches the exact grammar `parseUnits` accepts (plain decimal, no sign /
// exponent / whitespace / hex) so the guard and `toWithdrawalAmountBaseUnit`
// agree — anything the guard admits must convert without throwing.
const DECIMAL_AMOUNT_RE = /^\d+(\.\d+)?$/

/**
 * Guard for the embed's SWAPPED_ORDER_DATA payload. Rejected payloads take the
 * recoverable embed-error path rather than failing mid-execution:
 * - `address` becomes the relay recipient unvalidated, so it must fit the
 *   chain the accepted token lives on (`targetChainId`), or any supported
 *   chain when the caller has no route yet.
 * - `amount` drives the EXACT_OUT transaction, so it must be a positive plain
 *   decimal `parseUnits` can parse — no sign / exponent / whitespace / hex.
 */
export function isValidOrderData(
  data: SwappedSellOrderData | undefined,
  targetChainId?: string | number,
): data is SwappedSellOrderData {
  if (!data || !data.order_id || !data.address) {
    return false
  }
  const addressFitsChain =
    targetChainId == null
      ? isWithdrawalAddressSupported(data.address)
      : isAddressCompatibleWithChain(data.address, Number(targetChainId))
  if (!addressFitsChain) {
    return false
  }
  if (!DECIMAL_AMOUNT_RE.test(data.amount)) {
    return false
  }
  return Number(data.amount) > 0
}

/** Map a validated embed payload onto the provider-agnostic order shape. */
export function toFiatWithdrawalOrder(
  data: SwappedSellOrderData,
): FiatWithdrawalOrder {
  return {
    orderId: data.order_id,
    destinationAddress: data.address as Address,
    amount: data.amount,
    providerCrypto: data.crypto,
    providerNetwork: data.network,
  }
}

/**
 * Full-precision human-amount → base-unit conversion for the EXACT_OUT quote.
 *
 * Precision is preserved by passing the original amount string straight to
 * `parseUnits` — never coerced through a JS Number first. Fractional digits
 * beyond the token's precision are trimmed. Malformed input is left to throw:
 * for an EXACT_OUT order, silently sending a wrong amount is worse than
 * surfacing an error (the embed shows its error state). Callers gate on
 * {@link isValidOrderData} first, so valid orders never reach the throw.
 */
export function toWithdrawalAmountBaseUnit(
  amount: string,
  decimals: number,
): bigint {
  const [int, frac = ''] = amount.split('.')
  const trimmed =
    frac.length > decimals ? `${int}.${frac.slice(0, decimals)}` : amount
  return parseUnits(trimmed, decimals)
}

// ── Execution ────────────────────────────────────────────────────────────────

export type FiatWithdrawalErrorCode =
  | 'MISSING_DECIMALS_READER'
  | 'MISSING_RELAY_QUOTE'
  | 'MISSING_TX_HASH'

/** Typed pre-execution failure so callers can branch without string matching. */
export class FiatWithdrawalError extends Error {
  readonly code: FiatWithdrawalErrorCode
  constructor(code: FiatWithdrawalErrorCode, message: string) {
    super(message)
    this.name = 'FiatWithdrawalError'
    this.code = code
  }
}

export interface ProcessFiatWithdrawalOrderParams {
  order: FiatWithdrawalOrder
  wallet: WithdrawalClient
  legs: SwappedWithdrawalLegs
  apiKey: string
  userId: string
  logger: FunLogger
  /**
   * Read-only client on the TARGET chain for the erc20 `decimals()` read.
   * Unused (and optional) when `targetDecimals` is provided.
   */
  publicClient?: Pick<PublicClient, 'readContract'>
  /** Known target-token decimals — skips the on-chain read. */
  targetDecimals?: number
  /** Relay step progress (raw step action text), for optional host display. */
  onStepMessage?: (message: string) => void
}

/**
 * Minimal metadata for the DirectExecution record. Synthesized (there is no
 * checkout-item state machine outside web); `isWithdrawal: true` is what the
 * backend keys off for withdrawal handling. `id` is a uuid, matching web's
 * checkout-item id (frontend-only correlation key).
 */
function buildWithdrawalClientMetadata({
  quote,
  legs,
}: {
  quote: CheckoutQuoteResponse
  legs: SwappedWithdrawalLegs
}): ApiCheckoutClientMetadata {
  return {
    id: randomUuid(),
    startTimestampMs: Date.now(),
    finalDollarValue: quote.estTotalUsd,
    latestQuote: toClientMetadataQuote(quote, String(legs.sourceChainId)),
    depositAddress: null,
    initSettings: {
      config: {
        targetChain: legs.targetChainId,
        targetAsset: legs.targetTokenAddress,
        targetAssetTicker: legs.targetTokenSymbol,
      },
    },
    selectedPaymentMethodInfo: {
      paymentMethod: PaymentMethod.ACCOUNT_BALANCE,
      title: 'Account balance',
      description: '',
    },
    selectedSourceAssetInfo: {
      address: legs.sourceTokenAddress,
      symbol: legs.sourceTokenSymbol,
      chainId: String(legs.sourceChainId),
      iconSrc: null,
    },
    isWithdrawal: true,
  }
}

/**
 * The headless order → quote → execute → record pipeline for a Swapped fiat
 * off-ramp withdrawal (port of @funkit/connect's `useFiatWithdrawal` +
 * `confirmCheckout` direct-execution path, framework-free).
 *
 * Quoting is delegated to ./quote (EXACT_OUT) — the provider credits fiat on
 * the exact deposited amount, so we deliver exactly what it expects; the wallet
 * pays whatever source amount the quote requires. Callers own re-entrancy/dedupe
 * guards and user-rejection handling (see `isUserRejectedError`); pre-record
 * steps throw on failure. A failed reconciliation record after the tx settles
 * does NOT throw (see below), so the caller can't misread it as an execution
 * failure.
 *
 * Requires the process-global relay client to be initialized first
 * (`ensureRelayClientInitialized`).
 */
export async function processFiatWithdrawalOrder({
  order,
  wallet,
  legs,
  apiKey,
  userId,
  logger,
  publicClient,
  targetDecimals,
  onStepMessage,
}: ProcessFiatWithdrawalOrderParams): Promise<{
  txHash: Hex
  quote: CheckoutQuoteResponse
}> {
  await ensureOnSourceChain(wallet, legs.sourceChainId, logger)

  let decimals = targetDecimals
  if (decimals == null) {
    if (!publicClient) {
      throw new FiatWithdrawalError(
        'MISSING_DECIMALS_READER',
        'processFiatWithdrawalOrder needs targetDecimals or a publicClient on the target chain',
      )
    }
    decimals = await publicClient.readContract({
      address: legs.targetTokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    })
  }
  const toAmountBaseUnit = toWithdrawalAmountBaseUnit(order.amount, decimals)

  logger.info('fiat-withdrawal:fetching_quote', {
    order_id: order.orderId,
    fromToken: legs.sourceTokenAddress,
    toToken: legs.targetTokenAddress,
    toAmountBaseUnit: toAmountBaseUnit.toString(),
  })
  const userAddress = wallet.address() as Address
  const quote = await fetchExactOutQuote({
    apiKey,
    logger,
    fromChainId: String(legs.sourceChainId),
    fromTokenAddress: legs.sourceTokenAddress,
    toChainId: legs.targetChainId,
    toTokenAddress: legs.targetTokenAddress,
    recipientAddress: order.destinationAddress,
    userAddress,
    toAmountBaseUnit,
  })

  const relayQuote = quote.metadata?.relayQuote as
    | RelayQuoteResult<'evm'>
    | undefined
  if (!relayQuote) {
    throw new FiatWithdrawalError(
      'MISSING_RELAY_QUOTE',
      'Quote response carries no relay quote — cannot execute the withdrawal',
    )
  }

  const txHash = await executeWithdrawalRelayQuote({
    relayQuote,
    wallet,
    logger,
    rail: 'fiat-withdrawal',
    context: { order_id: order.orderId },
    onStepMessage,
  })
  if (!txHash) {
    throw new FiatWithdrawalError(
      'MISSING_TX_HASH',
      'Relay execution finished without a transaction hash',
    )
  }

  // The on-chain leg has settled. Log the provider order id ↔ tx hash BEFORE
  // recording, so the correlation survives even if the record call fails
  // (same key web logs — dashboards join on it).
  logger.info('fiat-withdrawal:submitted', {
    order_id: order.orderId,
    txHash,
  })

  // Record the withdrawal for backend reconciliation/history. If the quote was
  // routed through Across, override the type (parity with web's
  // startDirectExecutionCheckout). The record is best-effort: the funds have
  // already moved, so a failed record must NOT surface as an execution error —
  // that would let the caller retry and submit a second transaction. Log and
  // move on; the tx hash is already emitted above for reconciliation.
  const isAcrossRoute = Boolean(quote.metadata?.across?.enabled)
  try {
    await createDirectExecution({
      txHash,
      userId,
      recipientAddr: order.destinationAddress,
      type: isAcrossRoute
        ? DirectExecutionType.ACROSS
        : DirectExecutionType.RELAY,
      fromChainId: String(legs.sourceChainId),
      fromTokenAddress: legs.sourceTokenAddress,
      toChainId: legs.targetChainId,
      toTokenAddress: legs.targetTokenAddress,
      fromAmountBaseUnit: quote.estTotalFromAmountBaseUnit,
      toAmountBaseUnit:
        (quote.metadata?.toAmountBaseUnit as string | undefined) ??
        toAmountBaseUnit.toString(),
      estTotalUsd: quote.estTotalUsd,
      sourceOfFund: `${PaymentMethod.ACCOUNT_BALANCE}|eoa|${userAddress}`,
      clientMetadata: buildWithdrawalClientMetadata({ quote, legs }),
      apiKey,
      logger,
    })
  } catch (recordError) {
    logger.error('fiat-withdrawal:record_failed', recordError as Error, {
      order_id: order.orderId,
      txHash,
    })
  }

  return { txHash, quote }
}
