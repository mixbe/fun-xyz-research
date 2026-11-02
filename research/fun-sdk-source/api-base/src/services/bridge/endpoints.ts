import { FROG_API_BASE_URL } from '../../consts'
import { sendGetRequest, sendPostRequest } from '../../utils'
import type {
  CreateBridgeBankAccountRequest,
  CreateBridgeBankAccountResponse,
  CreateFrogAndBridgeAccountRequest,
  CreateFrogAndBridgeAccountResponse,
  FindBridgeKycLinkRequest,
  FindBridgeKycLinkResponse,
  GetBridgeBankAccountRequest,
  GetBridgeBankAccountResponse,
  GetBridgeCustomerRequest,
  GetBridgeCustomerResponse,
  GetOrCreateFrogAccountRequest,
  GetOrCreateFrogAccountResponse,
} from './types'

export async function getFrogAccount({
  subAccountId,
  subAccountType,
  ...options
}: GetOrCreateFrogAccountRequest): Promise<GetOrCreateFrogAccountResponse> {
  const search = new URLSearchParams({
    subAccountId,
    subAccountType,
  })
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/account?${search}`,
    ...options,
  })
}

export async function createFrogAccount({
  subAccountId,
  subAccountType,
  ...options
}: GetOrCreateFrogAccountRequest): Promise<GetOrCreateFrogAccountResponse> {
  return sendPostRequest({
    uri: `${FROG_API_BASE_URL}/api/account`,
    body: {
      subAccountId,
      subAccountType,
    },
    ...options,
  })
}

export async function getBridgeCustomer({
  guid,
  ...options
}: GetBridgeCustomerRequest): Promise<GetBridgeCustomerResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/bridge?guid=${guid}`,
    ...options,
  })
}

export async function createBridgeCustomer({
  guid,
  name,
  email,
  endorsement,
  ...options
}: CreateFrogAndBridgeAccountRequest): Promise<CreateFrogAndBridgeAccountResponse> {
  return sendPostRequest({
    uri: `${FROG_API_BASE_URL}/api/bridge`,
    body: {
      guid,
      name,
      email,
      endorsement,
    },
    ...options,
  })
}

export async function getBridgeBankAccounts({
  subAccountId,
  ...options
}: GetBridgeBankAccountRequest): Promise<GetBridgeBankAccountResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/bridge/bank?subAccountId=${subAccountId}`,
    ...options,
  })
}

export async function createBridgeBankAccount({
  tokenName,
  chainName,
  destinationAddress,
  subAccountId,
  sourceCurrency,
  ...options
}: CreateBridgeBankAccountRequest): Promise<CreateBridgeBankAccountResponse> {
  return sendPostRequest({
    uri: `${FROG_API_BASE_URL}/api/bridge/bank`,
    body: {
      subAccountId,
      tokenName,
      chainName,
      destinationAddress,
      sourceCurrency,
    },
    ...options,
  })
}

export function getBridgeKycLink({
  guid,
  ...options
}: FindBridgeKycLinkRequest): Promise<FindBridgeKycLinkResponse> {
  return sendGetRequest({
    uri: `${FROG_API_BASE_URL}/api/bridge/kyclink?guid=${guid}`,
    ...options,
  })
}
