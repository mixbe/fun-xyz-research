import { getExchangeRate } from '../utils/getExchangeRate'
import {
  type MinTransferConfig,
  getMinTransferValueForChain,
} from './checkoutTransfer'
import { PaymentMethod } from './paymentMethods'

// Single home for every min/max amount calculation shared across checkout,
// token transfer, and withdrawal flows. Platform hooks (web + RN) fetch the
// inputs — Statsig configs, fiat exchange rates, brokerage limits, the
// customer `getMinDepositUSD` closure — and delegate the math here so web and
// RN can't drift.

/** USD ceiling for a Bitcoin/Cash App Lightning checkout. */
export const MAX_BTC_LIGHTNING_AMOUNT_USD = 10_000

/** Extra USD headroom added to a card (Meld) minimum deposit. */
export const MELD_MIN_LIMIT_BUFFER = 5

/**
 * The active deposit target. `getMinDepositUSD` is the customer-configured
 * minimum for the destination token/chain; keeping it a passed-in closure
 * (rather than a customer branch) keeps this module customer-agnostic. All
 * fields are optional because RN resolves them lazily from host config.
 */
export interface MinDepositTarget {
  targetChain?: string
  targetAsset?: string
  dynamicRoutingId?: string
  getMinDepositUSD?: (ctx: {
    tokenChainId?: string
    tokenAddress?: string
    dynamicRoutingId?: string
  }) => number
}

/**
 * The customer-configured minimum deposit (USD) for a target, or 0 if none.
 * A non-finite closure return (NaN from a not-yet-loaded price) collapses to 0
 * so it can't poison the downstream limit math.
 */
export function getConfiguredMinDepositUsd(
  target: MinDepositTarget | undefined,
): number {
  const configured = target?.getMinDepositUSD?.({
    tokenChainId: target.targetChain,
    tokenAddress: target.targetAsset,
    dynamicRoutingId: target.dynamicRoutingId,
  })
  return Number.isFinite(configured) ? (configured as number) : 0
}

/**
 * Minimum token-transfer value (USD) for a chain: the Statsig per-chain floor
 * plus the target's already-resolved minimum-deposit add-on, rounded up to a
 * whole dollar. Callers resolve the add-on via {@link getConfiguredMinDepositUsd}
 * (or their own typed closure) so this stays free of the customer config type.
 */
export function getMinTransferValueUsd(
  chainId: number | undefined,
  limits: MinTransferConfig,
  minDepositAddOnUsd = 0,
): number {
  const chainMin =
    chainId !== undefined ? getMinTransferValueForChain(chainId, limits) : 0
  return Math.ceil(chainMin + minDepositAddOnUsd)
}

/**
 * Minimum token-transfer value converted to EUR — the fiat (Swapped) buy floor
 * the backend expects. The USD floor from {@link getMinTransferValueUsd} at the
 * live EUR rate, rounded up. Shared by web and RN so the two can't drift; falls
 * back to a 1:1 rate while rates load (see {@link convertUsdAmount}).
 */
export function getMinTransferValueEur(
  chainId: number | undefined,
  limits: MinTransferConfig,
  minDepositAddOnUsd: number,
  exchangeRates: Record<string, number> | undefined,
): number {
  const usd = getMinTransferValueUsd(chainId, limits, minDepositAddOnUsd)
  return convertUsdAmount(usd, 'EUR', exchangeRates, { round: true })
}

/**
 * Convert a USD amount to `currency` using the fiat exchange rates (no Meld
 * markup — bips 0). Falls back to a 1:1 rate while rates are loading. Set
 * `round` to ceil the result (used for display/limit floors).
 */
export function convertUsdAmount(
  usd: number,
  currency: string,
  exchangeRates: Record<string, number> | undefined,
  options?: { round?: boolean },
): number {
  const rate = getExchangeRate(currency, exchangeRates, 0) || 1
  const converted = usd * rate
  return options?.round ? Math.ceil(converted) : converted
}

/**
 * Card (Meld) minimum deposit in `currency`: the configured USD minimum
 * converted to the target currency, plus a buffer on card payments only.
 */
export function getMeldMinDepositInCurrency({
  minDepositUsd,
  paymentMethod,
  currency,
  exchangeRates,
}: {
  minDepositUsd: number
  paymentMethod?: PaymentMethod
  currency: string
  exchangeRates: Record<string, number> | undefined
}): number {
  const minDeposit = convertUsdAmount(minDepositUsd, currency, exchangeRates)
  // Only add the buffer for card when a configured minimum exists.
  if (paymentMethod === PaymentMethod.CARD && minDeposit) {
    return (
      minDeposit +
      convertUsdAmount(MELD_MIN_LIMIT_BUFFER, currency, exchangeRates)
    )
  }
  return minDeposit
}

export interface WithdrawalAmountValidation {
  isWithdrawAmountTooLow: boolean
  isWithdrawAmountTooHigh: boolean
  isWithdrawAmountAboveBalance: boolean
  isWithdrawAmountValid: boolean
  /** Min shown to the user: token-unit for per-token flows, USD otherwise. */
  minWithdrawalDisplayValue: number
}

