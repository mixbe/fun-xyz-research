import { API_BASE_URL } from '../../consts'
import { sendGetRequest, sendPostRequest } from '../../utils'
import type {
  DirectExecution,
  GetDirectExecutionByTxHashRequest,
  GetDirectExecutionsByUserIdRequest,
  PostDirectExecutionRequest,
} from './types'

export async function getDirectExecutionByTxHash({
  txHash,
  apiKey,
  logger,
  signal,
}: GetDirectExecutionByTxHashRequest): Promise<DirectExecution> {
  return sendGetRequest<DirectExecution>({
    uri: `${API_BASE_URL}/direct-execution/${txHash}`,
    apiKey,
    logger,
    signal,
  })
}

export async function getDirectExecutionsByUserId({
  userId,
  apiKey,
  logger,
  limit,
  signal,
}: GetDirectExecutionsByUserIdRequest): Promise<DirectExecution[]> {
  const encodedUserId = encodeURIComponent(userId) // external userId includes "|" character
  const query = limit
    ? new URLSearchParams({
        limit: limit.toString(),
      })
    : ''
  return sendGetRequest<DirectExecution[]>({
    uri: `${API_BASE_URL}/direct-execution/userId/${encodedUserId}/deposit-events?${query}`,
    apiKey,
    logger,
    signal,
  })
}

export async function createDirectExecution({
  txHash,
  userId,
  recipientAddr,
  fromChainId,
  fromTokenAddress,
  toChainId,
  toTokenAddress,
  fromAmountBaseUnit,
  toAmountBaseUnit,
  estTotalUsd,
  sourceOfFund,
  clientMetadata,
  checkoutId,
  apiKey,
  logger,
  signal,
  type,
  lastKnownDepositTimeMs,
}: PostDirectExecutionRequest): Promise<{ txHash: DirectExecution['txHash'] }> {
  const body = {
    txHash,
    sourceOfFund,
    userId,
    recipientAddr,
    fromChainId,
    fromTokenAddress,
    toChainId,
    toTokenAddress,
    fromAmountBaseUnit,
    toAmountBaseUnit,
    estTotalUsd,
    clientMetadata,
    checkoutId: checkoutId ?? clientMetadata.id,
    type,
    lastKnownDepositTimeMs,
  }

  return sendPostRequest<{ txHash: DirectExecution['txHash'] }>({
    uri: `${API_BASE_URL}/direct-execution`,
    body,
    apiKey,
    logger,
    signal,
  })
}
