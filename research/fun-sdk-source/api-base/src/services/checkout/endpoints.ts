import type { Address } from 'viem'

import {
  type CheckoutQuoteResponse,
  ClientError,
  ErrorCode,
  ResourceNotFoundError,
} from '@funkit/utils'
import { API_BASE_URL, type BaseApiRequest } from '../../consts'
import {
  RelayQuoteError,
  generateRandomCheckoutSalt,
  sendGetRequest,
  sendPostRequest,
} from '../../utils'
import {
  type CheckoutApiInitParams,
  type CheckoutDeactivateParams,
  type CheckoutHistoryItem,
  type CheckoutInitParams,
  type CheckoutInitResponse,
  type CheckoutInitTokenTransferAddressParams,
  type CheckoutInitTokenTransferResponse,
  type CheckoutQuoteRequestV2,
  type CheckoutQuoteResponseV2,
  CheckoutState,
  type LightningQuoteRequest,
  type LightningQuoteResponse,
  type RiskAssessmentParams,
  type RiskAssessmentResponse,
  type RoutedQuoteResponse,
} from './types'

type CheckoutQuoteV2Params = BaseApiRequest & CheckoutQuoteRequestV2

/**
 * The single `/checkout/quoteV2` call. Every quote helper below is a typed
 * abstraction over this one request — rail-specific wrappers pick the response
 * type and the error message, never their own body or route.
 *
 * `routing` is sent only when opting in, so a client that wants the legacy
 * quote says nothing about a field the backend does not serve yet.
 */
async function requestCheckoutQuoteV2<TResponse>({
  actionParams,
  bridgeOverride,
  fromAmountBaseUnit,
  fromChainId,
  fromTokenAddress,
  recipientAddress,
  toAmountBaseUnit,
  toChainId,
  toTokenAddress,
  userAddress,
  usePermit,
  routing,
  ...options
}: CheckoutQuoteV2Params): Promise<TResponse> {
  return await sendPostRequest<TResponse>({
    uri: `${API_BASE_URL}/checkout/quoteV2`,
    body: {
      actionParams,
      bridgeOverride,
      fromAmountBaseUnit,
      fromChainId,
      fromTokenAddress,
      recipientAddress,
      toAmountBaseUnit,
      toChainId,
      toTokenAddress,
      userAddress,
      ...(usePermit !== undefined ? { usePermit } : {}),
      ...(routing ? { routing } : {}),
    },
    ...options,
  })
}

/**
 * Gets a checkout quote (estimation). Opting in with `routing: true` returns
 * the provider-aware {@link RoutedQuoteResponse}; otherwise the legacy Relay-shaped quote.
 */
export async function getCheckoutQuoteV2(
  params: CheckoutQuoteV2Params & { routing: true },
): Promise<RoutedQuoteResponse>
export async function getCheckoutQuoteV2(
  params: CheckoutQuoteV2Params & { routing?: false },
): Promise<CheckoutQuoteResponse>
export async function getCheckoutQuoteV2(
  params: CheckoutQuoteV2Params,
): Promise<CheckoutQuoteResponse | RoutedQuoteResponse>
export async function getCheckoutQuoteV2(
  params: CheckoutQuoteV2Params,
): Promise<CheckoutQuoteResponse | RoutedQuoteResponse> {
  try {
    return await requestCheckoutQuoteV2<
      CheckoutQuoteResponseV2 | RoutedQuoteResponse
    >(params)
  } catch (err: unknown) {
    if (err instanceof RelayQuoteError || err instanceof ClientError) {
      throw err
    }
    throw new Error(
      `An error occurred trying to generate a checkout quote: ${
        err instanceof Error ? err.message : JSON.stringify(err)
      }`,
    )
  }
}

/**
 * Gets a Lightning Network checkout quote. The backend dispatches to the
 * Flashnet rail off `fromChainId === LIGHTNING_MAINNET_CHAIN_ID`, so this only
 * renames the sats amount and pins the response shape.
 *
 * Forces `routing` off until the backend reads the flag — after the spread, so a
 * caller cannot opt this rail into a routed response it is not typed for. The
 * rail is chosen by `fromChainId`, so this costs nothing today.
 */
export async function getLightningQuote({
  fromAmountSats,
  ...params
}: BaseApiRequest & LightningQuoteRequest): Promise<LightningQuoteResponse> {
  try {
    return await requestCheckoutQuoteV2<LightningQuoteResponse>({
      ...params,
      fromAmountBaseUnit: fromAmountSats,
      routing: false,
    })
  } catch (err: unknown) {
    throw new Error(
      `An error occurred trying to generate a Lightning quote: ${
        err instanceof Error ? err.message : JSON.stringify(err)
      }`,
    )
  }
}

/**
 * Initializes a checkout
 * @deprecated `POST /checkout` sunsets on 2026-12-21. Use `createDirectExecution`
 * (relay execution) or `initializeCheckoutTokenTransferAddress` (deposit address) instead.
 * @param userOp The checkout UserOp, signed.
 * @param quoteId The quoteId specific to the checkout.
 * @param apiKey A valid fun api key.
 * @return {Address} The generated deposit address
 */
