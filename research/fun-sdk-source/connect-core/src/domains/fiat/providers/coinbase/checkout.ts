import type {
  CoinbaseCheckout,
  CoinbaseFaultReason,
  CoinbaseKycNextAction,
  CoinbaseOrderResponse,
  CoinbaseOtpNextAction,
  CoinbasePayNextAction,
  CoinbasePrice,
  CoinbaseStepRefusal,
  CoinbaseStepResponse,
} from '@fun-xyz/fiat-contract/coinbase'
import type { TermsDocument } from '@fun-xyz/fiat-contract/terms'
import type {
  FiatAmount,
  DestinationAsset as FiatDestinationAsset,
  FiatGeo,
  FiatStepResponse,
  KycFieldId,
} from '@fun-xyz/fiat-contract/types'

import { offersDeliveryTransition } from '~/domains/fiat/deliveryTransition'
import type { FiatRouteFault } from '~/domains/fiat/fiatRoute'
import { localizedTerms, termsAcceptances } from '~/domains/fiat/terms'
import {
  type CoinbaseNextBody,
  type CoinbaseNextRequestOf,
  coinbaseFaultReason,
} from './api'

/** A `POST /fiat/next` body the checkout sends. A retry sends the same body again. */
export type CoinbaseCall = CoinbaseNextBody

type OrderCall = CoinbaseNextRequestOf<'order'>

/** Legacy's order poll (fun-backend `buildOrderPollTransition`): 2s, backing off 1.5x to 15s, for 15 minutes. */
const ORDER_READ_INTERVAL_MS = 2_000
const ORDER_READ_BACKOFF = 1.5
const ORDER_READ_MAX_INTERVAL_MS = 15_000
const ORDER_READ_GIVE_UP_AFTER_MS = 15 * 60 * 1000

/**
 * How long the order waits before its next read, after `polls` reads: legacy's backoff, from the
 * interval the backend asked for when it named one.
 */
export function coinbaseOrderReadDelayMs(
  polls: number,
  intervalMs: number = ORDER_READ_INTERVAL_MS,
): number {
  return Math.min(
    intervalMs * ORDER_READ_BACKOFF ** polls,
    Math.max(ORDER_READ_MAX_INTERVAL_MS, intervalMs),
  )
}

/**
 * Automatic `order` reads after the payment page reports, failed reads included: as many as legacy's
 * backoff fits in its 15 minutes. After the last one the wait gives up as legacy's poll does past its
 * deadline: the sheet can close, and nothing reads again.
 */
export const COINBASE_MAX_ORDER_POLLS = (() => {
  let polls = 0
  for (let waited = 0; waited < ORDER_READ_GIVE_UP_AFTER_MS; polls++) {
    waited += coinbaseOrderReadDelayMs(polls)
  }
  return polls
})()

/** The last backend answer, exactly as it came, with the checkout and geo its request carried. */
export type CoinbaseAnswer =
  | {
      action: Exclude<CoinbaseCall['action'], 'order'>
      response: CoinbaseStepResponse
      checkout: CoinbaseCheckout
      geo: FiatGeo
    }
  | {
      action: 'order'
      response: CoinbaseOrderResponse
      checkout: CoinbaseCheckout
      geo: FiatGeo
    }

export type CoinbaseCheckoutExit =
  | {
      recovery: 'REQUOTE' | 'RETRY' | 'NONE'
      refusal?: CoinbaseStepRefusal | 'LIMITS_EXCEEDED'
      /** `LIMITS_EXCEEDED` only: the cap that refused, when it is an amount. */
      maxAmount?: FiatAmount
    }
  | { cancelled: true }

