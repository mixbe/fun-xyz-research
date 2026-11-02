import { FROG_API_BASE_URL } from '../../consts'
import { sendGetRequest, sendPostRequest } from '../../utils'
import type {
  BluvoExecuteWithdrawalRequest,
  BluvoExecuteWithdrawalResponse,
  BluvoGetWalletByIdRequest,
  BluvoGetWalletByIdResponse,
  BluvoGetWithdrawableBalanceByIdRequest,
  BluvoGetWithdrawableBalanceByIdResponse,
  BluvoListExchangesRequest,
  BluvoListExchangesResponse,
  BluvoRequestQuotationRequest,
  BluvoRequestQuotationResponse,
} from './types'

export async function bluvoGetWithdrawableBalanceById({
  id,
  logger,
  apiKey,
}: BluvoGetWithdrawableBalanceByIdRequest): Promise<BluvoGetWithdrawableBalanceByIdResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/bluvo/balance?id=${id}`,
    logger,
    apiKey,
  })
}

export async function bluvoListExchanges({
  status,
  logger,
  apiKey,
}: BluvoListExchangesRequest): Promise<BluvoListExchangesResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/bluvo/exchanges?status=${status}`,
    logger,
    apiKey,
  })
}

export async function bluvoGetWalletById({
  id,
  logger,
  apiKey,
}: BluvoGetWalletByIdRequest): Promise<BluvoGetWalletByIdResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/bluvo/walletId?id=${id}`,
    logger,
    apiKey,
  })
}

export async function bluvoRequestQuotation({
  id,
  params,
  logger,
}: BluvoRequestQuotationRequest): Promise<BluvoRequestQuotationResponse> {
  return sendPostRequest({
    uri: `${FROG_API_BASE_URL}/api/bluvo/quote`,
    body: { id, params },
    logger,
    apiKey: '',
  })
}

export async function bluvoExecuteWithdrawal({
  id,
  idempotencyKey,
  quoteId,
  params,
  logger,
}: BluvoExecuteWithdrawalRequest): Promise<BluvoExecuteWithdrawalResponse> {
  return sendPostRequest({
    uri: `${FROG_API_BASE_URL}/api/bluvo/withdrawal`,
    body: { id, idempotencyKey, quoteId, params },
    logger,
    apiKey: '',
  })
}
