import { getAssetErc20ByChainAndSymbol } from '@funkit/api-base'
import { ErrorCode, ResourceNotFoundError } from '@funkit/utils'
import { BASE_WRAP_TOKEN_ADDR } from '../common'
import type { EnvOption } from '../config'

// TODO: Move to funkit/utils & add tests
export async function getTokenAddressBySymbolAndChainId(
  inputSymbol,
  inputChainId,
  options?: EnvOption,
) {
  const normalizedSymbol = inputSymbol.toLowerCase()
  // Return wrapped native token if matches any
  if (BASE_WRAP_TOKEN_ADDR?.[inputChainId]?.[normalizedSymbol]) {
    return BASE_WRAP_TOKEN_ADDR[inputChainId][normalizedSymbol]
  }

  const tokenInfo = await getAssetErc20ByChainAndSymbol({
    chainId: inputChainId,
    symbol: normalizedSymbol,
    apiKey: globalThis.globalEnvOption.apiKey,
    logger: options?.logger,
    signal: options?.signal,
  })

  if (tokenInfo.address) {
    return tokenInfo.address
  }

  throw new ResourceNotFoundError(
    ErrorCode.TokenNotFound,
    'token symbol does not exist on provided chain',
    'token symbol does not exist on provided chain',
    { symbol: inputSymbol, chainId: inputChainId },
    'Provide correct symbol and chainId.',
    'https://docs.fun.xyz',
  )
}
