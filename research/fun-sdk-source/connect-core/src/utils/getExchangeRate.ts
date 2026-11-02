const DEFAULT_BIPS_MARKUP = 500 // 5%

/**
 * Get the exchange rate for a given currency or return undefined if not found or any of the arguments are undefined
 */
export const getExchangeRate = (
  currency: string | undefined,
  currencyExchangeRates: Record<string, number> | undefined,

  // estimated markup in bips that meld will apply to the exchange rate
  bipsMarkup: number = DEFAULT_BIPS_MARKUP,
) => {
  if (!currency || !currencyExchangeRates) {
    return undefined
  }

  if (currency === 'USD') {
    return 1
  }

  const exchangeRate =
    currency in currencyExchangeRates
      ? currencyExchangeRates[currency as keyof typeof currencyExchangeRates]
      : undefined

  if (!exchangeRate) {
    return undefined
  }

  return exchangeRate * (1 + bipsMarkup / 10000)
}