export interface CoinbaseCheckoutState {
  /** Sent on every request. */
  checkout: CoinbaseCheckout
  /** Sent as every request's top-level `geo`. */
  geo: FiatGeo
  /**
   * The asset the buyer receives, sent on every request; `checkout.destination` stays what Coinbase
   * delivers. Absent where the flow's quotes carry none.
   */
  destinationAsset?: FiatDestinationAsset
  /** Fun login only: the recipient, sent on every request as `depositAddress`. */
  depositAddress?: string
  answer?: CoinbaseAnswer
  /** The request in flight. */
  call?: CoinbaseCall
  /** The order the payment page reported on, or one a step answered open: its `order` is sent until the order is terminal. */
  charge?: OrderCall
  chargePolls?: number
  /**
   * The payment page reported on `charge`, so it may be paid: the checkout cannot exit or change the amount. An
   * open order a step answered is only read; nothing in this checkout paid it, since no link for it was shown.
   */
  reported?: true
  /**
   * The `pay` prompt's single-use link loaded, and its page failed or left the screen unreported. A new amount
   * is only recorded: the next order is placed once the page is drawn again, so none goes under main's failed sheet.
   */
  spent?: true
  /**
   * The order whose `pay` page failed or whose sheet closed, which main's payment-failed sheet answered. Once
   * its page is spent, the next order waits for the buyer's tap, as legacy's pay button does after that sheet.
   */
  failedLink?: string
  /** A request that failed with `RETRY`; `RETRY` sends it again. */
  failure?: { call: CoinbaseCall; fault: FiatRouteFault | undefined }
  exit?: CoinbaseCheckoutExit
  /** Coinbase refused the phone number just sent: the `session` prompt stays up for another one. */
  phoneRefused?: true
}

export type CoinbaseCheckoutEvent =
  /** Continue on the documents a `consent` prompt showed. */
  | { type: 'TERMS_ACCEPTED'; acceptedAt: string; locale?: string }
  | {
      type: 'STEP'
      call: Exclude<CoinbaseCall, OrderCall>
      response: CoinbaseStepResponse
    }
  | { type: 'ORDER'; call: CoinbaseCall; response: CoinbaseOrderResponse }
  | { type: 'FAILED'; call: CoinbaseCall; fault: FiatRouteFault | undefined }
  /** The buyer's tap on a failed request; `at` is the tap time, a `consent`'s new `acceptedAt`. */
  | { type: 'RETRY'; at: string }
  /** E.164, for a `session` prompt. */
  | { type: 'PHONE_SUBMITTED'; phoneNumber: string }
  | { type: 'OTP_SUBMITTED'; otpCode: string }
  /** A new code to the phone of the live `otp` prompt. */
  | { type: 'OTP_RESEND' }
  | { type: 'KYC_SUBMITTED'; values: Partial<Record<KycFieldId, string>> }
  /** A `wait` or an open order's `retryAfterMs` has passed. */
  | { type: 'PENDING_ELAPSED' }
  /**
   * The payment page reached an end: paid, failed, or its transaction failed. The order's outcome is
   * read from the backend either way, and the link is never opened again.
   */
  | { type: 'PAYMENT_REPORTED' }
  /** The `pay` prompt's page failed, or left the screen without reporting: its link cannot load again. */
  | { type: 'PAY_LINK_SPENT'; orderId: string }
  /**
   * The page of a spent link is drawn again: it needs a new order, for the terms the screen shows now. An
   * amount change can land after the page is drawn again, so the redraw carries the new terms itself.
   */
  | ({
      type: 'PAY_LINK_REDRAWN'
      orderId: string
      checkout: CoinbaseCheckout
      geo: FiatGeo
    } & CoinbaseRecipientTerms)
  /** The `pay` prompt's page failed or its sheet closed, and main's payment-failed sheet answers it. */
  | { type: 'PAY_LINK_FAILED'; orderId: string }
  /** The buyer's tap to pay again after a failed page: a new order. */
  | { type: 'PAY_AGAIN'; orderId: string }
  /** The amount, the geo, or a Fun login's recipient terms changed. */
  | ({
      type: 'AMOUNT_CHANGED'
      checkout: CoinbaseCheckout
      geo: FiatGeo
    } & CoinbaseRecipientTerms)
  /**
   * The buyer's tap releases the first `observe`, held until now: it is built again from the terms on
   * screen, since an amount change while it was held left it with the old ones.
   */
  | { type: 'HELD_CALL_RELEASED' }
  | { type: 'EXIT'; exit: CoinbaseCheckoutExit }

/**
 * The asset the buyer receives and, for a Fun login only, the recipient. A host with a minter names
 * its recipient in its assertion, so sends no `depositAddress`.
 */
