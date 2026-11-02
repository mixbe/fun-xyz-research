interface FormatNumberOptions {
  /** Numbers smaller than this will be converted to scientific notation */
  minBeforeUseScientific?: number
  /** If the number part for suffixed # is >= this, will use sci notation (e.g. 1,000M -> 1E3M) */
  maxNumberPartSizeForSuffix?: number
  /** The amount of decimal places to truncate to when softly truncating (to specify decimal places for suffix-truncation, e.g. 1.23M, use decimalPrecisionForSuffix) */
  softDecimalPrecision?: number
  /** Numbers >= this will have their decimals truncated aggressively */
  maxBeforeAggresiveDecimalTruncation?: number
  /** The amount of decimal places to truncate to when aggressively truncating (to specify decimal places for suffix-truncation, e.g. 1.23M, use decimalPrecisionForSuffix) */
  aggresiveDecimalPrecision?: number
  /** Numbers >= this will have a suffix added during truncation (e.g. 1.23M) */
  maxBeforeUseSuffix?: number
  /** The amount of decimal places to truncate suffix-truncated numbers to (e.g. 1.23M vs 1.2312M)*/
  decimalPrecisionForSuffix?: number
  /** The largest suffix to use (e.g. if 1000000, we will stop at M and not use the B suffix) */
  maxSuffixSize?: 1e3 | 1e6 | 1e9 | 1e12
  numberFormatOptions?: Intl.NumberFormatOptions
  /** Adds minimum significant digits value to force numbers to show decimal precision even when there are none 5 -> 5.00  */
  minimumSignificantDigits?: number
}

const FORMAT_NUMBER_DEFAULT = {
  minBeforeUseScientific: 0.00001,
  maxBeforeAggresiveDecimalTruncation: 1,
  softDecimalPrecision: 5,
  aggresiveDecimalPrecision: 5,
  maxBeforeUseSuffix: 1000000,
  decimalPrecisionForSuffix: 5,
  maxSuffixSize: 1000000,
  maxNumberPartSizeForSuffix: 1e3,
  minimumSignificantDigits: 5,
} satisfies FormatNumberOptions

/**
 * Formats a number with conditional truncation, suffixation, and scientific notation.
 * @param number
 * @param options Customize the formatting conditions/behavior
 * @example Visualization, using default values:
 * ```
 * <--(1.23E-7)---0.00001------(0.12121)-------1-------(123,423.26)---1,000,000---(1.22M)--(100.23M)-->
 * _______<-minBeforeScientific       maxBeforeAggressive->      maxBeforeUseSuffix->         ^ w/ maxSuffixSize
 * ```
 */
export function formatNumberAndStringify(
  number: number,
  options: FormatNumberOptions = FORMAT_NUMBER_DEFAULT,
  numberFormatOptions: Intl.NumberFormatOptions = {},
) {
  const {
    minBeforeUseScientific,
    softDecimalPrecision,
    maxBeforeAggresiveDecimalTruncation,
    aggresiveDecimalPrecision,
    maxBeforeUseSuffix,
    decimalPrecisionForSuffix,
    maxSuffixSize,
    maxNumberPartSizeForSuffix,
  } = { ...FORMAT_NUMBER_DEFAULT, ...options }

  if (number === 0) {
    return number.toLocaleString('en', { ...numberFormatOptions })
  }
  if (!number) {
    return ''
  }
  const absoluteNumber = Math.abs(number)

  const roundedForSuffix = absoluteNumber.toFixed(decimalPrecisionForSuffix)
  // rounding to decimal precision may increment the number high enough to require a suffix
  if (Number(roundedForSuffix) >= maxBeforeUseSuffix) {
    return _formatTruncated(
      number,
      decimalPrecisionForSuffix,
      false,
      true,
      maxSuffixSize,
      maxNumberPartSizeForSuffix,
      numberFormatOptions,
    )
  }
  if (absoluteNumber >= maxBeforeAggresiveDecimalTruncation) {
    return number.toLocaleString('en', {
      maximumFractionDigits: aggresiveDecimalPrecision,
      ...numberFormatOptions,
    })
  }
  if (absoluteNumber < minBeforeUseScientific) {
    return number.toLocaleString('en', {
      notation: 'scientific',
      maximumFractionDigits: aggresiveDecimalPrecision,
      ...numberFormatOptions,
    })
  }
  // else, minBeforeScientific <= number < maxBeforeAggresive
  return number.toLocaleString('en', {
    maximumFractionDigits: softDecimalPrecision,
    // minimumSignificantDigits,
    // maximumSignificantDigits: minimumSignificantDigits,
    ...numberFormatOptions,
  })
}

/** Formats a number for currency (default $) display */
export function formatCurrencyAndStringify(
  amount: number,
  /** Options to pass `formatNumberAndStringify */
  options: FormatNumberOptions = {},
  /** Options to pass toLocaleString */
  numberFormatOptions: Intl.NumberFormatOptions = {},
) {
  const defaultOptions: FormatNumberOptions = {
    maxSuffixSize: 1e12,
    minBeforeUseScientific: 0.000001,
    decimalPrecisionForSuffix: 2,
    aggresiveDecimalPrecision: 2,
    softDecimalPrecision: 6,
    minimumSignificantDigits: 2,
  }
  const defaultNumberFormatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2, // This enforces two decimal places
    maximumFractionDigits: 2, // This limits to two decimal places, ensuring consistency
    compactDisplay: 'long',
  }

  const formattedAsString = formatNumberAndStringify(
    amount,
    { ...defaultOptions, ...options },
    {
      ...defaultNumberFormatOptions,
      ...numberFormatOptions,
    },
  )
  return formattedAsString
}