/**
 * Validate a withdrawal amount against its min/max/balance bounds. Callers
 * resolve the raw limits — `perTokenMin`/`perTokenMax` (token units, taking
 * priority for flows where the source token varies), `usdMin`/`usdMax` — by
 * invoking their config closures, so this stays free of the customer config
 * type. USD bounds are converted to source-token units via the live spot price
 * for a like-for-like comparison; a non-positive price collapses them to no
 * floor / no cap, which is why a rail whose source has no price must express
 * its bounds per token or go unenforced.
 */
/**
 * A USD floor in token units, dropped to what the amount field can hold. An
 * amount carries no more precision than its token's, so the exact conversion
 * sits a fraction above every reachable value and rejects the floor itself —
 * a $10 minimum at $3/token would need $10.01 typed to clear it. Callers that
 * pass no decimals compare at full precision, as before.
 */
function floorToTokenPrecision(
  value: number,
  decimals: number | undefined,
): number {
  if (decimals === undefined) {
    return value
  }
  const scale = 10 ** decimals
  return Math.floor(value * scale) / scale
}

export function validateWithdrawalAmount({
  withdrawalInputAmount,
  sourceTokenUsdPrice,
  sourceTokenDecimals,
  sourceTokenBalance,
  perTokenMin,
  perTokenMax,
  usdMin,
  usdMax,
}: {
  /** User-entered amount in source-token units (e.g. "0.5" for 0.5 ETH). */
  withdrawalInputAmount: string
  sourceTokenUsdPrice: number
  /**
   * Fraction digits the source carries. Only matters where the price isn't 1 —
   * at parity the USD floor converts exactly and there is nothing to drop.
   */
  sourceTokenDecimals?: number
  sourceTokenBalance: string
  perTokenMin: number | undefined
  /** Optional: rails whose source has a resolvable price use `usdMax`. */
  perTokenMax?: number
  usdMin: number
  usdMax: number | undefined
}): WithdrawalAmountValidation {
  const minInSourceTokenUnits =
    perTokenMin ??
    (sourceTokenUsdPrice > 0
      ? floorToTokenPrecision(usdMin / sourceTokenUsdPrice, sourceTokenDecimals)
      : 0)
  const minWithdrawalDisplayValue = perTokenMin ?? usdMin
  const inputAmount = Number(withdrawalInputAmount)
  const isWithdrawAmountTooLow = inputAmount < minInSourceTokenUnits
  const maxInSourceTokenUnits =
    perTokenMax ??
    (usdMax !== undefined && sourceTokenUsdPrice > 0
      ? usdMax / sourceTokenUsdPrice
      : undefined)
  const isWithdrawAmountTooHigh =
    maxInSourceTokenUnits !== undefined && inputAmount > maxInSourceTokenUnits
  // Float comparison is fine here: users can't type enough significant digits
  // to hit IEEE-754 error. The precise base-unit conversion happens downstream
  // in `toWithdrawalAmountBaseUnit` (parseUnits on the original string).
  const isWithdrawAmountAboveBalance = inputAmount > Number(sourceTokenBalance)
  const isWithdrawAmountValid =
    !isWithdrawAmountTooLow &&
    !isWithdrawAmountTooHigh &&
    !isWithdrawAmountAboveBalance
  return {
    isWithdrawAmountTooLow,
    isWithdrawAmountTooHigh,
    isWithdrawAmountAboveBalance,
    isWithdrawAmountValid,
    minWithdrawalDisplayValue,
  }
}

export interface CheckoutAmountLimitsUsd {
  minUsd: number | undefined
  maxUsd: number
}

/**
 * Min/max USD bounds for the checkout amount input, by payment method:
 * - Lightning carries the token-transfer floor and a fixed ceiling.
 * - Brokerage takes the larger of the brokerage and configured minimums.
 * - Everything else uses the configured minimum and the global max.
 */
export function getCheckoutAmountLimitsUsd({
  paymentMethod,
  minDepositUsd,
  minTransferValueUsd,
  brokerageMinUsd,
  maxDepositUsd,
}: {
  paymentMethod: PaymentMethod
  minDepositUsd: number | undefined
  minTransferValueUsd: number
  brokerageMinUsd: number | undefined
  maxDepositUsd: number
}): CheckoutAmountLimitsUsd {
  switch (paymentMethod) {
    case PaymentMethod.BITCOIN_LIGHTNING:
    case PaymentMethod.CASH_APP_LIGHTNING:
      return {
        minUsd: minTransferValueUsd,
        maxUsd: MAX_BTC_LIGHTNING_AMOUNT_USD,
      }
    case PaymentMethod.BROKERAGE:
      return {
        minUsd: Math.max(brokerageMinUsd ?? 0, minDepositUsd ?? 0),
        maxUsd: maxDepositUsd,
      }
    default:
      return { minUsd: minDepositUsd, maxUsd: maxDepositUsd }
  }
}
