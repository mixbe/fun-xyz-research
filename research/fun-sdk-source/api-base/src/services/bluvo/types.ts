import type { BluvoClient, TypeEnum2 } from '@bluvo/sdk-ts'

export interface BluvoBalanceSchema {
  id: string
}

export interface BluvoExchangesSchema {
  status: 'live' | 'offline' | 'maintenance' | 'coming_soon'
}

export interface BluvoQuoteSchema {
  id: string
  params: {
    asset: string
    amount: string
    address: string
    tag?: string | undefined
    network?: string | undefined
    includeFee?: boolean | undefined
  }
}

export interface BluvoWalletIdSchema {
  id: string
}

export interface BluvoWithdrawalSchema {
  id: string
  idempotencyKey: string
  quoteId: string
  params?:
    | {
        twofa?: string | null
        emailCode?: string | null
        smsCode?: string | null
        bizNo?: string | null
        tag?: string | null
        params?: { dryRun?: boolean; [key: string]: unknown } | null
      }
    | undefined
}

import type { BaseApiRequest } from '../../consts'

export interface BluvoGetWithdrawableBalanceByIdRequest
  extends BaseApiRequest, BluvoBalanceSchema {}
export type BluvoGetWithdrawableBalanceByIdResponse = Awaited<
  ReturnType<BluvoClient['wallet']['withdrawals']['getWithdrawableBalance']>
>

export interface BluvoListExchangesRequest
  extends BaseApiRequest, BluvoExchangesSchema {}
export type BluvoListExchangesResponse = Awaited<
  ReturnType<BluvoClient['oauth2']['listExchanges']>
>

export interface BluvoGetWalletByIdRequest
  extends BaseApiRequest, BluvoWalletIdSchema {}
export type BluvoGetWalletByIdResponse = Awaited<
  ReturnType<BluvoClient['wallet']['get']>
>

export interface BluvoRequestQuotationRequest
  extends BaseApiRequest, BluvoQuoteSchema {}
export type BluvoRequestQuotationResponse = Awaited<
  ReturnType<BluvoClient['wallet']['withdrawals']['requestQuotation']>
>

export interface BluvoExecuteWithdrawalRequest
  extends BaseApiRequest, BluvoWithdrawalSchema {}
export type BluvoExecuteWithdrawalResponse = Awaited<
  ReturnType<BluvoClient['wallet']['withdrawals']['executeWithdrawal']>
>

export class BluvoWithdrawalError extends Error {
  public readonly errorCode?: TypeEnum2

  constructor(message?: string, errorCode?: TypeEnum2) {
    super(message || 'An error occurred during withdrawal. Please try again.')
    this.name = 'BluvoWithdrawalError'
    this.errorCode = errorCode
  }
}