export type CoinbaseRecipientTerms = Pick<
  CoinbaseCheckoutState,
  'destinationAsset' | 'depositAddress'
>

function recipientOf({
  destinationAsset,
  depositAddress,
}: CoinbaseRecipientTerms): CoinbaseRecipientTerms {
  return {
    ...(destinationAsset === undefined ? {} : { destinationAsset }),
    ...(depositAddress === undefined ? {} : { depositAddress }),
  }
}

/** Every checkout starts on `observe`. */
export function coinbaseCheckoutStart(
  checkout: CoinbaseCheckout,
  geo: FiatGeo,
  recipient: CoinbaseRecipientTerms = {},
): CoinbaseCheckoutState {
  const state = { checkout, geo, ...recipientOf(recipient) }
  return { ...state, call: observeCall(state) }
}

type ContextSource = Pick<
  CoinbaseCheckoutState,
  'checkout' | 'geo' | 'destinationAsset' | 'depositAddress'
>

/** What every request carries besides its action's result; an order names the terms it priced. */
function requestContext(
  state: ContextSource,
  priced: Pick<CoinbaseCheckoutState, 'checkout' | 'geo'> = state,
) {
  return {
    provider: 'COINBASE' as const,
    geo: priced.geo,
    checkout: priced.checkout,
    ...recipientOf(state),
  }
}

function observeCall(state: ContextSource): CoinbaseNextRequestOf<'observe'> {
  return { ...requestContext(state), action: 'observe' }
}

function stepResponse(
  state: CoinbaseCheckoutState,
): CoinbaseStepResponse | undefined {
  return state.answer?.action === 'order' ? undefined : state.answer?.response
}

/** The `pay` prompt on screen, with the checkout and geo it priced. */
function payPrompt(state: CoinbaseCheckoutState):
  | {
      response: CoinbasePayNextAction
      checkout: CoinbaseCheckout
      geo: FiatGeo
    }
  | undefined {
  const { answer } = state
  return answer !== undefined && answer.response.next === 'pay'
    ? { response: answer.response, checkout: answer.checkout, geo: answer.geo }
    : undefined
}

/** Whether the `pay` prompt on screen is `orderId`'s, and no payment on it was reported. */
function paysUnreported(
  state: CoinbaseCheckoutState,
  orderId: string,
): boolean {
  return (
    payPrompt(state)?.response.orderId === orderId &&
    !state.reported &&
    state.charge === undefined &&
    state.call === undefined
  )
}

/** A new order for the terms on screen: `observe` mints its id, and the sign-in and consent stand. */
function orderAgain(state: CoinbaseCheckoutState): CoinbaseCheckoutState {
  const { spent: _, failedLink: __, ...unspent } = state
  return {
    ...unspent,
    answer: undefined,
    call: observeCall(state),
    failure: undefined,
  }
}

/**
 * The `pay` prompt's page failed and is spent: no order is placed for it until the buyer taps to pay
 * again, as legacy's pay button after main's payment-failed sheet.
 */
export function coinbasePaysAgainOnTap(state: CoinbaseCheckoutState): boolean {
  const orderId = payPrompt(state)?.response.orderId
  return (
    orderId !== undefined &&
    state.spent === true &&
    state.failedLink === orderId &&
    paysUnreported(state, orderId)
  )
}

/** The state with `terms` in place of its own, a recipient term it lacks dropped. */
function withTerms(
  state: CoinbaseCheckoutState,
  terms: ContextSource,
): CoinbaseCheckoutState {
  const { destinationAsset: _, depositAddress: __, ...kept } = state
  return { ...kept, ...terms }
}

function sameTerms(a: ContextSource, b: ContextSource): boolean {
  const termsOf = (terms: ContextSource) =>
    JSON.stringify([
      terms.checkout,
      terms.geo,
      terms.destinationAsset ?? null,
      terms.depositAddress ?? null,
    ])
  return termsOf(a) === termsOf(b)
}

