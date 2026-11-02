import type { Address, Hex } from 'viem'

import type {
  ApiCheckoutClientMetadata,
  ApiFunkitCheckoutActionParams,
  CheckoutQuoteResponse,
} from '@funkit/utils'
import type { BaseApiRequest } from '../../consts'
import type { UserOperation } from '../fw-operation'

export type BridgeOverride = 'across' | 'relay'

export type CheckoutQuoteRequestV2 = {
  actionParams?: ApiFunkitCheckoutActionParams[]
  bridgeOverride?: BridgeOverride
  fromChainId: string
  fromTokenAddress: Address | SolanaAddress
  recipientAddress?: FunAddress
  toChainId: string
  toTokenAddress: Address
  userAddress: Address | SolanaAddress
  /**
   * Explicit permit preference for the source-side authorization step.
   * - `true`: request a permit-style signature.
   * - `false`: request the standard approve flow.
   * - omitted: backend decides (preserves today's behavior).
   *
   * When defined, takes priority over the legacy auto-gasless-fallback —
   * the FE toggle's intent wins.
   */
  usePermit?: boolean
  /**
   * Opt into provider-aware routing; the response becomes a {@link RoutedQuoteResponse}.
   * Defaults to false: only send `true` from a client that can execute one.
   */
  routing?: boolean
} & (
  | {
      fromAmountBaseUnit: bigint
      toAmountBaseUnit?: never
    }
  | {
      fromAmountBaseUnit?: never
      toAmountBaseUnit: bigint
    }
)

export interface FeeBreakdownV2 {
  gasUsd: number
  fillCostUsd: number
  fillCostPercent: number
  totalImpactUsd: number
  totalImpact: number
  swapImpact: number
  swapImpactUsd: number
  appFeePercent: number
  appFeeUsd: number
  maxSlippage: number
  minReceived: number
  exchangeRate?: number // only available for swapping
  appFeeLabel?: string
}

export type CheckoutQuoteResponseV2 = CheckoutQuoteResponse & {
  metadata: {
    feeBreakdown: FeeBreakdownV2
  }
}

/**
 * One wallet action of a routed quote, JSON-safe. `value` is a decimal string
 * the client converts to `bigint`; `data` passes through untouched.
 */
export type CheckoutExecutionStep =
  | { vm: 'EVM'; to: Address; data: Hex; value: string }
  | { vm: 'TRON'; to: TronAddress; data: Hex; value: string }
  | { vm: 'SOLANA'; to: SolanaAddress; serializedTx: string }

/** Providers the client knows how to execute. Grows as providers ship. */
export type RoutedQuoteProvider = 'relay' | 'across'

export type RoutedQuoteTradeType =
  | 'EXACT_INPUT'
  | 'EXACT_OUTPUT'
  | 'EXPECTED_OUTPUT'

/**
 * Relay's quote with its server-only `request` stripped. Typed loosely here so
 * api-base does not depend on the Relay SDK; `@funkit/connect-core` narrows it
 * at the execution boundary.
 */
export type SanitizedRelayQuote = {
  steps: unknown[]
  details?: unknown
}

/**
 * Provider-agnostic quote returned when the request sets `routing: true`.
 * - `provider === 'relay'` → execute `metadata.relayQuote` through Relay SDK.
 * - Otherwise → `execution.steps[]` is the complete ordered wallet action on
 *   `fromChainId`, approvals included. An empty list is invalid.
 */
export type RoutedQuoteResponse = CheckoutQuoteResponse & {
  provider: RoutedQuoteProvider
  tradeType: RoutedQuoteTradeType
  expiresAtMs: number
  fromChainId: string
  toChainId: string
  toTokenAddress: Address
  fromAmountBaseUnit: string
  toAmountBaseUnit: string
  execution: { steps: CheckoutExecutionStep[] }
  metadata: {
    feeBreakdown: FeeBreakdownV2
    oftEnabled?: boolean
    requestId?: string
    relayQuote?: SanitizedRelayQuote
    [x: string]: unknown
  }
}

