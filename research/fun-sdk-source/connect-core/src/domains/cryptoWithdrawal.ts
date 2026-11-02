import {
  DirectExecutionType,
  type SolanaAddress,
  createDirectExecution,
} from '@funkit/api-base'
import { type RelayQuoteResult, shouldResetApproval } from '@funkit/fun-relay'
import {
  type ApiCheckoutClientMetadata,
  type CheckoutQuoteResponse,
  isAddressEquivalent,
} from '@funkit/utils'
import {
  type Address,
  type Hex,
  decodeFunctionData,
  encodeFunctionData,
  erc20Abi,
  getAddress,
} from 'viem'
import type { WithdrawalClient } from '../interfaces/withdrawalClient'
import type { FunLogger } from '../utils/funLogger'
import { getPublicClientFor } from '../utils/publicClient'
import { randomUuid } from '../utils/randomUuid'
import { isUserRejectedError } from '../utils/signature'
import { PaymentMethod } from './paymentMethods'
import { toClientMetadataQuote } from './quote'
import { ensureOnSourceChain, executeWithdrawalRelayQuote } from './withdrawal'

/** A token leg of a crypto withdrawal. */
export interface CryptoWithdrawalToken {
  /** Numeric chain id as a string, matching api-base's token shapes. */
  chainId: string
  address: Address
  symbol: string
}

/** The source leg also takes an SPL mint. */
export interface CryptoWithdrawalSourceToken extends Omit<
  CryptoWithdrawalToken,
  'address'
> {
  address: Address | SolanaAddress
}

/** A user-confirmed send-to-address withdrawal, ready to execute. */
export interface CryptoWithdrawalOrder {
  /**
   * Caller-minted idempotency key (the caller owns dedupe). Also the id
   * surfaced to hosts, standing in for the fiat rail's provider order id.
   */
  submissionId: string
  /** Where the funds land — the quote's `recipientAddress`. */
  recipientAddress: Address
  /**
   * Amount of the SOURCE token in human units, as the user typed it. Logged
   * for reconciliation only; the base-unit figure that actually moves comes
   * off the quote.
   */
  sourceAmountHumanUnit: string
  sourceToken: CryptoWithdrawalSourceToken
  destinationToken: CryptoWithdrawalToken
}

/**
 * Retry safety, which callers MUST branch on:
 * - `MISSING_RELAY_QUOTE` — nothing was submitted; safe to re-quote and retry.
 * - `MISSING_TX_HASH` — relay reported the user actions completed, so funds may
 *   already have moved. NEVER retry; surface for manual reconciliation.
 */
/**
 * Mint the id that dedupes a submission. Lives here so callers don't take on a
 * uuid dependency of their own.
 */
export function createWithdrawalSubmissionId(): string {
  return randomUuid()
}

export type CryptoWithdrawalErrorCode =
  | 'MISSING_RELAY_QUOTE'
  | 'MISSING_TX_HASH'

/** Typed failure so callers can branch on retry safety without string matching. */
export class CryptoWithdrawalError extends Error {
  readonly code: CryptoWithdrawalErrorCode
  constructor(code: CryptoWithdrawalErrorCode, message: string) {
    super(message)
    this.name = 'CryptoWithdrawalError'
    this.code = code
  }
}

export interface ProcessCryptoWithdrawalOrderParams {
  order: CryptoWithdrawalOrder
  /**
   * The quote the user approved on screen — executed as-is, never re-fetched,
   * so the fees they saw are the fees they pay. Callers keep it fresh by
   * re-quoting on their own interval.
   */
  quote: CheckoutQuoteResponse
  wallet: WithdrawalClient
  apiKey: string
  userId: string
  logger: FunLogger
  /** Relay step progress (raw step action text), for optional host display. */
  onStepMessage?: (message: string) => void
}

/**
 * Minimal metadata for the DirectExecution record. Deliberately duplicated from
 * the fiat rail rather than shared: the two pipelines are siblings, and
 * `isWithdrawal: true` is the only field the backend contract depends on.
 */