/** Pure: the Coinbase flow order. `Checkout` sends `call` and feeds back what came of it. */
export function coinbaseCheckoutReducer(
  state: CoinbaseCheckoutState,
  event: CoinbaseCheckoutEvent,
): CoinbaseCheckoutState {
  if (state.exit !== undefined) {
    return state
  }
  switch (event.type) {
    case 'TERMS_ACCEPTED':
      return acceptTerms(state, event)
    case 'STEP':
      return event.call === state.call ? receiveStep(state, event) : state
    case 'ORDER':
      return event.call === state.call ? receiveOrder(state, event) : state
    case 'FAILED':
      return event.call === state.call ? failed(state, event) : state
    case 'RETRY':
      return retry(state, event.at)
    case 'PHONE_SUBMITTED':
      return ready(state, 'session')
        ? {
            ...state,
            call: {
              ...requestContext(state),
              action: 'session',
              phoneNumber: event.phoneNumber,
            },
          }
        : state
    case 'OTP_SUBMITTED': {
      const prompt = otpPrompt(state)
      return prompt !== undefined && state.call === undefined
        ? {
            ...state,
            call: {
              ...requestContext(state),
              action: 'otp',
              verificationRef: prompt.verificationRef,
              otpCode: event.otpCode,
            },
          }
        : state
    }
    case 'OTP_RESEND': {
      const prompt = otpPrompt(state)
      return prompt !== undefined && state.call === undefined
        ? {
            ...state,
            call: {
              ...requestContext(state),
              action: 'session',
              resend: prompt.verificationRef,
            },
          }
        : state
    }
    case 'KYC_SUBMITTED':
      return ready(state, 'kyc')
        ? {
            ...state,
            call: {
              ...requestContext(state),
              action: 'kyc',
              values: event.values,
            },
          }
        : state
    case 'PENDING_ELAPSED':
      return pendingElapsed(state)
    case 'PAYMENT_REPORTED':
      return paymentReported(state)
    case 'PAY_LINK_SPENT':
      return paysUnreported(state, event.orderId)
        ? { ...state, spent: true }
        : state
    case 'PAY_LINK_REDRAWN':
      return state.spent &&
        state.failedLink !== event.orderId &&
        paysUnreported(state, event.orderId)
        ? orderAgain(
            withTerms(state, {
              checkout: event.checkout,
              geo: event.geo,
              ...recipientOf(event),
            }),
          )
        : state
    case 'PAY_LINK_FAILED':
      return paysUnreported(state, event.orderId)
        ? { ...state, failedLink: event.orderId }
        : state
    case 'PAY_AGAIN':
      return coinbasePaysAgainOnTap(state) &&
        payPrompt(state)?.response.orderId === event.orderId
        ? orderAgain(state)
        : state
    case 'AMOUNT_CHANGED':
      return changeAmount(state, {
        checkout: event.checkout,
        geo: event.geo,
        ...recipientOf(event),
      })
    case 'HELD_CALL_RELEASED':
      return state.call?.action === 'observe' && state.answer === undefined
        ? { ...state, call: observeCall(state) }
        : state
    case 'EXIT':
      // A reported payment is never abandoned: its order is read until it ends.
      return state.reported
        ? state
        : { ...state, call: undefined, exit: event.exit }
  }
}

/** Whether the step on screen is `next` and nothing is in flight, so the buyer's input can go. */
function ready(
  state: CoinbaseCheckoutState,
  next: CoinbaseStepResponse['next'],
): boolean {
  return stepResponse(state)?.next === next && state.call === undefined
}

function otpPrompt(
  state: CoinbaseCheckoutState,
): CoinbaseOtpNextAction | undefined {
  const response = stepResponse(state)
  return response?.next === 'otp' ? response : undefined
}

function acceptTerms(
  state: CoinbaseCheckoutState,
  { acceptedAt, locale }: { acceptedAt: string; locale?: string },
): CoinbaseCheckoutState {
  const response = stepResponse(state)
  if (state.call !== undefined || response?.next !== 'consent') {
    return state
  }
  return {
    ...state,
    call: {
      ...requestContext(state),
      action: 'consent',
      acceptances: termsAcceptances(
        localizedTerms(
          coinbaseConsentShown(response.documents).documents,
          locale,
        ),
        acceptedAt,
      ),
    },
  }
}

