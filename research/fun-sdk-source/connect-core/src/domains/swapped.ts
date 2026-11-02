import type {
  ExchangeRates,
  SwappedFormOfPayment,
  ThirdPartyPaymentConfigs,
} from '@funkit/api-base'
import {
  formatCurrencyAndStringify,
  normalizeAndValidateEmail,
} from '@funkit/utils'
import type { FunLogger } from '~/utils/funLogger'
import { getExchangeRate } from '~/utils/getExchangeRate'
import { convertUsdAmount } from './amountLimits'
import type { SwappedBuyingCrypto } from '~/utils/swapped'
import type { DynamicTargetAssetCandidate } from './dynamicTargetAsset'
import type { SyntheticFormOfPayment } from './syntheticFop'

export const FOPS_STALE_TIME = 1000 * 60 * 60 // 1 hour

/** Statsig `swappeddefaultinputamount` value. */
export interface SwappedDefaultInputAmountConfig {
  /** USD amount converted into the user's currency when no override matches. */
  fallbackUsd: number
  /** Amounts in the keyed currency, sent as-is. */
  currencyOverrides: Record<string, number>
}

/**
 * Amount prefilled into the Swapped on-ramp, in `fiatCurrencyCode`. Overrides
 * win; otherwise the USD fallback is converted (1:1 while rates are unknown)
 * and rounded up to a whole unit. Swapped raises anything under its minimum.
 */
export function getSwappedDefaultInputAmount(
  defaultInputAmountConfig: SwappedDefaultInputAmountConfig,
  fiatCurrencyCode: string,
  exchangeRates: ExchangeRates | undefined,
): number {
  const { fallbackUsd, currencyOverrides } = defaultInputAmountConfig
  if (currencyOverrides?.[fiatCurrencyCode]) {
    return currencyOverrides?.[fiatCurrencyCode]
  }

  return convertUsdAmount(fallbackUsd, fiatCurrencyCode, exchangeRates, {
    round: true,
  })
}

/**
 * Integrator tickers double as display labels — `'USDT0 (Perps)'`,
 * `'USDC (Spot)'` — and the Swapped row only has space for the token itself.
 * Drop one trailing parenthetical; the token is the same either way. String
 * ops rather than a regex: the label is integrator input and `\s*…\s*$`
 * patterns are quadratic on runs of spaces.
 */
export function toSwappedBuyingCryptoTicker(label: string): string {
  const trimmed = label.trim()
  if (!trimmed.endsWith(')')) {
    return trimmed
  }
  const open = trimmed.lastIndexOf('(')
  // No opener, or the parenthetical is the whole label — nothing to strip.
  if (open <= 0) {
    return trimmed
  }
  const inner = trimmed.slice(open + 1, -1)
  if (inner.includes('(') || inner.includes(')')) {
    return trimmed
  }
  return trimmed.slice(0, open).trimEnd()
}

/**
 * The destination token to show in the Swapped on-ramp, or `undefined` to
 * hide the row. Shown by default — `show: false` is the opt-out for deposits
 * where the row adds nothing (a plain USDC deposit reading "of USDC").
 *
 * Web passes the checkout config's `targetAssetTicker` / `iconSrc`, which
 * already reflect the selected dynamic candidate (see
 * `mergeDynamicTargetAssetCandidateIntoConfig`). RN has no static ticker and
 * passes the selected candidate instead. Either way both halves are required:
 * the embed renders ticker + icon as one row, so half a pair hides it.
 */