function buildCryptoWithdrawalClientMetadata(
  order: CryptoWithdrawalOrder,
  quote: CheckoutQuoteResponse,
): ApiCheckoutClientMetadata {
  return {
    id: randomUuid(),
    startTimestampMs: Date.now(),
    finalDollarValue: quote.estTotalUsd,
    latestQuote: toClientMetadataQuote(quote, order.sourceToken.chainId),
    depositAddress: null,
    initSettings: {
      config: {
        targetChain: order.destinationToken.chainId,
        targetAsset: order.destinationToken.address,
        targetAssetTicker: order.destinationToken.symbol,
      },
    },
    selectedPaymentMethodInfo: {
      paymentMethod: PaymentMethod.ACCOUNT_BALANCE,
      title: 'Account balance',
      description: '',
    },
    selectedSourceAssetInfo: {
      // Response-side type; the backend already stores base58 here.
      address: order.sourceToken.address as Address,
      symbol: order.sourceToken.symbol,
      chainId: order.sourceToken.chainId,
      iconSrc: null,
    },
    isWithdrawal: true,
  }
}

/**
 * Zero a stale allowance for tokens whose `approve` reverts unless the current
 * allowance is 0 (LDO and friends) — port of web's `resetApprovalIfNeeded`.
 * Entirely best-effort: any unmet assumption or thrown error is a no-op, since
 * the relay's own approve step is what actually matters.
 */
async function resetApprovalIfNeeded({
  relayQuote,
  wallet,
  chainId,
  logger,
}: {
  relayQuote: RelayQuoteResult<'evm'>
  wallet: WithdrawalClient
  chainId: number
  logger: FunLogger
}): Promise<void> {
  try {
    const currencyInAddress = relayQuote.details?.currencyIn?.currency?.address
    if (!currencyInAddress) {
      return
    }
    const tokenAddress = getAddress(currencyInAddress as Address)
    if (!shouldResetApproval(tokenAddress)) {
      return
    }

    const approveItem = relayQuote.steps.find((step) => {
      const approveTarget = step.items?.[0]?.data?.to
      return (
        step.id === 'approve' &&
        approveTarget != null &&
        isAddressEquivalent({
          firstAddress: approveTarget,
          secondAddress: tokenAddress,
        })
      )
    })?.items?.[0] as { data: { data: Hex; from: Address } } | undefined
    if (!approveItem) {
      return
    }

    const publicClient = getPublicClientFor(chainId)
    if (!publicClient) {
      logger.warn('crypto-withdrawal:reset_approval:no_allowance_reader', {
        chainId,
      })
      return
    }

    // Relay's approve calldata is the only place its spender is named.
    const spenderAddress = decodeFunctionData({
      abi: erc20Abi,
      data: approveItem.data.data,
    }).args?.[0] as Address | undefined
    if (!spenderAddress) {
      return
    }

    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [approveItem.data.from, spenderAddress],
    })
    if (allowance === 0n) {
      return
    }

    logger.info('crypto-withdrawal:reset_approval:resetting', {
      tokenAddress,
      spenderAddress,
      allowance: allowance.toString(),
    })
    const txHash = await wallet.sendTransaction(chainId, {
      to: tokenAddress,
      value: '0',
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderAddress, 0n],
      }),
    })
    // Unlike web, wait for the reset to land — otherwise relay's approve can
    // be mined first and revert, which is the failure this exists to prevent.
    await wallet.confirmTransaction(txHash, chainId)
  } catch (error) {
    logger.warn('crypto-withdrawal:reset_approval:skipped', {
      error: (error as Error)?.message,
    })
  }
}

/**
 * Execute → record pipeline for a crypto send-to-address withdrawal. Unlike the
 * fiat rail it does not quote: it executes the EXACT_IN quote the user approved.
 *
 * - Callers own dedupe and re-entrancy; pre-record steps throw (see
 *   {@link CryptoWithdrawalErrorCode} for retry safety).
 * - Recording never throws — the funds have already moved.
 * - Needs `ensureRelayClientInitialized` called first.
 */
