import * as dnum from 'dnum'

import type { FunLogger } from './funLogger'

/**
 * The amount a withdrawal quote should price: the typed amount less a flat,
 * venue-charged fee, clamped at 0.
 *
 * - The deduction lands on the quote input rather than the typed amount, so the
 *   account is debited what the user typed and the remainder is what moves.
 * - `dnum` fixed-point, not float: `10.1 - 3` is `7.100000000000001` in binary
 *   floating point, and a quote key would refetch on that noise alone.
 */
export function deductFlatFee(
  inputAmount: string,
  feeTokenAmount: number,
): string {
  if (!feeTokenAmount || feeTokenAmount <= 0) {
    return inputAmount
  }
  try {
    const net = dnum.subtract(inputAmount || '0', feeTokenAmount)
    return dnum.greaterThan(net, 0) ? dnum.toString(net) : '0'
  } catch {
    return '0'
  }
}

/**
 * A share of a balance, for the percentage shortcuts on an amount field.
 *
 * - Always rounds down: at 100% a rounded-up share would exceed the balance,
 *   and below it the extra digit is dust the transfer can't carry anyway.
 * - `decimals` is the token's precision. Until it's known, two digits past
 *   whatever the balance carries is what dividing by 100 needs.
 */
export function percentOfAmount(
  balance: string,
  percent: number,
  decimals?: number,
): string {
  try {
    const [, balanceDecimals] = dnum.from(balance)
    const share = dnum.divide(dnum.multiply(balance, percent), 100, {
      decimals: decimals ?? balanceDecimals + 2,
      rounding: 'ROUND_DOWN',
    })
    return dnum.toString(share)
  } catch {
    return '0'
  }
}

/** Cents: what a USD figure is written to when it's the converted side. */
export const USD_DECIMALS = 2

/**
 * Precision to convert at until the token's own is known — decimals are read
 * on-chain, so the first keystrokes land before they arrive. A narrower
 * fallback would round a real amount away to `'0'`.
 */
const FALLBACK_TOKEN_DECIMALS = 18

/**
 * The token amount a USD figure buys, for a field typed in dollars.
 *
 * - Rounds down: a rounded-up amount can exceed the balance being spent from.
 * - A price of `0` is "unknown", so it yields `'0'` rather than dividing by it.
 */
export function usdToTokenAmount(
  usd: string,
  usdPrice: number,
  decimals?: number,
): string {
  if (!usdPrice || usdPrice <= 0) {
    return '0'
  }
  try {
    return dnum.toString(
      dnum.divide(usd, usdPrice, {
        decimals: decimals ?? FALLBACK_TOKEN_DECIMALS,
        rounding: 'ROUND_DOWN',
      }),
    )
  } catch {
    return '0'
  }
}

/**
 * What a token amount is worth, in cents. Rounds down rather than up to a cent
 * nobody has; `0` is "unknown", not free.
 */
export function tokenAmountToUsd(amount: string, usdPrice: number): string {
  if (!usdPrice || usdPrice <= 0) {
    return '0'
  }
  try {
    return dnum.toString(
      dnum.multiply(amount, usdPrice, {
        decimals: USD_DECIMALS,
        rounding: 'ROUND_DOWN',
      }),
    )
  } catch {
    return '0'
  }
}

/**
 * Decimal amounts only — narrower than `Number()`, which also accepts hex,
 * whitespace padding, `+` signs and `Infinity`. Exponent notation is allowed
 * because `String(number)` reaches for it at both extremes; so is a trailing
 * dot, which `parseUnits` accepts.
 */
const DECIMAL_RE = /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i

/**
 * Resolve the integrator's `withdrawalSourceTokenBalance` callback to a numeric
 * string. Generic over the callback params so each platform keeps its own shape
 * (web asks by `sourceAsset`, React Native by `sourceToken`).
 *
 * - `undefined` means no callback was supplied — distinct from a callback
 *   returning `0` ("nothing withdrawable").
 * - A throw or an unusable value yields `'0'`, never `undefined`: a broken
 *   callback must not read as "unknown" and let the form fall through to some
 *   other balance source.
 */
export function resolveWithdrawalSourceTokenBalance<TParams>(
  fn: ((params: TParams) => string | number) | undefined,
  params: TParams,
  logger: FunLogger,
): string | undefined {
  if (!fn) {
    return undefined
  }

  let raw: string | number | undefined
  try {
    raw = fn(params)
  } catch (error) {
    logger.warn('withdrawal:sourceTokenBalanceThrew', {
      error: error instanceof Error ? error.message : String(error),
    })
    return '0'
  }

  if (raw == null) {
    return '0'
  }
  const value = String(raw)
  // `isFinite` still earns its place: `'1e999'` is well-formed but overflows.
  if (!DECIMAL_RE.test(value) || !Number.isFinite(Number(value))) {
    logger.warn('withdrawal:invalidSourceTokenBalance', { raw })
    return '0'
  }
  return value
}
