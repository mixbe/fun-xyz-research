import { type BaseApiRequest, FROG_API_BASE_URL } from '../../consts'
import { sendGetRequest } from '../../utils'
import type { FunGeoIpAddressResponse } from './types'

/**
 * Get the caller's own IP and the location it resolves to.
 *
 * The geo comes from the IP that reaches frog, so this only resolves the end
 * user when called from their device — proxying it on their behalf reports the
 * proxy's location instead. `apiKey` only tags frog's request log with the
 * customer; the endpoint is not gated on it.
 *
 * @returns IP, country, region, and city — location fields empty when unresolved
 */
export async function getFunGeoIpAddress({
  ...options
}: BaseApiRequest): Promise<FunGeoIpAddressResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/geo/ip-address`,
    ...options,
  })
}