/** The consent screens, in the order a `consent` prompt's documents are shown and accepted. */
export type CoinbaseConsentKind = 'CONTINUE' | 'KYC_CONSENT'

/**
 * The group of a `consent` prompt the buyer sees now: Coinbase's checkout terms, else the rest
 * (Fun's KYC consent before the limit upgrade). The backend answers `consent` again with the rest.
 */
export function coinbaseConsentShown(documents: readonly TermsDocument[]): {
  kind: CoinbaseConsentKind
  documents: readonly TermsDocument[]
} {
  const checkoutTerms = documents.filter(
    (document) => document.stage === 'CHECKOUT',
  )
  return checkoutTerms.length > 0
    ? { kind: 'CONTINUE', documents: checkoutTerms }
    : { kind: 'KYC_CONSENT', documents }
}

/**
 * Every `next` this client knows, one record per response union, so a contract bump that adds one
 * fails to compile until it is handled here. At runtime an app already shipped can still receive a
 * value from a newer backend, which these sets let it recognise as unknown.
 */
const STEP_NEXTS: Record<CoinbaseStepResponse['next'], true> = {
  consent: true,
  session: true,
  otp: true,
  kyc: true,
  wait: true,
  placeOrder: true,
  pay: true,
  orderPending: true,
  done: true,
  refused: true,
}
const ORDER_NEXTS: Record<CoinbaseOrderResponse['next'], true> = {
  done: true,
  orderPending: true,
}

/** Whether this client knows the answer's `next`: a newer backend may send one it does not. */
export function isKnownCoinbaseNext(
  response: CoinbaseStepResponse | CoinbaseOrderResponse,
  action: CoinbaseCall['action'],
): boolean {
  const known: Record<string, true> =
    action === 'order' ? ORDER_NEXTS : STEP_NEXTS
  return Object.prototype.hasOwnProperty.call(known, response.next)
}

function receiveStep(
  state: CoinbaseCheckoutState,
  {
    call,
    response,
  }: {
    call: Exclude<CoinbaseCall, OrderCall>
    response: CoinbaseStepResponse
  },
): CoinbaseCheckoutState {
  const { checkout, geo } = call
  // A step this app cannot draw: leave for the next provider rather than render nothing. A
  // reported payment is never left, so its order goes on being read.
  if (!isKnownCoinbaseNext(response, call.action)) {
    return state.reported
      ? { ...state, call: undefined }
      : {
          ...state,
          call: undefined,
          failure: undefined,
          exit: { recovery: 'REQUOTE' },
        }
  }
  const { phoneRefused: _, ...unrefused } = state
  const answered: CoinbaseCheckoutState = {
    ...unrefused,
    answer: { action: call.action, response, checkout, geo },
    call: undefined,
    failure: undefined,
  }
  switch (response.next) {
    // The amount changed while this request ran: ask about the new one instead.
    case 'placeOrder':
      if (!sameTerms(call, state)) {
        return { ...answered, answer: undefined, call: observeCall(state) }
      }
      // A `placeOrder` that answers `placeOrder` again would loop: the buyer retries it, under the id
      // this answer minted, since the backend mints a new one when the price moved.
      if (call.action === 'placeOrder') {
        return {
          ...answered,
          failure: {
            call: { ...call, orderId: response.orderId },
            fault: undefined,
          },
        }
      }
      // One tap: the order is placed under the id the answer minted as soon as Coinbase can price it,
      // so its button loads at once.
      return {
        ...answered,
        call: {
          ...requestContext(state),
          action: 'placeOrder',
          orderId: response.orderId,
        },
      }
    case 'pay':
      return sameTerms(call, state)
        ? answered
        : { ...answered, answer: undefined, call: observeCall(state) }
    // A refusal names the amount it was asked about: ask about the new one instead.
    // A refused number can be edited once; a second refused number fails over, as before.
    case 'refused':
      if (
        isPhoneRefusal(state, call, response) &&
        sameTerms(call, state) &&
        state.phoneRefused === undefined
      ) {
        return {
          ...state,
          call: undefined,
          failure: undefined,
          phoneRefused: true,
        }
      }
      return sameTerms(call, state)
        ? {
            ...answered,
            exit: {
              recovery: response.recovery,
              refusal: response.reason,
              ...('maxAmount' in response && response.maxAmount !== null
                ? { maxAmount: response.maxAmount }
                : {}),
            },
          }
        : { ...answered, answer: undefined, call: observeCall(state) }
    // An open order, from `observe` or a retried `placeOrder`: read it, under the checkout it was asked with,
    // until it ends. Not `reported`: no link for it was shown here, so the buyer can still leave or change the amount.
    case 'orderPending':
      // Asked about another amount: nothing here paid that order, so ask about the new one instead.
      if (!sameTerms(call, state)) {
        return { ...answered, answer: undefined, call: observeCall(state) }
      }
      return state.charge === undefined
        ? {
            ...answered,
            charge: {
              ...requestContext(state, call),
              action: 'order',
              orderId: response.orderId,
            },
            chargePolls: 0,
          }
        : answered
    // The limit upgrade, and the KYC consent before it, are chosen from the amount asked about.
    default:
      return sameTerms(call, state)
        ? answered
        : { ...answered, answer: undefined, call: observeCall(state) }
  }
}

