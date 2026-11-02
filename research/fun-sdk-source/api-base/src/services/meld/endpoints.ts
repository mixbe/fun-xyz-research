import { type BaseApiRequest, FROG_API_BASE_URL } from '../../consts'
import { sendGetRequest, sendPostRequest } from '../../utils'
import type {
  GetCryptoPurchaseLimitsParams,
  MeldCreateCryptoQuoteParams,
  MeldCreateCryptoQuoteResponse,
  MeldCreateCryptoWidgetParams,
  MeldCreateCryptoWidgetResponse,
  MeldDefaultFiatResponse,
  MeldFiatLimitResponse,
  MeldSupportedFiatResponse,
  SearchDefaultFiatParams,
} from './types'

export async function getMeldSupportedFiat({
  ...options
}: BaseApiRequest): Promise<MeldSupportedFiatResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/meld/fiat`,
    ...options,
    retryOptions: { maxAttempts: 2 },
  })
}

export async function getMeldQuotes({
  params,
  ...options
}: BaseApiRequest & {
  params: MeldCreateCryptoQuoteParams
}): Promise<MeldCreateCryptoQuoteResponse> {
  return sendPostRequest({
    uri: `${FROG_API_BASE_URL}/api/meld/quote`,
    body: params,
    retryOptions: { maxAttempts: 2 },
    ...options,
  })
}

export async function startMeldSession({
  params,
  ...options
}: BaseApiRequest & {
  params: MeldCreateCryptoWidgetParams['sessionData']
}): Promise<MeldCreateCryptoWidgetResponse> {
  return sendPostRequest({
    uri: `${FROG_API_BASE_URL}/api/meld/session`,
    body: {
      sessionData: params,
      sessionType: 'BUY',
    },
    retryOptions: { maxAttempts: 2 },
    ...options,
  })
}

export async function getMeldDefaultFiat({
  params,
  ...options
}: BaseApiRequest & {
  params: SearchDefaultFiatParams
}): Promise<MeldDefaultFiatResponse> {
  const countries = params.countries?.join(',') ?? ''
  const categories = params.categories?.join(',') ?? ''
  const urlParams = new URLSearchParams({
    ...(countries ? { countries } : {}),
    ...(categories ? { categories } : {}),
  })

  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/meld/defaultFiat?${urlParams}`,
    ...options,
    retryOptions: { maxAttempts: 2 },
  })
}

export async function getMeldFiatLimits({
  params,
  ...options
}: BaseApiRequest & {
  params: GetCryptoPurchaseLimitsParams
}): Promise<MeldFiatLimitResponse> {
  const countries = params.countries.join(',')
  const cryptoCurrencies = params.cryptoCurrencies.join(',')
  const fiatCurrencies = params.fiatCurrencies.join(',')
  const categories = params.categories?.join(',') ?? ''
  const urlParams = new URLSearchParams({
    countries,
    cryptoCurrencies,
    fiatCurrencies,
    ...(categories ? { categories } : {}),
  })

  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/meld/fiatLimit?${urlParams}`,
    ...options,
    retryOptions: { maxAttempts: 2 },
  })
}