export function getSwappedBuyingCrypto({
  show = true,
  candidate,
  targetAssetTicker,
  iconSrc,
}: {
  /** `false` hides the row regardless of the token. Defaults to shown. */
  show?: boolean
  candidate?: Pick<DynamicTargetAssetCandidate, 'tokenSymbol' | 'iconSrc'>
  targetAssetTicker?: string
  iconSrc?: string
}): SwappedBuyingCrypto | undefined {
  if (!show) {
    return undefined
  }
  // Taken as a pair: a candidate supplies both halves or neither. Falling back
  // per-field let a candidate that omits `tokenSymbol` borrow the config's
  // ticker while keeping the candidate's icon — a row naming a token the user
  // is not buying. Both fields are typed `string`, but candidates reach us
  // from integrator config at runtime, where the types are advisory.
  const { ticker, src } = candidate
    ? { ticker: candidate.tokenSymbol, src: candidate.iconSrc }
    : { ticker: targetAssetTicker, src: iconSrc }
  if (!ticker || !src) {
    return undefined
  }
  const buyingCrypto = toSwappedBuyingCryptoTicker(ticker)
  if (!buyingCrypto) {
    return undefined
  }
  return { buyingCrypto, buyingCryptoSrc: src }
}

export interface SwappedThirdPartyPaymentConfigsParams {
  /** Integrator-supplied email prefilled into the Swapped widget, if any. */
  prefillFiatEmail: string | undefined
  /** Theme query params the API bakes into the returned `embeddedFlowUrl`. */
  themeConfig: Record<string, string>
  /** Call-site prefix for the decision log, e.g. `'useFops'`. */
  logTag: string
  logger: FunLogger
}

/**
 * Build the Swapped `thirdPartyPaymentConfigs` for a /fops request, shared by
 * the on- and off-ramp fops queries on both web and React Native.
 *
 * `prefillFiatEmail` is normalized + validated here, but the backend is the
 * authoritative validator: invalid emails are dropped (never block checkout)
 * and the email value is never logged (PII).
 */
export function buildSwappedThirdPartyPaymentConfigs({
  prefillFiatEmail,
  themeConfig,
  logTag,
  logger,
}: SwappedThirdPartyPaymentConfigsParams): ThirdPartyPaymentConfigs {
  const normalizedEmail = prefillFiatEmail
    ? normalizeAndValidateEmail(prefillFiatEmail)
    : null
  if (prefillFiatEmail) {
    logger.info(`${logTag}:swappedPrefillEmail`, {
      swappedPrefillEmail: normalizedEmail ? 'forwarded' : 'dropped:invalid',
    })
  }
  const swapped = {
    themeConfig,
    ...(normalizedEmail && { email: normalizedEmail }),
  }
  return { swapped }
}

/**
 * Sorts fops by a priority order list (array of fopType strings, index = priority).
 * Fops not in the list are sorted by max checkout limit descending.
 */
export function sortFops<
  T extends SwappedFormOfPayment | SyntheticFormOfPayment,
>(fops: T[], priorityOrder: readonly string[]): T[] {
  return [...fops].sort((a, b) => {
    const priorityA = priorityOrder.indexOf(a.fopType)
    const priorityB = priorityOrder.indexOf(b.fopType)
    const hasA = priorityA !== -1
    const hasB = priorityB !== -1

    if (hasA && hasB) {
      return priorityA - priorityB
    }
    if (hasA) {
      return -1
    }
    if (hasB) {
      return 1
    }

    // no specific priority, default to sort by max limit
    const maxA = a.metadata?.checkoutLimit?.maxAmount?.amount ?? 0
    const maxB = b.metadata?.checkoutLimit?.maxAmount?.amount ?? 0
    return maxB - maxA
  })
}

/**
 * Rounds to:
 * - >= $1M: nearest $100,000 (one decimal of "M" once compact-formatted, e.g. $1.4M)
 * - >= $1000: nearest $1000
 * - >= $100: down to nearest $100
 * - >= $10: down to nearest $10
 * - < $10: down to nearest $1 (floored to whole number)
 */
export function roundFopsLimit(value: number): number {
  if (value >= 1_000_000) {
    return Math.round(value / 100_000) * 100_000
  }
  if (value >= 1_000) {
    return Math.round(value / 1_000) * 1_000
  }
  if (value >= 100) {
    return Math.floor(value / 100) * 100
  }
  if (value >= 10) {
    return Math.floor(value / 10) * 10
  }
  return Math.floor(value)
}

