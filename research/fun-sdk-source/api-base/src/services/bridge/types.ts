import type { Address } from 'viem'
import type { BaseApiRequest } from '../../consts'

declare const brand: unique symbol

export type BridgeCustomerId = string & { [brand]: 'BridgeCustomerId' }
export type Guid = string & { [brand]: 'Guid' }

type DateString = `${number}-${number}-${number}T${number}:${number}:${number}Z`

export enum BridgeCustomerStatus {
  ACTIVE = 'active',
  AWAITING_QUESTIONNAIRE = 'awaiting_questionnaire',
  /** Ultimate Beneficial Owner - only relevant for business customers https://apidocs.bridge.xyz/docs/business-ownership-documents */
  AWAITING_UBO = 'awaiting_ubo',
  INCOMPLETE = 'incomplete',
  NOT_STARTED = 'not_started',
  OFFBOARDED = 'offboarded',
  PAUSED = 'paused',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

// https://apidocs.bridge.xyz/docs/rejection-reasons
export interface RejectionReason {
  created_at: DateString
  developer_reason: string
  reason: string
}

export interface BridgeCustomer {
  id: BridgeCustomerId
  first_name: string
  last_name: string
  rejection_reasons: RejectionReason[]
  status: BridgeCustomerStatus
}

export enum BridgeKycStatus {
  APPROVED = 'approved',
  INCOMPLETE = 'incomplete',
  NOT_STARTED = 'not_started',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

export enum BridgeTosStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
}

export enum BridgeCustomerType {
  BUSINESS = 'business',
  INDIVIDUAL = 'individual',
}

export interface BridgeKYCLinks {
  id: string
  customer_id: BridgeCustomerId
  created_at: DateString
  email: string
  kyc_link: string
  kyc_status: BridgeKycStatus
  tos_link: string
  tos_status: BridgeTosStatus
  type: BridgeCustomerType
}

export interface SubAccountBase {
  id: number
  createdAt: DateString
  updatedAt: DateString
  guid: Guid
  subAccountType: string
  subAccountId: string
  isDeleted: boolean
}

export interface WalletSubAccount extends SubAccountBase {
  subAccountType: 'wallet'
  subAccountId: string
}

export interface BridgeSubAccount extends SubAccountBase {
  subAccountType: 'bridge'
  subAccountId: BridgeCustomerId
}

export type SubAccount = WalletSubAccount | BridgeSubAccount

export interface GetOrCreateFrogAccountRequest extends BaseApiRequest {
  subAccountType: 'wallet'
  subAccountId: string
}

export interface GetOrCreateFrogAccountResponse {
  accounts: SubAccount[]
}

export interface GetBridgeCustomerRequest extends BaseApiRequest {
  guid: Guid
}

export interface GetBridgeCustomerResponse {
  account: SubAccount
  bridgeCustomer: BridgeCustomer
}

export enum BridgeEndorsement {
  BASE = 'base',
  SEPA = 'sepa',
}

export type BridgeAccount = {
  guid: Guid
  name: string
  email: string
  endorsement: BridgeEndorsement
}
export type CreateFrogAndBridgeAccountRequest = BaseApiRequest & BridgeAccount

export type CreateFrogAndBridgeAccountResponse =
  | {
      newCreated: true
      /** kyc link info will be present only when create new customer */
      kycLinks: BridgeKYCLinks
    }
  | {
      newCreated: false
      kycLink: string
    }

export type BridgeVirtualAcountId = string & {
  [brand]: 'BridgeVirtualAcountId'
}

export interface BridgeDestination {
  address: `0x${string}`
  currency: 'usdc' | 'usdt' | 'usdb' | 'dai'
  payment_rail: 'ethereum' | 'arbitrum' | 'base' | 'polygon' | 'solana'
}

export enum BridgeVirtualBankAccountStatus {
  ACTIVATED = 'activated',
  DEACTIVATED = 'deactivated',
}

export interface BridgeVirtualBankAccount {
  id: BridgeVirtualAcountId
  destination: BridgeDestination
  developer_fee_percent: `${number}`
  source_deposit_instructions: {
    payment_rails: string[]
    currency: string
    bank_name: string
    bank_address: string
    bank_beneficiary_name?: string
    bank_beneficiary_address?: string
    // only us bank accounts have routing and account numbers
    bank_routing_number?: string
    bank_account_number?: string
    // https://wise.com/us/iban/ IBAN stands for International Bank Account Number.
    // It’s an internationally-agreed code made up of up to 34 letters and numbers
    // that helps banks to process transfers around the world.
    account_holder_name?: string
    iban?: string
    bic?: string
  }
  status: BridgeVirtualBankAccountStatus
}

export interface GetBridgeBankAccountRequest extends BaseApiRequest {
  subAccountId: BridgeCustomerId
}

export interface GetBridgeBankAccountResponse {
  bankAccounts: BridgeVirtualBankAccount[]
}

export const createBridgeBankAccountRequestChainNames = [
  'arbitrum',
  'base',
  'ethereum',
  'polygon',
  'solana',
] as const

export interface CreateBridgeBankAccountRequest extends BaseApiRequest {
  subAccountId: BridgeCustomerId
  sourceCurrency: 'usd' | 'eur'
  tokenName: 'usdb' | 'usdc' | 'usdt' | 'dai'
  chainName: (typeof createBridgeBankAccountRequestChainNames)[number]
  destinationAddress: Address
}

export interface CreateBridgeBankAccountResponse {
  bankAccount: BridgeVirtualBankAccount
}

export interface FindBridgeKycLinkRequest extends BaseApiRequest {
  guid: Guid
}

export interface FindBridgeKycLinkResponse {
  kycLink: string
}
