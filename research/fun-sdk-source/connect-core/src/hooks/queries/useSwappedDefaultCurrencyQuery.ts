import { getSwappedSupportedCountries } from '@funkit/api-base'
import { type UseQueryResult, useQuery } from '@tanstack/react-query'

import type { FunLogger } from '~/utils/funLogger'
import { useFeatureGate } from '../statsig/useFeatureGate'

/** Fallback when the country → currency lookup is unavailable. */
export const DEFAULT_FIAT_CURRENCY = 'USD'

export interface SwappedDefaultCurrencyQueryParams {
  apiKey: string | undefined
  /** The user's ISO 3166-1 alpha-2 country (e.g. resolved from their IP). */
  countryCode: string | undefined
  logger: FunLogger
  /** Lets a caller that will not show cash methods skip the lookup. Defaults to true. */
  enabled?: boolean
}

/**
 * Params-shaped resolver shared by web and React Native: maps the user's
 * country (alpha2) to its Swapped default fiat currency via
 * `getSwappedSupportedCountries`. Falls back to USD when there's no apiKey, the
 * country hasn't resolved, or it isn't in Swapped's supported list. Feeds
 * `fiatCurrencyCode` in the /fops query so cash methods are quoted in the user's
 * regional currency.
 *
 * Identity, country, and the logger are injected by the platform layers. The
 * `disable-krw-default-currency` and `disable-dkk-default-currency` compliance
 * gates are the only deliberate context reads — resolved here so no call site
 * can forget them.
 */
export function useSwappedDefaultCurrencyQuery({
  apiKey,
  countryCode,
  logger,
  enabled = true,
}: SwappedDefaultCurrencyQueryParams): UseQueryResult<string> {
  const isKrwDefaultDisabled = useFeatureGate('disable-krw-default-currency')
  const isDkkDefaultDisabled = useFeatureGate('disable-dkk-default-currency')

  return useQuery({
    queryKey: [
      'swapped',
      'defaultCurrency',
      countryCode,
      { isKrwDefaultDisabled, isDkkDefaultDisabled },
    ] as const,
    queryFn: async () => {
      if (!apiKey) {
        return DEFAULT_FIAT_CURRENCY
      }

      const response = await getSwappedSupportedCountries({ apiKey, logger })
      const country = response.supported_countries.find(
        (c) => c.iso === countryCode,
      )
      const currency = country?.currency ?? DEFAULT_FIAT_CURRENCY

      // Korean regulator treats Won on/off-ramping as grounds for regulation,
      // so gated customers never get KRW as the auto-selected default.
      if (isKrwDefaultDisabled && currency === 'KRW') {
        logger.info('KRW default fiat disabled by gate; defaulting to USD', {
          countryCode,
        })
        return DEFAULT_FIAT_CURRENCY
      }

      // Compliance request via Polymarket: gated customers never get DKK as
      // the auto-selected default for Danish users.
      if (isDkkDefaultDisabled && currency === 'DKK') {
        logger.info('DKK default fiat disabled by gate; defaulting to USD', {
          countryCode,
        })
        return DEFAULT_FIAT_CURRENCY
      }

      return currency
    },
    enabled: enabled && !!apiKey && !!countryCode,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}
