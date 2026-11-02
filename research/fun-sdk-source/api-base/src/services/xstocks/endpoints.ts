import { FROG_API_BASE_URL } from '../../consts'
import { sendGetRequest } from '../../utils'
import type { GetXstocksAssetRequest, XstocksAsset } from './types'

/** Get a single xStocks tokenized asset by symbol, via frog's CDN-cached proxy. */
export async function getXstocksAsset({
  symbol,
  network,
  ...options
}: GetXstocksAssetRequest): Promise<XstocksAsset> {
  try {
    const query = network ? `?network=${encodeURIComponent(network)}` : ''
    return await sendGetRequest({
      uri: `${FROG_API_BASE_URL}/xstocks/assets/${encodeURIComponent(
        symbol,
      )}${query}`,
      ...options,
      retryOptions: { maxAttempts: 2 },
    })
  } catch (err: unknown) {
    throw new Error(
      `An error occurred trying to fetch the xStocks asset: ${
        err instanceof Error ? err.message : JSON.stringify(err)
      }`,
    )
  }
}