/**
 * Coinbase refused the number just sent, as legacy's `PHONE_UNSUPPORTED`, which lets the buyer edit it.
 * The contract has no phone refusal: the backend sends `NOT_ELIGIBLE`/`REQUOTE`, so it is read off the call.
 * ENG-7364 (https://linear.app/funxyz/issue/ENG-7364) moves it to `session` with `error: 'PHONE_REFUSED'`,
 * which also tells it apart from the eligibility gate's same answer.
 */
function isPhoneRefusal(
  state: CoinbaseCheckoutState,
  call: CoinbaseCall,
  response: CoinbaseStepResponse,
): boolean {
  return (
    call.action === 'session' &&
    'phoneNumber' in call &&
    response.next === 'refused' &&
    response.reason === 'NOT_ELIGIBLE' &&
    response.recovery === 'REQUOTE' &&
    stepResponse(state)?.next === 'session'
  )
}

function receiveOrder(
  state: CoinbaseCheckoutState,
  { call, response }: { call: CoinbaseCall; response: CoinbaseOrderResponse },
): CoinbaseCheckoutState {
  // An order answer this app cannot read: keep the order and offer to read it again.
  if (!isKnownCoinbaseNext(response, 'order')) {
    return { ...state, call: undefined, failure: { call, fault: undefined } }
  }
  return {
    ...state,
    answer: {
      action: 'order',
      response,
      checkout: call.checkout,
      geo: call.geo,
    },
    call: undefined,
    failure: undefined,
  }
}

function failed(
  state: CoinbaseCheckoutState,
  { call, fault }: { call: CoinbaseCall; fault: FiatRouteFault | undefined },
): CoinbaseCheckoutState {
  const idle = { ...state, call: undefined }
  // After the payment page reported only the same `order` may go again: a new quote could charge twice.
  if (call.action === 'order') {
    // An order a step answered and nothing here paid: no one to send to support, so it ends.
    return fault?.recovery === 'NONE' && !state.reported
      ? { ...idle, exit: { recovery: 'NONE' } }
      : { ...idle, failure: { call, fault } }
  }
  const recovery = fault?.recovery ?? 'RETRY'
  // A refused acceptance is a client bug: the generic error, and no retry loop.
  return recovery === 'RETRY' ||
    (call.action === 'consent' && termsRefused(fault))
    ? { ...idle, failure: { call, fault } }
    : { ...idle, exit: { recovery } }
}

/** The failed request again. The retry tap is a new acceptance, so a `consent` carries its time. */
function retry(
  state: CoinbaseCheckoutState,
  at: string,
): CoinbaseCheckoutState {
  if (state.failure === undefined || state.call !== undefined) {
    return state
  }
  const { call } = state.failure
  return {
    ...state,
    call:
      call.action === 'consent'
        ? {
            ...call,
            acceptances: call.acceptances.map((acceptance) => ({
              ...acceptance,
              acceptedAt: at,
            })),
          }
        : { ...call },
    failure: undefined,
    ...(call.action === 'order' ? { chargePolls: 0 } : {}),
  }
}