/**
 * Convert a FOP's max checkout limit to USD. Backend returns min/max in the
 * user's fiat (often EUR); returns undefined when the rate or amount is missing.
 */
function fopMaxAmountToUsd(
  fop: SwappedFormOfPayment,
  exchangeRates: ExchangeRates | undefined,
): number | undefined {
  const checkoutLimit = fop?.metadata?.checkoutLimit
  const fiatCurrencyCode = checkoutLimit?.maxAmount?.fiatCurrencyCode
  const maxAmount = checkoutLimit?.maxAmount?.amount
  const exchangeRate = getExchangeRate(fiatCurrencyCode, exchangeRates, 0)

  if (!exchangeRate || maxAmount == null) {
    return undefined
  }
  return maxAmount / exchangeRate
}

/**
 * Deposit FOP limit: the payment method's own ceiling, rounded + compact-formatted
 * (e.g. "$5k", "$1.5M"). Approximating a cap is fine — see roundFopsLimit.
 */
export function getFopsLimit(
  fop: SwappedFormOfPayment,
  exchangeRates: ExchangeRates | undefined,
  defaultMaxLimit = '$10k',
) {
  const maxAmountInUsd = fopMaxAmountToUsd(fop, exchangeRates)
  if (maxAmountInUsd == null) {
    return defaultMaxLimit
  }

  const formatted = formatCurrencyAndStringify(roundFopsLimit(maxAmountInUsd), {
    maxBeforeUseSuffix: 1e3, // abbreviate at >= $1,000
    decimalPrecisionForSuffix: 1, // at most one decimal (e.g. 115.8)
  })
  // lowercase only the k suffix; keep M/B/T uppercase
  return formatted.replace(/K$/, 'k')
}

/**
 * Withdrawal disclaimer limit. A limit only matters when the user's balance can
 * exceed it; below that the method is effectively unlimited for this user, so
 * return undefined (no limit shown). The backend clamps each method's max to the
 * cap we send (eurMaxCap, EUR = balance), so max < cap ⇒ the method's real
 * limit (shown deposit-rounded); max at/above the cap ⇒ balance-bound ⇒ hidden.
 */
export function getWithdrawalFopsDisclaimerLimit(
  fop: SwappedFormOfPayment,
  exchangeRates: ExchangeRates | undefined,
  eurMaxCap: number | undefined,
): string | undefined {
  const maxAmountInUsd = fopMaxAmountToUsd(fop, exchangeRates)
  // No known max: don't invent a "$10k limit" for the user's own money.
  if (maxAmountInUsd == null) {
    return undefined
  }
  if (eurMaxCap != null) {
    const eurRate = getExchangeRate('EUR', exchangeRates, 0)
    const capInUsd = eurRate ? eurMaxCap / eurRate : undefined
    if (capInUsd != null && maxAmountInUsd >= capInUsd) {
      return undefined
    }
  }
  return getFopsLimit(fop, exchangeRates)
}

/**
 * Withdrawal FOP limit: the user's withdrawable balance, not a payment-method cap.
 * Shown as the exact figure floored to whole dollars (never display more than is
 * withdrawable) with separators and no suffix — rounding would understate the
 * user's real money.
 */
export function getWithdrawalFopsLimit(
  fop: SwappedFormOfPayment,
  exchangeRates: ExchangeRates | undefined,
  defaultMaxLimit = '$10k',
) {
  const maxAmountInUsd = fopMaxAmountToUsd(fop, exchangeRates)
  if (maxAmountInUsd == null) {
    return defaultMaxLimit
  }

  return formatCurrencyAndStringify(
    Math.floor(maxAmountInUsd),
    { maxBeforeUseSuffix: Number.MAX_SAFE_INTEGER }, // never abbreviate
    { minimumFractionDigits: 0, maximumFractionDigits: 0 }, // whole dollars
  )
}
