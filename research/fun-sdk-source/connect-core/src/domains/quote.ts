import {
  type FeeBreakdownV2,
  type SolanaAddress,
  getCheckoutQuoteV2,
} from '@funkit/api-base'
import { FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO } from '@funkit/chains'
import type { RelayQuoteResult, RelayVmType } from '@funkit/fun-relay'
import type {
  ApiFunkitCheckoutQuoteResult,
  CheckoutQuoteResponse,
} from '@funkit/utils'
import type { Address } from 'viem'
import type { FunLogger } from '../utils/funLogger'
import { PaymentMethod } from './paymentMethods'

// Pure checkout-quote helpers — no wallet, relay, withdrawal, or Swapped
// specifics. Typed EXACT_OUT / EXACT_IN wrappers over the api-base quote
// endpoint, whose request type is an XOR union of the two amount fields.

/** Inputs for an EXACT_OUT checkout quote (deliver exactly `toAmountBaseUnit`). */
export interface ExactOutQuoteParams {
  apiKey: string
  logger: FunLogger
  fromChainId: string
  fromTokenAddress: Address
  toChainId: string
  toTokenAddress: Address
  recipientAddress: Address
  userAddress: Address
  /** Base units of the TARGET token to deliver. */
  toAmountBaseUnit: bigint
}

/**
 * Fetch an EXACT_OUT checkout quote: the recipient is credited exactly
 * `toAmountBaseUnit` of the target token, and `userAddress` pays whatever source
 * amount the quote requires. Pure — the caller owns decimals resolution,
 * execution, and any record-keeping.
 */
export async function fetchExactOutQuote(
  params: ExactOutQuoteParams,
): Promise<CheckoutQuoteResponse> {
  return getCheckoutQuoteV2(params)
}

/** Inputs for an EXACT_IN checkout quote (spend exactly `fromAmountBaseUnit`). */
export interface ExactInQuoteParams {
  apiKey: string
  logger: FunLogger
  fromChainId: string
  fromTokenAddress: Address | SolanaAddress
  toChainId: string
  toTokenAddress: Address
  recipientAddress: Address
  userAddress: Address
  /** Base units of the SOURCE token to spend. */
  fromAmountBaseUnit: bigint
}

/**
 * Fetch an EXACT_IN checkout quote: `userAddress` spends exactly
 * `fromAmountBaseUnit` of the source token and the recipient is credited
 * whatever the route delivers. The caller owns decimals resolution, execution,
 * and any record-keeping.
 */
export async function fetchExactInQuote(
  params: ExactInQuoteParams,
): Promise<CheckoutQuoteResponse> {
  return getCheckoutQuoteV2(params)
}

/**
 * Normalise a quote's fee breakdown so every field is a number.
 *
 * Takes a logger because a missing breakdown means the fee rows would silently
 * read as zero — the quote came back, so the user is about to see a price that
 * isn't the real one.
 */
export function extractRelayFeeInfo(
  metadata: Record<string, unknown> | undefined,
  logger: FunLogger,
): FeeBreakdownV2 {
  const breakdown = metadata?.feeBreakdown as FeeBreakdownV2 | undefined
  if (!breakdown) {
    if (metadata) {
      logger.error(
        'extractRelayFeeInfo:missingFeeBreakdown',
        new Error('Quote carries no fee breakdown'),
      )
    }
    // Built per call, not hoisted to a module const: a caller that mutates what
    // it got back would otherwise poison every later fallback.
    return {
      gasUsd: 0,
      fillCostUsd: 0,
      fillCostPercent: 0,
      totalImpactUsd: 0,
      totalImpact: 0,
      swapImpact: 0,
      swapImpactUsd: 0,
      appFeePercent: 0,
      appFeeUsd: 0,
      maxSlippage: 0,
      minReceived: 0,
    }
  }
  return {
    gasUsd: breakdown.gasUsd ?? 0,
    fillCostUsd: breakdown.fillCostUsd ?? 0,
    fillCostPercent: breakdown.fillCostPercent ?? 0,
    totalImpactUsd: breakdown.totalImpactUsd ?? 0,
    totalImpact: breakdown.totalImpact ?? 0,
    swapImpact: breakdown.swapImpact ?? 0,
    swapImpactUsd: breakdown.swapImpactUsd ?? 0,
    appFeePercent: breakdown.appFeePercent ?? 0,
    appFeeUsd: breakdown.appFeeUsd ?? 0,
    maxSlippage: breakdown.maxSlippage ?? 0,
    minReceived: breakdown.minReceived ?? 0,
    exchangeRate: breakdown.exchangeRate,
    appFeeLabel: breakdown.appFeeLabel,
  }
}

/**
 * What the recipient receives, in destination-token units.
 *
 * WARN, not ERROR: every other row still prices, so the user just reads `—` on
 * the one that matters. Nothing has moved.
 */
export function extractRelayReceiveAmount(
  metadata: Record<string, unknown> | undefined,
  logger: FunLogger,
): string | undefined {
  const relayQuote = metadata?.relayQuote as
    | RelayQuoteResult<RelayVmType>
    | undefined
  const amountFormatted = relayQuote?.details?.currencyOut?.amountFormatted
  if (!amountFormatted && metadata) {
    logger.warn('extractRelayReceiveAmount:missingCurrencyOut')
  }
  return amountFormatted
}

/**
 * The quote as the DirectExecution record has to carry it.
 *
 * The backend's relay watcher reads its request id out of `clientMetadata.latestQuote.baseQuote.quoteId`
 *
 * Web reaches the same object through `getQuoteFinalEstimation`, which needs a
 * wagmi config, a payment method and a login type to price gas — none of which
 * exist here, and none of which a withdrawal uses: web's own `evaluateFeeBreakdown`
 * skips gas estimation for withdrawals and returns exactly the fields below.
 */
export function toClientMetadataQuote(
  quote: CheckoutQuoteResponse,
  sourceChainId: string,
): ApiFunkitCheckoutQuoteResult {
  return {
    baseQuote: quote,
    finalTimeEstimationMs: quote.estCheckoutTimeMs,
    finalPaymentTokenAmount: quote.estTotalFromAmount,
    finalPaymentFeeUsd: String(quote.estFeesUsd),
    finalTotalUsd: String(quote.estTotalUsd),
    finalFeesBreakdown: {
      paymentMethod: PaymentMethod.ACCOUNT_BALANCE,
      // Web's own fallback (`getFunFeeBreakdown`): older quotes carry no
      // market-maker figure, where the total fee is the whole of it.
      marketMakerFeeUsd: quote.estMarketMakerGasUsd ?? quote.estFeesUsd,
      liquidityProviderFeeUsd: quote.lpFeeUsd ?? 0,
      totalFeesUsd: quote.estFeesUsd,
      totalFeesTokenWithoutGas: Number(quote.estFeesFromAmount),
      eoaWalletFeeToken: 0,
      eoaWalletFeeUsd: 0,
      nativeCurrencySymbol:
        FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[sourceChainId]?.nativeCurrency
          .symbol || '',
    },
  }
}