/** `consent` refused the body itself (a version, a digest): sending it again cannot help. */
function termsRefused(fault: FiatRouteFault | undefined): boolean {
  return fault?.reason === 'INVALID_REQUEST'
}

function pendingElapsed(state: CoinbaseCheckoutState): CoinbaseCheckoutState {
  if (state.call !== undefined) {
    return state
  }
  // A failed read of a reported payment's order goes again within the same cap, as legacy's poll goes on through errors.
  if (state.failure !== undefined) {
    return coinbaseReadsOrderAgain(state) ? readOrderAgain(state) : state
  }
  const response = state.answer?.response
  // An order that offers its delivery is handed over, and the flow follows it from here.
  if (
    response?.next === 'orderPending' &&
    offersDeliveryTransition(response.order)
  ) {
    return state
  }
  // The open order is read again, a bounded number of times.
  if (response?.next === 'orderPending' && state.charge !== undefined) {
    if ((state.chargePolls ?? 0) >= COINBASE_MAX_ORDER_POLLS) {
      return { ...state, failure: { call: state.charge, fault: undefined } }
    }
    return readOrderAgain(state)
  }
  return response?.next === 'wait'
    ? { ...state, call: observeCall(state) }
    : state
}

function readOrderAgain(state: CoinbaseCheckoutState): CoinbaseCheckoutState {
  return state.charge === undefined
    ? state
    : {
        ...state,
        chargePolls: (state.chargePolls ?? 0) + 1,
        call: { ...state.charge },
        failure: undefined,
      }
}

/** Whether a reported payment's failed order read is read again: anything but a refusal, until the cap. */
export function coinbaseReadsOrderAgain(state: CoinbaseCheckoutState): boolean {
  const { failure } = state
  return (
    state.reported === true &&
    failure !== undefined &&
    failure.call.action === 'order' &&
    state.charge !== undefined &&
    failure.fault?.recovery !== 'NONE' &&
    (state.chargePolls ?? 0) < COINBASE_MAX_ORDER_POLLS
  )
}

/** The order on the `pay` prompt is read from here on, with the checkout its link was created for. */
function paymentReported(state: CoinbaseCheckoutState): CoinbaseCheckoutState {
  const prompt = payPrompt(state)
  if (
    prompt === undefined ||
    state.charge !== undefined ||
    state.call !== undefined
  ) {
    return state
  }
  const charge: OrderCall = {
    ...requestContext(state, prompt),
    action: 'order',
    orderId: prompt.response.orderId,
  }
  return {
    ...state,
    charge,
    chargePolls: 0,
    reported: true,
    call: charge,
    failure: undefined,
  }
}

/**
 * A new amount, geo or recipient: asked about at once unless a request is in flight, which re-asks when it
 * lands. Once the payment page reported, the order keeps its amount and recipient. An open order a step answered
 * is left unread: its pending read is replaced, so its answer is dropped. A spent link waits for its page to be
 * drawn again.
 */
function changeAmount(
  state: CoinbaseCheckoutState,
  terms: ContextSource,
): CoinbaseCheckoutState {
  if (state.reported || sameTerms(terms, state)) {
    return state
  }
  const changed = withTerms(state, terms)
  if (state.spent) {
    return changed
  }
  if (state.charge !== undefined) {
    const { charge: _, chargePolls: __, ...unread } = changed
    return {
      ...unread,
      answer: undefined,
      call: observeCall(changed),
      failure: undefined,
    }
  }
  return state.call === undefined
    ? {
        ...changed,
        answer: undefined,
        call: observeCall(changed),
        failure: undefined,
      }
    : changed
}

