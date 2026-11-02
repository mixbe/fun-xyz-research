import {
  type GetAssetPriceInfoResponse,
  getAssetPriceInfo,
} from '@funkit/api-base'
import { getRelayAssetPriceInfo } from '@funkit/fun-relay'
import type { Address } from 'viem'

import type { FunLogger } from '~/utils/funLogger'

interface AssetPriceParams {
  apiKey: string
  chainId: string
  assetTokenAddress: Address
  logger: FunLogger
}

async function getFormattedRelayAssetPriceInfo({
  chainId,
  assetTokenAddress,
  logger,
}: Omit<AssetPriceParams, 'apiKey'>): Promise<GetAssetPriceInfoResponse> {
  try {
    // Relay converts the address into its own namespace itself.
    const relayResponse = await getRelayAssetPriceInfo({
      chainId,
      address: assetTokenAddress,
    })
    const unitPrice = relayResponse.price
    // Relay answers 200 with no price for a token it doesn't index. Throwing
    // keeps that "unknown", where returning it would render a confident $0.00.
    if (typeof unitPrice !== 'number' || !Number.isFinite(unitPrice)) {
      throw new Error(`Relay returned no price for ${assetTokenAddress}`)
    }
    return {
      unitPrice,
      amount: 1,
      total: unitPrice,
    }
  } catch (error) {
    logger.warn('Unable to fetch token price from Relay', {
      chainId,
      assetTokenAddress,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

/**
 * Unit price of a token: funkit's price API, falling back to Relay's.
 *
 * - Relay indexes venues funkit's price API doesn't (an L2 asset addressed by
 *   index, say), so the fallback is what prices those at all.
 * - Both failures log WARN: callers recover from an unpriced token rather than
 *   breaking, and ERROR is reserved for alertable unrecoverable states.
 */
export async function getAssetPriceInfoWithFallback({
  apiKey,
  chainId,
  assetTokenAddress,
  logger,
}: AssetPriceParams): Promise<GetAssetPriceInfoResponse> {
  try {
    return await getAssetPriceInfo({
      apiKey,
      assetTokenAddress,
      chainId,
      logger,
    })
  } catch (primaryError) {
    logger.warn(
      'Unable to fetch token price from Primary provider, trying fallback',
      {
        chainId,
        assetTokenAddress,
        // `warn` routes data through JSON, which renders an Error as `{}`.
        primaryError:
          primaryError instanceof Error
            ? primaryError.message
            : String(primaryError),
      },
    )
    return await getFormattedRelayAssetPriceInfo({
      chainId,
      assetTokenAddress,
      logger,
    })
  }
}