export async function initializeCheckout({
  userOp,
  quoteId,
  sourceOfFund,
  clientMetadata,
  checkoutId,
  ...options
}: CheckoutInitParams): Promise<CheckoutInitResponse> {
  const body = {
    ...(userOp ? { userOp } : {}),
    quoteId,
    sourceOfFund,
    salt: generateRandomCheckoutSalt(),
    clientMetadata,
    checkoutId,
  } as CheckoutApiInitParams
  const res: { depositAddr?: Address } = await sendPostRequest({
    uri: `${API_BASE_URL}/checkout`,
    body,
    ...options,
  })
  if (!res?.depositAddr) {
    throw new ResourceNotFoundError(
      ErrorCode.CheckoutInitDepositAddrNotFound,
      'Unable to initialize checkout',
      'Unable to initialize checkout',
      body,
      '',
      'https://docs.fun.xyz',
    )
  }
  return { depositAddr: res.depositAddr }
}

export async function deactivateCheckout({
  depositAddress,
  ...options
}: CheckoutDeactivateParams) {
  try {
    await sendPostRequest({
      uri: `${API_BASE_URL}/checkout/update/${depositAddress}`,
      body: {
        // Fixed state to cancel the checkout
        state: CheckoutState.CANCELLED,
      },
      ...options,
    })
    return true
  } catch (_err) {
    throw new Error('Unable to deactivate checkout')
  }
}

/**
 * Gets a checkout given a depositAddress
 * @param depositAddress A unique deposit address associated with a backend checkout item.
 * @param apiKey A valid fun api key.
 * @param signal AbortSignal to cancel the request when no longer needed
 * @returns The checkout object if exists. Otherwise, null.
 */
export async function getCheckoutByDepositAddress({
  depositAddress,
  ...options
}: BaseApiRequest & {
  depositAddress: Address
}): Promise<CheckoutHistoryItem | null> {
  try {
    return await sendGetRequest({
      uri: `${API_BASE_URL}/checkout/${depositAddress}`,
      ...options,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return null
    }
    throw err
  }
}

/**
 * Gets all checkouts associated with a recipient address
 * @param recipientAddress A wallet address.
 * @param apiKey A valid fun api key.
 * @param signal AbortSignal to cancel the request when no longer needed
 * @returns A list of checkout objects if exists. Otherwise, an empty array.
 */
export async function getCheckoutsByRecipientAddress({
  recipientAddress,
  ...options
}: BaseApiRequest & { recipientAddress: Address }): Promise<
  CheckoutHistoryItem[]
> {
  const res = await sendGetRequest<CheckoutHistoryItem[] | null>({
    uri: `${API_BASE_URL}/checkout/recipient/${recipientAddress}`,
    ...options,
  })
  return res || []
}

export interface GetCheckoutsByUserIdParams extends BaseApiRequest {
  userId: string
  limit?: number
}

/**
 * Gets all checkouts associated with a funkit userId string
 * @param userId A userId string.
 * @param apiKey A valid fun api key.
 * @param signal AbortSignal to cancel the request when no longer needed
 * @returns A list of checkout objects if exists. Otherwise, an empty array.
 */
export async function getCheckoutsByUserId({
  userId,
  limit,
  ...options
}: GetCheckoutsByUserIdParams): Promise<CheckoutHistoryItem[]> {
  const encodedUserId = encodeURIComponent(userId) // external userId includes "|" character
  const query = limit
    ? new URLSearchParams({
        limit: limit.toString(),
      })
    : ''
  const res = await sendGetRequest<CheckoutHistoryItem[] | null>({
    uri: `${API_BASE_URL}/checkout/userId/${encodedUserId}?${query}`,
    ...options,
  })
  return res || []
}

export async function getRiskAssessmentForAddress({
  address,
  chainId,
  ...options
}: RiskAssessmentParams) {
  const query = new URLSearchParams({
    address,
    ...(chainId ? { chainId } : {}),
  })
  const response = (await sendGetRequest({
    uri: `${API_BASE_URL}/checkout/risk-assessment?${query}`,
    ...options,
    // Protect us against chainalysis ratelimiting
    retryOptions: { maxAttempts: 2 },
  })) as RiskAssessmentResponse

  return response
}

export async function initializeCheckoutTokenTransferAddress({
  apiKey,
  logger,
  signal,
  ...body
}: CheckoutInitTokenTransferAddressParams): Promise<CheckoutInitTokenTransferResponse> {
  const res = await sendPostRequest<CheckoutInitTokenTransferResponse | null>({
    uri: `${API_BASE_URL}/eoa`,
    body,
    apiKey,
    logger,
    signal,
  })
  if (!res?.depositAddr) {
    throw new ResourceNotFoundError(
      ErrorCode.CheckoutInitDepositAddrNotFound,
      'Unable to initialize checkout token transfer address',
      'Unable to initialize checkout token transfer address',
      body,
      '',
      'https://docs.fun.xyz',
    )
  }
  return {
    depositAddr: res.depositAddr,
    solanaAddr: res.solanaAddr,
    btcAddrSegwit: res.btcAddrSegwit,
    btcAddrTaproot: res.btcAddrTaproot,
    btcDepositAddr: res.btcDepositAddr,
    tronAddr: res.tronAddr,
    blocked: res.blocked,
  }
}