/** What the checkout shows. Derived from the state alone. */
export type CoinbaseStage =
  | {
      kind: 'CONSENT'
      consent: CoinbaseConsentKind
      documents: readonly TermsDocument[]
      accepting: boolean
    }
  | {
      kind: 'PHONE'
      error: 'CODE_EXPIRED' | 'PHONE_REFUSED' | null
      submitting: boolean
    }
  | {
      kind: 'OTP'
      response: CoinbaseOtpNextAction
      /** A code or a resend is on its way. */
      submitting: boolean
    }
  | { kind: 'KYC'; response: CoinbaseKycNextAction; submitting: boolean }
  | { kind: 'REVIEW' }
  /** Coinbase priced the checkout; its order is being placed. */
  | { kind: 'PRICED'; price: CoinbasePrice }
  /** Coinbase's own Apple Pay button, from its single-use link. */
  | { kind: 'PAY'; response: CoinbasePayNextAction }
  | { kind: 'LOADING' }
  /**
   * `reason`: the fault's, which the retry screen words; absent when no fault body came back.
   * `retryAfterSeconds`: a 429's wait before the retry may go.
   */
  | {
      kind: 'RETRY'
      call: CoinbaseCall
      reason: CoinbaseFaultReason | undefined
      retryAfterSeconds?: number
    }
  | { kind: 'ERROR' }
  /** `gaveUp`: a reported payment's order reads hit their cap, and nothing reads it again. */
  | { kind: 'CONFIRMING'; gaveUp: boolean }
  | { kind: 'SUPPORT' }
  | { kind: 'DONE'; order: FiatStepResponse }
  | { kind: 'EXITED' }

export function coinbaseStage(state: CoinbaseCheckoutState): CoinbaseStage {
  if (state.exit !== undefined) {
    return { kind: 'EXITED' }
  }
  const { failure } = state
  if (failure !== undefined && failure.call.action === 'order') {
    // Support only for a payment this checkout reported; an unreported order exits in `failed`.
    if (failure.fault?.recovery === 'NONE' && state.reported) {
      return { kind: 'SUPPORT' }
    }
    // Only a reported payment keeps the buyer on its order; an unpaid one can be retried or left.
    return state.reported
      ? { kind: 'CONFIRMING', gaveUp: !coinbaseReadsOrderAgain(state) }
      : {
          kind: 'RETRY',
          call: failure.call,
          reason: coinbaseFaultReason(failure.fault),
        }
  }
  if (failure !== undefined) {
    return failure.call.action === 'consent' && termsRefused(failure.fault)
      ? { kind: 'ERROR' }
      : {
          kind: 'RETRY',
          call: failure.call,
          reason: coinbaseFaultReason(failure.fault),
          ...(failure.fault?.retryAfterSeconds === undefined
            ? {}
            : { retryAfterSeconds: failure.fault.retryAfterSeconds }),
        }
  }
  if (state.charge !== undefined) {
    return state.answer?.action === 'order' &&
      state.answer.response.next === 'done'
      ? { kind: 'DONE', order: state.answer.response.order }
      : openOrderStage(state.answer?.response)
  }
  const inFlight = state.call !== undefined
  const response = state.answer?.response
  if (response === undefined) {
    return { kind: 'LOADING' }
  }
  switch (response.next) {
    case 'consent':
      return {
        kind: 'CONSENT',
        consent: coinbaseConsentShown(response.documents).kind,
        documents: coinbaseConsentShown(response.documents).documents,
        accepting: inFlight,
      }
    case 'session':
      return {
        kind: 'PHONE',
        error: state.phoneRefused ? 'PHONE_REFUSED' : response.error,
        submitting: inFlight,
      }
    case 'otp':
      return { kind: 'OTP', response, submitting: inFlight }
    case 'kyc':
      return { kind: 'KYC', response, submitting: inFlight }
    case 'wait':
      return { kind: 'REVIEW' }
    case 'placeOrder':
      return { kind: 'PRICED', price: response.price }
    case 'pay':
      return { kind: 'PAY', response }
    // An order this checkout did not report on: placed elsewhere for this quote, or reloaded.
    case 'orderPending':
      return openOrderStage(response)
    case 'done':
      return { kind: 'DONE', order: response.order }
    case 'refused':
      return { kind: 'EXITED' }
  }
}

/**
 * An open order's stage: handed over once it offers the `delivery` transition, which the flow
 * follows from here; confirming until then.
 */
function openOrderStage(
  response: CoinbaseStepResponse | CoinbaseOrderResponse | undefined,
): CoinbaseStage {
  return response?.next === 'orderPending' &&
    offersDeliveryTransition(response.order)
    ? { kind: 'DONE', order: response.order }
    : { kind: 'CONFIRMING', gaveUp: false }
}