/**
 * Lightning Network checkout quote request. Sent to the same `/checkout/quoteV2`
 * endpoint as the standard quote; the BE dispatches to the Flashnet rail based
 * on `fromChainId === LIGHTNING_MAINNET_CHAIN_ID`. The caller is expected to
 * supply Lightning's chain id and native sentinel from `@funkit/chains`.
 */
export interface LightningQuoteRequest {
  /** Lightning chain id — `LIGHTNING_MAINNET_CHAIN_ID` from `@funkit/chains`. */
  fromChainId: string
  /** Native token sentinel — `FUNKIT_CONNECT_CHECKOUT_NATIVE_CURRENCY_ADDRESS` from `@funkit/chains`. */
  fromTokenAddress: Address
  fromAmountSats: bigint
  toChainId: string
  toTokenAddress: Address
  recipientAddress: Address
  userAddress: Address
}

/**
 * Lightning Network checkout quote response. Returned by `/checkout/quoteV2`
 * when the request targets the Lightning rail — `fromChainId` being Lightning's
 * is what makes the response a Lightning one, so there is no `kind` discriminant.
 */
export interface LightningQuoteResponse {
  quoteId: string
  fromChainId: string
  toChainId: string
  toTokenAddress: Address
  invoice: {
    bolt11: string
    amountSats: string
    expiresAtMs: number
  }
  estimate: {
    amountOutBaseUnit: string
    estTotalUsd: number
    estFeesUsd: number
  }
  flashnet: {
    quoteId: string
    orderId: string
  }
}

/**===============*
 * CHECKOUT INIT  *
 *================*/

export type CheckoutApiInitParams = {
  userOp?: UserOperation
  quoteId: string
  sourceOfFund: string
  salt: Hex
  /**
   * Client-generated UUID that uniquely identifies this checkout session.
   * Threaded through so the backend can persist it on the checkout row
   * and analytics downstream can join client-side telemetry to executed
   * checkouts. Safe to send before the backend persists it: unknown
   * fields in the request body are ignored until the matching backend
   * PR lands. Callers should pass the same UUID they use to identify the
   * session on the client (see `initNewCheckout` in `@funkit/connect`).
   */
  checkoutId: string
  // TODO: Proper typing wrt _generateClientMetadata() logic
  clientMetadata: object
}

export type CheckoutInitParams = BaseApiRequest &
  Omit<CheckoutApiInitParams, 'salt'>

export type CheckoutInitResponse = {
  depositAddr: Address
}

export type CheckoutInitTokenTransferResponse = CheckoutInitResponse & {
  solanaAddr: SolanaAddress
  btcAddrSegwit: BitcoinAddress
  btcAddrTaproot: BitcoinAddress
  btcDepositAddr: BitcoinAddress
  tronAddr: TronAddress
  /** Set by the server when the user's account is flagged for compliance review. */
  blocked?: boolean
}

/**=====================*
 * CHECKOUT DEACTIVATE  *
 *======================*/

export type CheckoutDeactivateParams = BaseApiRequest & {
  depositAddress: Address
}