export function formatPercent(percent: number, decimalPlaces = 2) {
  const maxDecimal = String(percent).split('.')[1]?.length || 2
  const finalDecimal = Math.max(Math.min(maxDecimal, decimalPlaces), 2)
  return `${percent.toFixed(finalDecimal)}%`
}

/**
 * Formats a cryptocurrency amount as a string for display.
 *
 * Can customize with options and whether to display currency abbreviation.
 */
export function formatCryptoAndStringify(
  /** The currency amount **/
  amount: number,
  /** The currency abbreviation e.g. ETH, USDC, ... **/
  abbreviation = '',
  /** Displays abbreviation after amount, e.g. '1.25 ETH'; default true **/
  displayAbbreviation = true,
  /** Used to format the number, can be used to customize decimal truncation etc. **/
  options?: FormatNumberOptions,
) {
  const defaultOptions: FormatNumberOptions = {
    minimumSignificantDigits: 5,
  }
  const defaultNumberFormatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 5, // This enforces two decimal places
    maximumFractionDigits: 5, // This limits to two decimal places, ensuring consistency
  }
  const result = formatNumberAndStringify(
    amount,
    { ...defaultOptions, ...options },
    { ...defaultNumberFormatOptions, ...options?.numberFormatOptions },
  )

  if (displayAbbreviation && abbreviation) {
    return `${result} ${abbreviation}`
  }
  return result
}

function _formatTruncated(
  value: number,
  precision = 2,
  keepTrailingZeros = false,
  useComma = false,
  maxSuffixValue = 1e12,
  maxNumberPartSizeForSuffix = 1e3,
  numberFormatOptions = {},
) {
  if (!Number.isFinite(value)) {
    throw new Error('invalid number for `value` passed in to `formatTruncated`')
  }

  const negative = value < 0
  const absValue = Math.abs(value)

  function getFormattedNumberPartAndSuffix(
    divideBy: number,
    suffixStr = '',
    nextSuffixStr = '',
  ): [formatted: string, suffix: string] {
    const dividedVal = absValue / divideBy
    const rawDividedValRounded = dividedVal.toFixed(precision)

    // use sci notation for large number parts
    const useScientific =
      Number(rawDividedValRounded) >= maxNumberPartSizeForSuffix ||
      (divideBy === 1e12 && Number(rawDividedValRounded) >= 1e3) // anything >= 1,000T should be sci notation

    // the rounding that occurs due to decimal precision can increase the suffix size, e.g. 999.999999 -> 1K
    const incrementToNextSuffix =
      maxSuffixValue > divideBy && Number(rawDividedValRounded) >= 1000
    const suffix = !incrementToNextSuffix ? suffixStr : nextSuffixStr
    const dividedValRounded = !incrementToNextSuffix
      ? rawDividedValRounded
      : (Number(rawDividedValRounded) / 1000).toFixed(precision)

    if (useComma || useScientific) {
      return [
        Number(dividedValRounded).toLocaleString('en', {
          // don't use sci notation if the dividedValRounded is 1 because otherwise we get "1EB" instead of "1B"
          ...(useScientific &&
            Number(dividedValRounded) !== 1 && { notation: 'scientific' }),
          maximumFractionDigits: precision,
          ...numberFormatOptions,
        }),
        suffix,
      ]
    }
    return [dividedValRounded, suffix]
  }

  let [formatted, suffix] = getFormattedNumberPartAndSuffix(1, '', 'K')
  if (absValue >= 1e3 && (absValue < 1e6 || maxSuffixValue === 1e3)) {
    ;[formatted, suffix] = getFormattedNumberPartAndSuffix(1e3, 'K', 'M')
  } else if (absValue >= 1e6 && (absValue < 1e9 || maxSuffixValue === 1e6)) {
    ;[formatted, suffix] = getFormattedNumberPartAndSuffix(1e6, 'M', 'B')
  } else if (absValue >= 1e9 && (absValue < 1e12 || maxSuffixValue === 1e9)) {
    ;[formatted, suffix] = getFormattedNumberPartAndSuffix(1e9, 'B', 'T')
  } else if (absValue >= 1e12) {
    ;[formatted, suffix] = getFormattedNumberPartAndSuffix(1e12, 'T')
  }

  if (!keepTrailingZeros && !formatted?.includes('E')) {
    const [before, after] = formatted.split('.')
    const trimmedAfter = after?.replace(/0+$/gm, '')
    formatted = before ?? ''
    if ((trimmedAfter?.length ?? 0) > 0) {
      formatted += `.${trimmedAfter}`
    }
  }
  if (negative) {
    formatted = `-${formatted}`
  }
  formatted += suffix
  return formatted
}

export function round(
  value: number,
  decimals: number,
  /**
   * Whether to round up ('ceil'), down ('floor'), or nearest ('round')
   *
   * Defauls to 'round'
   **/
  method: 'ceil' | 'floor' | 'round' = 'round',
): number {
  return Math[method](value * 10 ** decimals) / 10 ** decimals
}
