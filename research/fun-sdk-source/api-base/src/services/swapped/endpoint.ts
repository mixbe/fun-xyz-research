import { type BaseApiRequest, FROG_API_BASE_URL } from '../../consts'
import { sendGetRequest } from '../../utils'
import type { SwappedSupportedCountriesResponse } from './types'

export async function getSwappedSupportedCountries({
  ...options
}: BaseApiRequest): Promise<SwappedSupportedCountriesResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/swapped/supportedCountries`,
    ...options,
    retryOptions: { maxAttempts: 2 },
  })
}