// Reference from api server: https://github.com/fun-xyz/fun-api-server/blob/main/src/tables/FunWalletCheckout.ts#L11C1-L21C2
export enum CheckoutState {
  // In-progress States
  FROM_UNFUNDED = 'FROM_UNFUNDED',
  FROM_FUNDED = 'FROM_FUNDED',
  FROM_POOLED = 'FROM_POOLED',
  TO_UNFUNDED = 'TO_UNFUNDED',
  TO_FUNDED = 'TO_FUNDED',
  TO_POOLED = 'TO_POOLED',
  TO_READY = 'TO_READY',
  PENDING_RECEIVAL = 'PENDING_RECEIVAL',
  // Terminal States
  COMPLETED = 'COMPLETED',
  CHECKOUT_ERROR = 'CHECKOUT_ERROR',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Checkout state categorizations
export const FROM_PROGRESS_CHECKOUT_STATES = [
  CheckoutState.FROM_UNFUNDED,
  CheckoutState.FROM_FUNDED,
  CheckoutState.FROM_POOLED,
]

export const TO_PROGRESS_CHECKOUT_STATES = [
  CheckoutState.TO_UNFUNDED,
  CheckoutState.TO_FUNDED,
  CheckoutState.TO_POOLED,
  CheckoutState.TO_READY,
  CheckoutState.PENDING_RECEIVAL,
]

export const IN_PROGRESS_CHECKOUT_STATES = [
  ...TO_PROGRESS_CHECKOUT_STATES,
  ...FROM_PROGRESS_CHECKOUT_STATES,
]

export const TERMINAL_CHECKOUT_STATES = [
  CheckoutState.EXPIRED,
  CheckoutState.CHECKOUT_ERROR,
  CheckoutState.COMPLETED,
  CheckoutState.CANCELLED,
]

export enum CheckoutRefundState {
  INITIATED = 'INITIATED',
  ERROR = 'ERROR',
  REFUNDED = 'REFUNDED',
  PROCEEDED = 'PROCEEDED',
  WAITING_FOR_FULFILLMENT = 'WAITING_FOR_FULFILLMENT',
  FULFILLED = 'FULFILLED',
}

export type CheckoutHistoryItem = {
  createdTimeMs: number
  depositAddr: Address
  currentDepositAddr: Address
  recipientAddr: Address
  expirationTimestampSeconds: number
  fromAmountBaseUnit: string
  fromChainId: string
  fromTokenAddress: Address
  funWalletAddr: Address
  lastUpdatedTimeMs: number
  salt: Hex
  state: CheckoutState
  toAmountBaseUnit: string
  toChainId: string
  toTokenAddress: Address
  userOp?: UserOperation
  version: number
  sourceOfFund: string
  clientMetadata: ApiCheckoutClientMetadata
  refundState?: CheckoutRefundState
  // Note: Optional, because BE does not retroactively update existing CheckoutHistoryItem entries
  stateTimestampMs?: Partial<Record<CheckoutState, number>>
}

/**===============================*
 * RISK ASSESSMENT  *
 *================================*/

export type RiskAssessmentParams = BaseApiRequest & {
  address: FunAddress
  /**
   * Internal decimal chain id of the transaction's chain. Scopes the screen to
   * that chain when the backend falls back to a per-chain provider; omitting it
   * keeps the backend's default chain.
   */
  chainId?: string
}

type AddressIdentification = {
  name: string
  address: FunAddress
  category: string
  description: string
  url: string | null
  createdAt: number
}

type Cluster = {
  name: string
  category: string
}

export type RiskValues = 'Severe' | 'High' | 'Medium' | 'Low'

type ExposureType = 'direct' | 'indirect'

type Exposure = {
  category: string
  value: number
  exposureType: ExposureType
  direction: string
}

type RiskTrigger = {
  risk: string
  minThreshold: number
  maxThreshold: number
  exposureType: string
  direction: string
}

type Trigger = {
  category: string
  percentage: number
  message: string
  ruleTriggered?: RiskTrigger
}

type PoolMetadata = {
  fees?: number
  tokens: string[]
}

type Base58 =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
export type SolanaAddress = `${Base58}${string}`
export type LighterAccountIndex = `${number}`
export type BitcoinAddress =
  | `1${string}`
  | `3${string}`
  | `bc1${string}`
  | `bc1p${string}`
export type TronTAddress = `T${Base58}${string}`
export type Tron41HexAddress = `41${string}`
export type TronEvmHexAddress = `0x${string}`
export type TronAddress = TronTAddress | TronEvmHexAddress | Tron41HexAddress
export type FunAddress =
  | Address
  | SolanaAddress
  | BitcoinAddress
  | LighterAccountIndex
  | TronAddress

export type RiskAssessmentResponse = {
  address: FunAddress
  risk: RiskValues
  riskReason: string | null
  cluster?: Cluster
  addressType: string
  addressIdentifications: AddressIdentification[]
  exposures: Exposure[]
  triggers: Trigger[]
  status: string
  poolMetadata: PoolMetadata
}

export type CheckoutInitTokenTransferAddressParams = BaseApiRequest & {
  toChainId: string
  toTokenAddress: Address
  userId: string
  clientMetadata: NonNullable<object>
  sourceOfFund?: string
  recipientAddr: string
  actionType?: string
  /**
   * Client-generated UUID identifying the active checkout/deposit flow. See
   * `CheckoutApiInitParams.checkoutId` for the analogous `/checkout` field.
   */
  checkoutId?: string
}
