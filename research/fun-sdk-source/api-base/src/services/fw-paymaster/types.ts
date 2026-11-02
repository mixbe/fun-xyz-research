import type { BaseApiRequest } from '../../consts'
import type { ExecutionReceipt } from '../fw-operation'

export interface PaymasterTransaction {
  action: string
  amount: number
  from: string
  to: string
  token: string
  txid?: string
}

export interface AddPaymasterTransactionRequest extends BaseApiRequest {
  chainId: string
  timestamp: number
  txid: ExecutionReceipt['txId'] | string
  transaction: PaymasterTransaction
  paymasterType: PaymasterType
  sponsorAddress: string
}

export enum PaymasterType {
  BaseSponsor = 'base',
  GaslessSponsor = 'gasless',
  TokenSponsor = 'token',
  CheckoutSponsor = 'checkout',
}
