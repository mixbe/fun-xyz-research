import type { BaseApiRequest } from '../../consts'
import { API_BASE_URL } from '../../consts'
import { sendPostRequest } from '../../utils'
import type { GetFopsParams, GetFopsResponse } from './types'

/**
 * Fetches available forms of payment from the API.
 *
 * @param params - Request parameters including recipient address, user ID, destination token, etc.
 * @param options - Base API request options including API key
 * @returns Promise resolving to available forms of payment
 */
export async function getFops({
  params,
  ...options
}: BaseApiRequest & {
  params: GetFopsParams
}): Promise<GetFopsResponse> {
  return sendPostRequest({
    uri: `${API_BASE_URL}/fops`,
    body: params,
    retryOptions: { maxAttempts: 2 },
    ...options,
  })
}
