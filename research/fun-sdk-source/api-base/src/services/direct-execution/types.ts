import type { ApiCheckoutClientMetadata } from '@funkit/utils'
import type { Address, Hex } from 'viem'
import type { BaseApiRequest } from '../../consts'
import type { FunAddress } from '../checkout/types'

export interface GetDirectExecutionByTxHashRequest extends BaseApiRequest {
  txHash: string
}

export interface GetDirectExecutionsByUserIdRequest extends BaseApiRequest {
  userId: string
  limit?: number
}

// Reference: https://github.com/fun-xyz/fun-backend/blob/main/packages/types/src/system/direct-execution.ts#L1
export enum DirectExecutionType {
  // For UT purposes only, should never show up in prod table
  TEST_EXECUTION = 'TEST_EXECUTION',
  // Relay execution bypass in SDK
  RELAY = 'RELAY',

  // OFT execution
  OFT = 'OFT',

  // Across CCTP bridge execution (for HyperCore USDH)
  ACROSS = 'ACROSS',

  // Lightning Network deposits processed via Flashnet orchestration webhooks
  FLASHNET = 'FLASHNET',

  // SDK-side execution where the funkit client signs and sends the tx
  // directly to a third-party contract (e.g. Aave Pool.supply via
  // @aave/client) and posts the resulting txHash for record-keeping.
  // No funkit-side routing or relay involvement.
  CONTRACT_CALL = 'CONTRACT_CALL',

  /**
   * Tracking-only DE for flows where execution and settlement happen
   * entirely outside Fun (no Fun/Relay routing). Backend persists the
   * row but does not poll, decode events, or update status. Per-row
   * settlement status, if ever needed, is recovered via offline join
   * against chain_events.
   */
  EXTERNALLY_FULFILLED = 'EXTERNALLY_FULFILLED',
}

// Reference: https://github.com/reservoirprotocol/relay-kit/blob/211c645f9702a3b459ff545aa4e2e9d536c38455/packages/sdk/src/types/Execute.ts#L54-L61
export enum RelayExecutionStatus {
  DELAYED = 'delayed',
  FAILURE = 'failure',
  PENDING = 'pending',
  REFUND = 'refund',
  SUCCESS = 'success',
  WAITING = 'waiting',
  UNKNOWN = 'unknown',
}

export interface RelayExecutionRequestFeeData {
  fees: Fee
  feesUsd: Fee
  metadata: RelayExecutionRequestMetadata
  appFees?: RelayExecutionRequestFeeDataAppFees[]
}

export interface RelayExecutionRequestFeeDataAppFees {
  recipient?: Address
  amount?: string
  amountUsd?: string
}

export interface RelayExecutionRequestMetadata {
  currencyIn: RelayExecutionRequestMetadataCurrency
  currencyOut: RelayExecutionRequestMetadataCurrency
  rate: string
  recipient: Address
  sender: Address
}

export interface RelayExecutionRequestMetadataCurrency {
  amount: string
  amountFormatted: string
  amountUsd: string
  amountUsdCurrent: string
  currency: {
    address: Address
    chainId: number
    decimals: number
    metadata: {
      logoURI: string
      verified: boolean
    }
    name: string
    symbol: string
  }
  minimumAmount: string
}

export interface Fee {
  gas: bigint
  fixed: bigint
  price: bigint
}

// Reference: https://github.com/fun-xyz/fun-backend/blob/main/packages/types/src/system/tables/DirectExecution.ts#L7
export interface DirectExecution {
  txHash: Hex // For account abstraction transactions, this will be a userOpHash.
  onChainTxHash?: Hex // For account abstraction transactions, this will be a normal txHash/bundle tx hash.
  customerId: string
  /** SDK checkout attempt id, distinct from the DE transaction hash. */
  checkoutId?: string
  userId: string
  recipientAddr: FunAddress
  type: DirectExecutionType

  fromChainId: string
  fromTokenAddress: Address
  toChainId: string
  toTokenAddress: Address

  fromAmountBaseUnit: string
  toAmountBaseUnit: string
  estTotalUsd: number

  clientMetadata: ApiCheckoutClientMetadata
  isIntermediaryPhase?: boolean
  sourceOfFund: string
  toTxId?: string
  triggeringTxHash?: string
  /** flag to indicate if the DE is a synthetic ephemeral DE created from a chain event detection, replaced by the real DE once it's confirmed.*/
  isDepositDetectionDE?: boolean

  createdTimeMs: number
  updatedTimeMs?: number
  lastKnownDepositTimeMs?: number

  listenerInfo?: {
    destinationChainId: number
    inTxHashes: string[]
    originChainId: number
    status: RelayExecutionStatus
    time: number
    txHashes: string[]

    relayExecutionRequestDetails?: {
      id: Hex
      status: RelayExecutionStatus
      createdAt: Date
      updatedAt: Date
      data: RelayExecutionRequestFeeData
    }

    layerzeroExecutionStatusResponse?: {
      data: {
        pathway: LayerzeroPathway
        source: LayerzeroExecutionSource
        destination: LayerzeroExecutionDestination
        verification: unknown
        guid: string
        config: unknown
        status: LayerzeroOverallStatus
        created: string
        updated: string
      }[]
    }

    lighterExecutionStatusResponse?: LighterExecutionStatusResponse
  }
}

export interface LighterExecutionStatusResponse {
  code: number
  hash: string
  type: number
  info: string
  event_info: string
  status: number
  transaction_index: number
  l1_address: string
  account_index: number
  nonce: number
  expire_at: bigint
  block_height: number
  queued_at: number
  sequence_index: number
  parent_hash: string
  api_key_index: number
  committed_at: number
  verified_at: number
  executed_at: number
}

export interface LayerzeroPathway {
  srcEid: number
  dstEid: number
  sender: LayerzeroEndpointParty
  receiver: LayerzeroEndpointParty
  id: string
  nonce: number
}

export interface LayerzeroEndpointParty {
  address: string
  id: string
  name: string
  chain: string
}

export interface LayerzeroExecutionSource {
  status: string
  tx: {
    txHash: string
    blockHash: string
    blockNumber: string
    blockTimestamp: bigint
    from: string
    payload: string
    readinessTimestamp: bigint
  }
}

export interface LayerzeroExecutionDestination {
  status: string
  tx: {
    txHash: string
    blockHash: string
    blockNumber: string
    blockTimestamp: bigint
  }
  lzCompose: {
    txs: {
      txHash: string
      blockHash: string
      blockNumber: string
      blockTimestamp: bigint
    }[]
    status: string
  }
}
export interface LayerzeroOverallStatus {
  name: string
  message: string
}

export interface PostDirectExecutionRequest
  extends
    BaseApiRequest,
    Omit<DirectExecution, 'customerId' | 'createdTimeMs'> {}
