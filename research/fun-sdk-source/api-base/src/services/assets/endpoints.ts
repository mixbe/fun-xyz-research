import { API_BASE_URL } from '../../consts'
import { sendGetRequest } from '../../utils'
import type {
  Erc20AssetInfo,
  GetAllWalletTokensByChainIdRequest,
  GetAllWalletTokensByChainIdResponse,
  GetAllWalletTokensRequest,
  GetAllWalletTokensResponse,
  GetAllowedAssetsRequest,
  GetAllowedAssetsResponse,
  GetAssetErc20ByChainAndSymbolRequest,
  GetAssetPriceInfoRequest,
  GetAssetPriceInfoResponse,
  GetSupportedAssetsRequest,
  GetSupportedAssetsResponse,
  GetWalletLidoWithdrawalsByChainId,
  GetWalletLidoWithdrawalsByChainIdResponse,
} from './types'

/**
 * Gets the estimated dollar unit price of a tokenAddress for checkout
 * @param chainId https://chainlist.org/ e.g. "1" for ethereum
 * @param assetTokenAddress tokenAddress of the asset on the given chain
 * @param apiKey
 * @returns only `unitPrice` is relevant, since amount is not customizable (1 by default)
 */
export async function getAssetPriceInfo({
  chainId,
  assetTokenAddress,
  ...options
}: GetAssetPriceInfoRequest): Promise<GetAssetPriceInfoResponse> {
  const priceInfo: GetAssetPriceInfoResponse = await sendGetRequest({
    uri: `${API_BASE_URL}/asset/erc20/price/${chainId}/${assetTokenAddress}`,
    retryOptions: { maxAttempts: 2 },
    ...options,
  })
  return priceInfo
}

/**
 * Gets the ERC20 asset info by chain and symbol
 * @param chainId https://chainlist.org/ e.g. "1" for ethereum
 * @param symbol symbol of the asset
 * @param apiKey
 */
export async function getAssetErc20ByChainAndSymbol({
  chainId,
  symbol,
  ...options
}: GetAssetErc20ByChainAndSymbolRequest): Promise<Erc20AssetInfo> {
  return await sendGetRequest({
    uri: `${API_BASE_URL}/asset/erc20/${chainId}/${symbol}`,
    retryOptions: { maxAttempts: 2 },
    ...options,
  })
}

/**
 * Get all tokens for a given wallet address
 * @param walletAddress
 * @param onlyVerifiedTokens If true, only return alchemy tokens that are verified(filters spam)
 * @param apiKey
 * @param signal AbortSignal to cancel the request when no longer needed
 */
export async function getAllWalletTokens({
  walletAddress,
  onlyVerifiedTokens,
  ...options
}: GetAllWalletTokensRequest): Promise<GetAllWalletTokensResponse> {
  return await sendGetRequest({
    uri: `${API_BASE_URL}/assets/erc20s/${walletAddress}?onlyVerifiedTokens=${onlyVerifiedTokens}`,
    retryOptions: { maxAttempts: 2 },
    ...options,
  })
}

/**
 * Get all tokens for a given wallet address on a specific chain
 * @param chainId https://chainlist.org/
 * @param walletAddress
 * @param onlyVerifiedTokens If true, only return alchemy tokens that are verified(filters spam)
 * @param apiKey
 */
export async function getAllWalletTokensByChainId({
  chainId,
  walletAddress,
  onlyVerifiedTokens,
  ...options
}: GetAllWalletTokensByChainIdRequest): Promise<GetAllWalletTokensByChainIdResponse> {
  return await sendGetRequest({
    uri: `${API_BASE_URL}/assets/erc20s/${walletAddress}/${chainId}?onlyVerifiedTokens=${onlyVerifiedTokens}`,

    retryOptions: { maxAttempts: 2 },
    ...options,
  })
}

/**
 * Get list of assets that are allowed to be used for checkout
 * @param apiKey
 */
export async function getAllowedAssets(
  options: GetAllowedAssetsRequest,
): Promise<GetAllowedAssetsResponse> {
  return await sendGetRequest({
    uri: `${API_BASE_URL}/assets/allow`,
    retryOptions: { maxAttempts: 2 },
    ...options,
  })
}

/**
 * Get the supported source assets and their minimums for UDA
 * @param apiKey
 */
export async function getSupportedAssets(
  options: GetSupportedAssetsRequest,
): Promise<GetSupportedAssetsResponse> {
  return await sendGetRequest({
    uri: `${API_BASE_URL}/assets/supported`,
    retryOptions: { maxAttempts: 2 },
    ...options,
  })
}

/**=======================
 * POTENTIAL DEPRECATION
 *=======================*/

/**
 * Get all lido withdrawal request ids for a wallet address on a specific chain
 * @param {string} chainId https://chainlist.org/ ie "1" for ethereum
 * @param {string} holderAddr Address of holder
 * @returns [readyToWithdrawRequestIds, notReadyToWithdrawRequestIds]
 */
export async function getWalletLidoWithdrawalsByChainId({
  chainId,
  walletAddress,
  ...options
}: GetWalletLidoWithdrawalsByChainId): Promise<GetWalletLidoWithdrawalsByChainIdResponse> {
  return await sendGetRequest({
    uri: `${API_BASE_URL}/assets/lido-withdrawals/${walletAddress}/${chainId}`,
    ...options,
  })
}