export async function processCryptoWithdrawalOrder({
  order,
  quote,
  wallet,
  apiKey,
  userId,
  logger,
  onStepMessage,
}: ProcessCryptoWithdrawalOrderParams): Promise<{
  txHash: Hex
  quote: CheckoutQuoteResponse
}> {
  // Validate before touching the wallet: an unexecutable request should never
  // have prompted a network switch.
  const relayQuote = quote.metadata?.relayQuote as
    | RelayQuoteResult<'evm'>
    | undefined
  if (!relayQuote) {
    throw new CryptoWithdrawalError(
      'MISSING_RELAY_QUOTE',
      'Quote response carries no relay quote — cannot execute the withdrawal',
    )
  }

  const sourceChainId = Number(order.sourceToken.chainId)
  await ensureOnSourceChain(wallet, sourceChainId, logger)

  // The wallet signing the withdrawal, which is not necessarily the end user's
  // own address — web draws the same distinction (`withdrawalWalletAddress`).
  const withdrawalWalletAddress = wallet.address() as Address
  logger.info('crypto-withdrawal:executing', {
    submission_id: order.submissionId,
    fromToken: order.sourceToken.address,
    fromChainId: order.sourceToken.chainId,
    toToken: order.destinationToken.address,
    toChainId: order.destinationToken.chainId,
    sourceAmountHumanUnit: order.sourceAmountHumanUnit,
    // Which signing path this withdrawal took, and hence whether the approval
    // reset below runs at all.
    walletKind: wallet.adaptedWallet ? 'adapted' : 'evm',
  })

  // ERC-20 allowances are an EVM concept: a non-EVM rail has no allowance to
  // read and no public client for its chain, so the reset would only log a
  // warning on every withdrawal.
  if (!wallet.adaptedWallet) {
    await resetApprovalIfNeeded({
      relayQuote,
      wallet,
      chainId: sourceChainId,
      logger,
    })
  }

  const txHash = await executeWithdrawalRelayQuote({
    relayQuote,
    wallet,
    logger,
    rail: 'crypto-withdrawal',
    context: { submission_id: order.submissionId },
    onStepMessage,
  })
  if (!txHash) {
    // Relay said the user actions completed, so funds may already have moved
    // with nothing to reconcile against — unrecoverable and alertable, and the
    // one failure the caller must never retry.
    const error = new CryptoWithdrawalError(
      'MISSING_TX_HASH',
      'Relay reported completed user actions without a transaction hash — the withdrawal may have been submitted; do not retry',
    )
    logger.error('crypto-withdrawal:missing_tx_hash', error, {
      submission_id: order.submissionId,
    })
    throw error
  }

  // The on-chain leg has settled. Log the submission id ↔ tx hash BEFORE
  // recording, so the correlation survives even if the record call fails.
  logger.info('crypto-withdrawal:submitted', {
    submission_id: order.submissionId,
    txHash,
  })

  const toAmountBaseUnit =
    (quote.metadata?.toAmountBaseUnit as string | undefined) ??
    relayQuote.details?.currencyOut?.amount
  if (!toAmountBaseUnit) {
    logger.warn('crypto-withdrawal:missing_to_amount', {
      submission_id: order.submissionId,
      txHash,
    })
  }

  // Record for backend reconciliation/history. Best-effort: the funds have
  // already moved, so a failed record must NOT surface as an execution error —
  // that would let the caller retry and submit a second transaction.
  const isAcrossRoute = Boolean(quote.metadata?.across?.enabled)
  try {
    await createDirectExecution({
      txHash,
      userId,
      recipientAddr: order.recipientAddress,
      type: isAcrossRoute
        ? DirectExecutionType.ACROSS
        : DirectExecutionType.RELAY,
      fromChainId: order.sourceToken.chainId,
      // Response-side type; the backend already stores base58 here.
      fromTokenAddress: order.sourceToken.address as Address,
      toChainId: order.destinationToken.chainId,
      toTokenAddress: order.destinationToken.address,
      fromAmountBaseUnit: quote.estTotalFromAmountBaseUnit,
      toAmountBaseUnit: toAmountBaseUnit ?? '0',
      estTotalUsd: quote.estTotalUsd,
      sourceOfFund: `${PaymentMethod.ACCOUNT_BALANCE}|eoa|${withdrawalWalletAddress}`,
      clientMetadata: buildCryptoWithdrawalClientMetadata(order, quote),
      apiKey,
      logger,
    })
  } catch (recordError) {
    logger.error('crypto-withdrawal:record_failed', recordError as Error, {
      submission_id: order.submissionId,
      txHash,
    })
  }

  return { txHash, quote }
}
