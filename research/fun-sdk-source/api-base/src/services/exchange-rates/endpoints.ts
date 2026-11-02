import { type BaseApiRequest, FROG_API_BASE_URL } from '../../consts'
import { sendGetRequest } from '../../utils'
import type { ExchangeRates } from './types'

/**
 * Get the exchange rates for all fiat currencies
 * @returns The exchange rates for all fiat currencies
 */
export async function getFiatExchangeRates({
  ...options
}: Omit<BaseApiRequest, 'apiKey'>): Promise<ExchangeRates> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/exchange-rates`,
    apiKey: '', // Just a hack to make typescript happy as we don't require an API Key for this endpoint
    ...options,
    retryOptions: { maxAttempts: 2 },
  })
}
