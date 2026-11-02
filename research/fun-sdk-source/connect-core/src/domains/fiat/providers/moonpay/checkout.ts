import type {
  MoonPayCaptureNextAction,
  MoonPayCheckout,
  MoonPayFaultReason,
  MoonPayKycNextAction,
  MoonPayOrderNextAction,
  MoonPayOrderResponse,
  MoonPayQuoteInput,
  MoonPayReask,
  MoonPayReaskReason,
  MoonPaySdkCredentials,
  MoonPayStepRefusal,
  MoonPayStepResponse,
} from '@fun-xyz/fiat-contract/moonpay'
import type { TermsDocument } from '@fun-xyz/fiat-contract/terms'
import type {
  DestinationAsset,
  FiatGeo,
  FiatStepResponse,
  KycFieldId,
  KycSdkResultReport,
} from '@fun-xyz/fiat-contract/types'

import { offersDeliveryTransition } from '~/domains/fiat/deliveryTransition'
import type { FiatRouteFault } from '~/domains/fiat/fiatRoute'
import { localizedTerms, termsAcceptances } from '~/domains/fiat/terms'
import {
  type MoonPayNextBody,
  type MoonPayNextRequestOf,
  moonPayFaultReason,
} from './api'
import {
  type MoonPayDeviceQuote,
  type PricedDeviceQuote,
  sameQuoteInput,
} from './revealGate'

/** A `POST /fiat/next` body the checkout sends. A retry sends the same body again. */
export type MoonPayCall = MoonPayNextBody

type OrderCall = MoonPayNextRequestOf<'order'>

/** How long a charge's `order` waits to ask again while MoonPay does not list the transaction. */
export const MOONPAY_ORDER_POLL_MS = 2_000
/**
 * Automatic reads are bounded, failed reads included. After the last one the wait gives up as legacy's
 * poll does past its deadline: the sheet can close, and nothing reads the order again.
 */
export const MOONPAY_MAX_ORDER_POLLS = 30

/**
 * The recipient, sent as `depositAddress`, and the asset the buyer receives, sent as
 * `destinationAsset`, so the backend converts MoonPay's payout into it. Only a Fun login sends
 * `depositAddress`: a host with a minter names its recipient in its assertion. Either sends
 * `destinationAsset` when its quotes carry one.
 */
export interface MoonPayRecipientTerms {
  depositAddress?: string
  destinationAsset?: DestinationAsset
}

/**
 * The order a charge pays, with the checkout, geo and recipient its Apple Pay button priced: the
 * backend checks the charge against the wallet that order was quoted for.
 */
export interface MoonPayChargedOrder extends MoonPayRecipientTerms {
  orderId: string
  checkout: MoonPayCheckout
  geo: FiatGeo
}

/** What a request is asked about: the checkout, the geo, and a Fun login's recipient terms. */
type AskedTerms = Pick<MoonPayChargedOrder, 'checkout' | 'geo'> &
  MoonPayRecipientTerms

function recipientOf({
  depositAddress,
  destinationAsset,
}: MoonPayRecipientTerms): MoonPayRecipientTerms {
  return {
    ...(depositAddress === undefined ? {} : { depositAddress }),
    ...(destinationAsset === undefined ? {} : { destinationAsset }),
  }
}

function termsOf(terms: AskedTerms): AskedTerms {
  return { checkout: terms.checkout, geo: terms.geo, ...recipientOf(terms) }
}

function recipientKey(terms: MoonPayRecipientTerms): string {
  return JSON.stringify([
    terms.depositAddress ?? null,
    terms.destinationAsset ?? null,
  ])
}

function sameTerms(a: AskedTerms, b: AskedTerms): boolean {
  return (
    JSON.stringify([a.checkout, a.geo]) ===
      JSON.stringify([b.checkout, b.geo]) && recipientKey(a) === recipientKey(b)
  )
}

/** The last backend answer, exactly as it came, with the checkout, geo and recipient its request carried. */
export type MoonPayAnswer =
  | ({
      action: Exclude<MoonPayCall['action'], 'order'>
      response: MoonPayStepResponse
      checkout: MoonPayCheckout
      geo: FiatGeo
    } & MoonPayRecipientTerms)
  | ({
      action: 'order'
      response: MoonPayOrderResponse
      checkout: MoonPayCheckout
      geo: FiatGeo
    } & MoonPayRecipientTerms)

export type MoonPayCheckoutExit =
  | { recovery: 'REQUOTE' | 'RETRY' | 'NONE'; refusal?: MoonPayStepRefusal }
  | { cancelled: true }

export interface MoonPayCheckoutState {
  /** Sent on every request. */
  checkout: MoonPayCheckout
  /** Sent as every request's top-level `geo`. */
  geo: FiatGeo
  /** Fun login only: the recipient every request names as `depositAddress`, except a charge's. */
  depositAddress?: string
  /**
   * The asset the buyer receives, named on the same requests; `checkout.destination` stays what
   * MoonPay delivers. Absent where the flow's quotes carry none.
   */
  destinationAsset?: DestinationAsset
  /** MoonPay's `CHECKOUT` documents, disclosed on every screen that prices. */
  checkoutDocuments: readonly TermsDocument[]
  answer?: MoonPayAnswer
  /** From the last `connect` prompt, with the checkout and recipient it was minted for. */
  session?: {
    sessionToken: string
    quoteInput: MoonPayQuoteInput
    checkout: MoonPayCheckout
  } & MoonPayRecipientTerms
  /** From the SDK connection check on that session; sent on every request after `connect`. */
  credentials?: MoonPaySdkCredentials
  /** A `connect` prompt asked for a connection reset; a second one means the buyer's own sign-in is another login's. */
  connectionReset?: true
  deviceQuote?: PricedDeviceQuote
  /** The request in flight. */
  call?: MoonPayCall
  /** From the Apple Pay tap until the sheet ends: the order it charges, and the checkout it priced. */
  paying?: MoonPayChargedOrder
  /** The charge's `order`, sent again until the order settles. */
  charge?: OrderCall
  chargePolls?: number
  /** The last failed charge's `order`: a best-effort report the buyer never waits on. */
  failedCharge?: OrderCall
  /** A request that failed with `RETRY`; `RETRY` sends it again. */
  failure?: { call: MoonPayCall; fault: FiatRouteFault | undefined }
  exit?: MoonPayCheckoutExit
}

export type MoonPayCheckoutEvent =
  /** Continue on the documents a `consent` prompt showed. */
  | { type: 'TERMS_ACCEPTED'; acceptedAt: string; locale?: string }
  | {
      type: 'STEP'
      call: Exclude<MoonPayCall, OrderCall>
      response: MoonPayStepResponse
    }
  | { type: 'ORDER'; call: MoonPayCall; response: MoonPayOrderResponse }
  | { type: 'FAILED'; call: MoonPayCall; fault: FiatRouteFault | undefined }
  /** The buyer's tap on a failed request; `at` is the tap time, a `consent`'s new `acceptedAt`. */
  | { type: 'RETRY'; at: string }
  | {
      type: 'CONNECTED'
      sessionToken: string
      credentials: MoonPaySdkCredentials
    }
  | {
      type: 'DEVICE_QUOTE'
      input: MoonPayQuoteInput
      quote: MoonPayDeviceQuote
    }
  /** The device quote can no longer be paid (a declined sheet, an ended challenge): price again. */
  | { type: 'DEVICE_QUOTE_SPENT' }
  /** The amount, the geo, or a Fun login's recipient terms changed. */
  | ({
      type: 'AMOUNT_CHANGED'
      checkout: MoonPayCheckout
      geo: FiatGeo
    } & MoonPayRecipientTerms)
  /** Back from the background: ask again before the tap. */
  | { type: 'REFRESH' }
  /** MoonPay no longer honours the session: drop its credentials and mint a new one. */
  | { type: 'NEW_SESSION' }
  | { type: 'PENDING_ELAPSED' }
  | { type: 'KYC_SUBMITTED'; values: Partial<Record<KycFieldId, string>> }
  /** The Sumsub SDK closed on a `capture` prompt; its result is a report only. */
  | { type: 'CAPTURE_CLOSED'; result: KycSdkResultReport }
  /** The buyer tapped Apple Pay; the sheet can charge from here on. */
  | { type: 'PAY_STARTED' }
  /** The sheet ended with no charge. */
  | { type: 'PAY_ENDED' }
  /** `order` names the order a challenge was opened for; else the open sheet's, or the `order` prompt's. */
  | { type: 'PAID'; transactionId: string; order?: MoonPayChargedOrder }
  /** A charge MoonPay completed as failed. `order` as for `PAID`. */
  | {
      type: 'CHARGE_FAILED'
      transactionId?: string
      order?: MoonPayChargedOrder
    }
  | { type: 'EXIT'; exit: MoonPayCheckoutExit }

/** Every checkout starts on `observe`: Continue shows only when it answers `consent`. */
export function moonPayCheckoutStart(
  checkout: MoonPayCheckout,
  geo: FiatGeo,
  checkoutDocuments: readonly TermsDocument[],
  /** A host with a minter names its recipient in its assertion, so sends only `destinationAsset`. */
  recipient: MoonPayRecipientTerms = {},
): MoonPayCheckoutState {
  const state = {
    ...termsOf({ checkout, geo, ...recipient }),
    checkoutDocuments,
  }
  return { ...state, call: observeCall(state) }
}

/** What every request carries besides its action's result; a charge's `order` names its priced terms. */
function requestContext(
  state: AskedTerms & Pick<MoonPayCheckoutState, 'credentials'>,
  priced: AskedTerms = state,
) {
  return {
    provider: 'MOONPAY' as const,
    ...termsOf(priced),
    ...(state.credentials === undefined
      ? {}
      : { credentials: state.credentials }),
  }
}

function observeCall(
  state: AskedTerms & Pick<MoonPayCheckoutState, 'credentials'>,
): MoonPayNextRequestOf<'observe'> {
  return { ...requestContext(state), action: 'observe' }
}

/** An `observe` sent beside the reducer: a `capture` prompt answers it with a fresh token. */
export function moonPayObserveCall(
  state: MoonPayCheckoutState,
): MoonPayNextRequestOf<'observe'> {
  return observeCall(state)
}

const REASK_REASONS: readonly MoonPayReaskReason[] = [
  'EXPIRED',
  'POOR_QUALITY',
  'MISMATCH',
  'REJECTED',
]

/** Why a re-ask asks again; a code this build does not know reads as no code. */
export function reaskReason(
  reask: MoonPayReask | null,
): MoonPayReaskReason | null {
  const reason = reask?.reason
  return REASK_REASONS.find((known) => known === reason) ?? null
}

function stepResponse(
  state: MoonPayCheckoutState,
): MoonPayStepResponse | undefined {
  return state.answer?.action === 'order' ? undefined : state.answer?.response
}

/**
 * The `order` prompt on screen, from a step or from a declined charge's `order`, with the checkout,
 * geo and recipient it priced.
 */
function orderPrompt(
  state: MoonPayCheckoutState,
): (AskedTerms & { response: MoonPayOrderNextAction }) | undefined {
  const { answer } = state
  if (answer === undefined || answer.response.next !== 'order') {
    return undefined
  }
  return { response: answer.response, ...termsOf(answer) }
}

/**
 * The parameters the device quote should price now: the `order` prompt's, or the session's while
 * `connect` runs beside it.
 */
export function wantedQuoteInput(
  state: MoonPayCheckoutState,
): MoonPayQuoteInput | undefined {
  if (state.exit !== undefined || state.charge !== undefined) {
    return undefined
  }
  const prompt = orderPrompt(state)
  if (prompt !== undefined) {
    return prompt.response.quoteInput
  }
  const response = stepResponse(state)
  return response?.next === 'connect' &&
    state.credentials !== undefined &&
    state.session?.checkout === state.checkout &&
    recipientKey(state.session) === recipientKey(state)
    ? state.session.quoteInput
    : undefined
}

/** Pure: the MoonPay flow order. `Checkout` sends `call` and feeds back what came of it. */
export function moonPayCheckoutReducer(
  state: MoonPayCheckoutState,
  event: MoonPayCheckoutEvent,
): MoonPayCheckoutState {
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
    case 'CONNECTED':
      return state.session?.sessionToken === event.sessionToken &&
        state.credentials === undefined
        ? {
            ...state,
            credentials: event.credentials,
            call: {
              ...requestContext(state),
              action: 'connect',
              customerId: event.credentials.customerId,
              accessToken: event.credentials.accessToken,
            },
          }
        : state
    case 'DEVICE_QUOTE': {
      const wanted = wantedQuoteInput(state)
      return wanted !== undefined && sameQuoteInput(wanted, event.input)
        ? { ...state, deviceQuote: { input: event.input, quote: event.quote } }
        : state
    }
    case 'DEVICE_QUOTE_SPENT':
      return { ...state, deviceQuote: undefined }
    case 'AMOUNT_CHANGED':
      return changeAmount(state, event)
    case 'REFRESH':
      return orderPrompt(state) !== undefined &&
        state.call === undefined &&
        state.paying === undefined &&
        state.charge === undefined
        ? {
            ...state,
            answer: undefined,
            call: observeCall(state),
            failure: undefined,
          }
        : state
    case 'NEW_SESSION':
      return state.paying === undefined && state.charge === undefined
        ? {
            ...state,
            answer: undefined,
            session: undefined,
            credentials: undefined,
            deviceQuote: undefined,
            call: observeCall({ ...state, credentials: undefined }),
            failure: undefined,
          }
        : state
    case 'PENDING_ELAPSED':
      return pendingElapsed(state)
    case 'KYC_SUBMITTED':
      return stepResponse(state)?.next === 'kyc' &&
        state.call === undefined &&
        state.credentials !== undefined
        ? {
            ...state,
            call: {
              ...requestContext(state),
              action: 'kyc',
              credentials: state.credentials,
              values: event.values,
            },
          }
        : state
    case 'CAPTURE_CLOSED':
      return stepResponse(state)?.next === 'capture' &&
        state.call === undefined &&
        state.credentials !== undefined
        ? {
            ...state,
            call: {
              ...requestContext(state),
              action: 'capture',
              credentials: state.credentials,
              result: event.result,
            },
          }
        : state
    case 'PAY_STARTED': {
      const paying = readyOrder(state)
      return paying !== undefined &&
        state.call === undefined &&
        state.charge === undefined
        ? { ...state, paying }
        : state
    }
    case 'PAY_ENDED':
      return payEnded(state)
    case 'PAID':
      return paid(state, event.transactionId, event.order)
    case 'CHARGE_FAILED':
      return chargeFailed(state, event.transactionId, event.order)
    case 'EXIT':
      // A recorded charge is never abandoned: its order goes until it settles. Nor is an open
      // sheet's: a `PAID` it reports after an exit would be dropped, and its charge never recorded.
      return state.charge === undefined && state.paying === undefined
        ? { ...state, call: undefined, exit: event.exit }
        : state
  }
}

function acceptTerms(
  state: MoonPayCheckoutState,
  { acceptedAt, locale }: { acceptedAt: string; locale?: string },
): MoonPayCheckoutState {
  if (state.call !== undefined) {
    return state
  }
  const response = stepResponse(state)
  return response?.next === 'consent'
    ? {
        ...state,
        call: {
          ...requestContext(state),
          action: 'consent',
          acceptances: termsAcceptances(
            localizedTerms(consentShown(response.documents).documents, locale),
            acceptedAt,
          ),
        },
      }
    : state
}

/** The consent screens, in the order a `consent` prompt's documents are shown and accepted. */
export type MoonPayConsentKind = 'CONTINUE' | 'KYC_CONSENT' | 'SHARING_CONSENT'

/**
 * The group of a `consent` prompt the buyer sees now: MoonPay's checkout terms, else Fun's KYC
 * consent, else the provider's sharing disclosure. The backend answers `consent` again with the rest.
 */
export function consentShown(documents: readonly TermsDocument[]): {
  kind: MoonPayConsentKind
  documents: readonly TermsDocument[]
} {
  const checkoutTerms = documents.filter(
    (document) => document.stage === 'CHECKOUT',
  )
  if (checkoutTerms.length > 0) {
    return { kind: 'CONTINUE', documents: checkoutTerms }
  }
  const funKycConsent = documents.filter(
    (document) => document.kind === 'FUN_KYC_COLLECTION',
  )
  if (funKycConsent.length > 0) {
    return { kind: 'KYC_CONSENT', documents: funKycConsent }
  }
  return { kind: 'SHARING_CONSENT', documents }
}

/**
 * Every `next` this client knows, one record per response union, so a contract bump that adds one
 * fails to compile until it is handled here. At runtime an app already shipped can still receive a
 * value from a newer backend, which these sets let it recognise as unknown.
 */
const STEP_NEXTS: Record<MoonPayStepResponse['next'], true> = {
  consent: true,
  session: true,
  connect: true,
  kyc: true,
  prepareCapture: true,
  capture: true,
  wait: true,
  order: true,
  refused: true,
}
const ORDER_NEXTS: Record<MoonPayOrderResponse['next'], true> = {
  done: true,
  order: true,
  orderPending: true,
  refused: true,
}

/** Whether this client knows the answer's `next`: a newer backend may send one it does not. */
export function isKnownMoonPayNext(
  response: MoonPayStepResponse | MoonPayOrderResponse,
  action: MoonPayCall['action'],
): boolean {
  const known: Record<string, true> =
    action === 'order' ? ORDER_NEXTS : STEP_NEXTS
  return Object.prototype.hasOwnProperty.call(known, response.next)
}

function receiveStep(
  state: MoonPayCheckoutState,
  {
    call,
    response,
  }: { call: Exclude<MoonPayCall, OrderCall>; response: MoonPayStepResponse },
): MoonPayCheckoutState {
  const { checkout } = call
  // A step this app cannot draw: leave for the next provider rather than render nothing. A
  // recorded charge is never left, so its order goes on being read.
  if (!isKnownMoonPayNext(response, call.action)) {
    return state.charge === undefined
      ? {
          ...state,
          call: undefined,
          failure: undefined,
          deviceQuote: undefined,
          exit: { recovery: 'REQUOTE' },
        }
      : { ...state, call: undefined }
  }
  const answered: MoonPayCheckoutState = {
    ...state,
    answer: { action: call.action, response, ...termsOf(call) },
    call: undefined,
    failure: undefined,
  }
  const automatic =
    response.next === 'session' ||
    response.next === 'prepareCapture' ||
    (response.next === 'kyc' && response.fields.length === 0)
  if (automatic && state.answer?.response.next === response.next) {
    return {
      ...answered,
      deviceQuote: undefined,
      failure: { call, fault: undefined },
    }
  }
  switch (response.next) {
    // The buyer types nothing for `session`: it is sent at once.
    case 'session':
      return {
        ...answered,
        deviceQuote: undefined,
        call: { ...requestContext(state), action: 'session' },
      }
    // Sumsub's applicant is moved before capture; the buyer types nothing.
    case 'prepareCapture':
      return {
        ...answered,
        deviceQuote: undefined,
        call:
          state.credentials === undefined
            ? observeCall(state)
            : {
                ...requestContext(state),
                action: 'prepareCapture',
                credentials: state.credentials,
              },
      }
    // Nothing for the buyer to type: the backend shares what it already holds.
    case 'kyc':
      if (response.fields.length > 0) {
        return { ...answered, deviceQuote: undefined }
      }
      return {
        ...answered,
        deviceQuote: undefined,
        call:
          state.credentials === undefined
            ? observeCall(state)
            : {
                ...requestContext(state),
                action: 'kyc',
                credentials: state.credentials,
                values: {},
              },
      }
    case 'connect':
      if (response.resetConnection && state.connectionReset) {
        return {
          ...answered,
          exit: { recovery: 'NONE', refusal: 'CUSTOMER_MISMATCH' },
        }
      }
      return {
        ...answered,
        ...(response.resetConnection ? { connectionReset: true } : {}),
        session: {
          sessionToken: response.sessionToken,
          quoteInput: response.quoteInput,
          checkout,
          ...recipientOf(call),
        },
        credentials: undefined,
        deviceQuote: undefined,
      }
    case 'order':
      // The amount, geo or recipient changed while `connect` or `kyc` ran: price the new one, not this prompt.
      if (state.credentials !== undefined && !sameTerms(call, state)) {
        return {
          ...answered,
          answer: undefined,
          deviceQuote: undefined,
          call: observeCall(state),
        }
      }
      return state.deviceQuote !== undefined &&
        sameQuoteInput(state.deviceQuote.input, response.quoteInput)
        ? answered
        : { ...answered, deviceQuote: undefined }
    // The server's recovery stands: a NOT_ELIGIBLE `REQUOTE` before sign-in fails over to the next
    // provider, which the amount screen excludes MoonPay from for the visit.
    case 'refused':
      // An `observe` that outlived a change of terms refused the old ones: ask about the new ones.
      if (!sameTerms(call, state)) {
        return { ...answered, answer: undefined, call: observeCall(state) }
      }
      return {
        ...answered,
        exit: { recovery: response.recovery, refusal: response.reason },
      }
    default:
      return { ...answered, deviceQuote: undefined }
  }
}

/**
 * A charge's answer. `order` names a new order: the card was declined and nothing was recorded, so
 * the buyer pays again under it.
 */
function receiveOrder(
  state: MoonPayCheckoutState,
  { call, response }: { call: MoonPayCall; response: MoonPayOrderResponse },
): MoonPayCheckoutState {
  // An order answer this app cannot read: keep the charge and offer to read it again.
  if (!isKnownMoonPayNext(response, 'order')) {
    return { ...state, call: undefined, failure: { call, fault: undefined } }
  }
  const answered: MoonPayCheckoutState = {
    ...state,
    answer: { action: 'order', response, ...termsOf(call) },
    call: undefined,
    failure: undefined,
  }
  if (response.next !== 'order') {
    return answered
  }
  const declined = {
    ...answered,
    charge: undefined,
    paying: undefined,
    deviceQuote: undefined,
  }
  // Terms changed while the charge was checked: the new order would pay the old ones, so ask anew.
  return sameTerms(call, state)
    ? declined
    : { ...declined, answer: undefined, call: observeCall(declined) }
}

function failed(
  state: MoonPayCheckoutState,
  { call, fault }: { call: MoonPayCall; fault: FiatRouteFault | undefined },
): MoonPayCheckoutState {
  const idle = { ...state, call: undefined }
  // After the charge only the same `order` may go again: a new quote could charge twice.
  if (call.action === 'order') {
    return { ...idle, failure: { call, fault } }
  }
  const recovery = fault?.recovery ?? 'RETRY'
  // A refused acceptance is a client bug: the generic error, and no retry loop.
  return recovery === 'RETRY' ||
    (call.action === 'consent' && termsRefused(fault))
    ? { ...idle, failure: { call, fault } }
    : { ...idle, exit: { recovery } }
}

/** The failed request again. The retry tap is a new acceptance, so a `consent` carries its time. */
function retry(state: MoonPayCheckoutState, at: string): MoonPayCheckoutState {
  if (state.failure === undefined) {
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

/** `consent` refused the body itself (a version, a digest, the body): sending it again cannot help. */
function termsRefused(fault: FiatRouteFault | undefined): boolean {
  return fault?.reason === 'INVALID_REQUEST'
}

/**
 * The checkout outlives an amount, geo or recipient change: with credentials in hand, the new
 * terms are asked about with them, so nothing is minted. An `observe` still minting is left to
 * finish. The recipient is a term like the amount: MoonPay's quote names its wallet.
 */
function changeAmount(
  state: MoonPayCheckoutState,
  terms: AskedTerms,
): MoonPayCheckoutState {
  if (sameTerms(terms, state)) {
    return state
  }
  const changed = {
    ...state,
    checkout: terms.checkout,
    geo: terms.geo,
    depositAddress: terms.depositAddress,
    destinationAsset: terms.destinationAsset,
  }
  // The open sheet or the charge keeps its order; the new terms are held until the sheet ends or
  // the card is declined. A charge that succeeds pays the terms it was priced for.
  if (state.paying !== undefined || state.charge !== undefined) {
    return changed
  }
  const asking =
    state.credentials !== undefined &&
    (state.call?.action === 'observe' ||
      (state.call === undefined &&
        (orderPrompt(state) !== undefined ||
          state.failure?.call.action === 'observe')))
  return asking
    ? {
        ...changed,
        answer: undefined,
        deviceQuote: undefined,
        call: observeCall(changed),
        failure: undefined,
      }
    : changed
}

function pendingElapsed(state: MoonPayCheckoutState): MoonPayCheckoutState {
  if (state.call !== undefined) {
    return state
  }
  // A failed read of the charge's order goes again within the same cap, as legacy's poll goes on through errors.
  if (state.failure !== undefined) {
    return moonPayReadsOrderAgain(state) ? readOrderAgain(state) : state
  }
  // The charge's order is not terminal yet: the same `order` reads MoonPay again, unless the
  // order offers its delivery, which the flow follows from here.
  if (state.answer?.action === 'order') {
    if (
      state.answer.response.next !== 'orderPending' ||
      state.charge === undefined ||
      offersDeliveryTransition(state.answer.response.order)
    ) {
      return state
    }
    if ((state.chargePolls ?? 0) >= MOONPAY_MAX_ORDER_POLLS) {
      return { ...state, failure: { call: state.charge, fault: undefined } }
    }
    return readOrderAgain(state)
  }
  // A `kyc` that answered `wait` has done its write: the wait ends in `observe`.
  return state.answer?.response.next === 'wait'
    ? { ...state, call: observeCall(state) }
    : state
}

function readOrderAgain(state: MoonPayCheckoutState): MoonPayCheckoutState {
  return state.charge === undefined
    ? state
    : {
        ...state,
        chargePolls: (state.chargePolls ?? 0) + 1,
        call: { ...state.charge },
        failure: undefined,
      }
}

/** Whether the backend has answered the charge's `order` with `orderPending`, with or without its row. */
function orderAnswered(state: MoonPayCheckoutState): boolean {
  return (
    state.charge !== undefined &&
    state.answer?.action === 'order' &&
    state.answer.response.next === 'orderPending'
  )
}

/**
 * Whether the backend has answered the charge's `order` with its order row: from then on MoonPay's
 * webhook can settle it, and before then only this checkout's request can record the charge. An
 * `orderPending` with `order: null` (a charge MoonPay has not listed or priced yet) has no row.
 */
function chargeRecorded(state: MoonPayCheckoutState): boolean {
  return (
    state.charge !== undefined &&
    state.answer?.action === 'order' &&
    state.answer.response.next === 'orderPending' &&
    state.answer.response.order !== null
  )
}

/**
 * Whether the charge's failed order read is read again: anything but a refusal, until the cap. Only
 * once `order` has answered `orderPending` (row or not, as MoonPay's list can lag), as legacy's poll
 * goes on through errors; a charge whose first `order` failed waits for the buyer's Try again, as
 * legacy's failed order call does. At the cap only a recorded order gives up.
 */
export function moonPayReadsOrderAgain(state: MoonPayCheckoutState): boolean {
  const { failure } = state
  return (
    failure !== undefined &&
    failure.call.action === 'order' &&
    orderAnswered(state) &&
    failure.fault?.recovery !== 'NONE' &&
    (state.chargePolls ?? 0) < MOONPAY_MAX_ORDER_POLLS
  )
}

function payEnded(state: MoonPayCheckoutState): MoonPayCheckoutState {
  if (state.paying === undefined) {
    return state
  }
  const ended = { ...state, paying: undefined }
  if (sameTerms(state.paying, state)) {
    return ended
  }
  const { checkout, geo, depositAddress, destinationAsset } = state.paying
  return changeAmount(
    { ...ended, checkout, geo, depositAddress, destinationAsset },
    state,
  )
}

/** The `order` prompt on screen's order, priced at the checkout it answered. */
function readyOrder(
  state: MoonPayCheckoutState,
): MoonPayChargedOrder | undefined {
  const prompt = orderPrompt(state)
  return prompt === undefined
    ? undefined
    : { orderId: prompt.response.orderId, ...termsOf(prompt) }
}

/** The `order` request for a charge on `order`, with the checkout and geo its button priced. */
function orderCall(
  state: MoonPayCheckoutState,
  order: MoonPayChargedOrder,
  transactionId: string | undefined,
): OrderCall {
  return {
    ...requestContext(state, order),
    action: 'order',
    orderId: order.orderId,
    quotedAmount: order.checkout.amount,
    ...(transactionId === undefined ? {} : { transactionId }),
  }
}

/** The charge's order: the one named, else the one the tapped sheet was for, else the prompt on screen. */
function chargedOrder(
  state: MoonPayCheckoutState,
  named: MoonPayChargedOrder | undefined,
): MoonPayChargedOrder | undefined {
  if (named !== undefined) {
    return named
  }
  return state.paying ?? readyOrder(state)
}

function paid(
  state: MoonPayCheckoutState,
  transactionId: string,
  named: MoonPayChargedOrder | undefined,
): MoonPayCheckoutState {
  const order = chargedOrder(state, named)
  if (order === undefined || state.charge !== undefined) {
    return state
  }
  const charge = orderCall(state, order, transactionId)
  return {
    ...state,
    charge,
    chargePolls: 0,
    call: charge,
    paying: undefined,
    failure: undefined,
  }
}

/**
 * The failed charge is reported, and its order is spent: the prompt that named it stays on screen
 * while `observe` asks for a new one.
 */
function chargeFailed(
  state: MoonPayCheckoutState,
  transactionId: string | undefined,
  named: MoonPayChargedOrder | undefined,
): MoonPayCheckoutState {
  const order = chargedOrder(state, named)
  if (order === undefined || state.charge !== undefined) {
    return state
  }
  const failedCharge = orderCall(state, order, transactionId)
  const ended = { ...payEnded(state), failedCharge }
  return ended.call === undefined &&
    readyOrder(ended)?.orderId === order.orderId
    ? { ...ended, call: observeCall(ended), failure: undefined }
    : ended
}

/** What the checkout shows. Derived from the state alone; the view adds nothing but SDK frames. */
export type MoonPayStage =
  | {
      kind: 'CONTINUE'
      documents: readonly TermsDocument[]
      accepting: boolean
    }
  /** `reset`: clear the device's MoonPay connection before the check. */
  | { kind: 'CONNECTING'; sessionToken: string; reset?: true }
  | {
      kind: 'KYC_CONSENT' | 'SHARING_CONSENT'
      documents: readonly TermsDocument[]
      accepting: boolean
    }
  | {
      kind: 'KYC'
      response: MoonPayKycNextAction
      submitting: boolean
    }
  | {
      kind: 'CAPTURE'
      response: MoonPayCaptureNextAction
      /** The SDK's report is on its way. */
      submitting: boolean
    }
  | { kind: 'REVIEW' }
  | {
      kind: 'PAY'
      response: MoonPayOrderNextAction
      order: MoonPayChargedOrder
      /** A charge on this order failed: its button stays up but cannot pay until a new `order` prompt. */
      spent: boolean
    }
  | { kind: 'LOADING' }
  /** `reason`: the fault's, which the retry screen words; absent when no fault body came back. */
  | { kind: 'RETRY'; call: MoonPayCall; reason: MoonPayFaultReason | undefined }
  | { kind: 'ERROR' }
  /** `gaveUp`: the order's reads hit their cap, and nothing reads it again. */
  | { kind: 'CONFIRMING'; gaveUp: boolean }
  /** The charge's `order` failed before the backend recorded it: only the same `order` may go again. */
  | { kind: 'ORDER_FAILED' }
  | { kind: 'SUPPORT' }
  | { kind: 'DONE'; order: FiatStepResponse }
  | { kind: 'EXITED' }

export function moonPayStage(state: MoonPayCheckoutState): MoonPayStage {
  if (state.exit !== undefined) {
    return { kind: 'EXITED' }
  }
  const { failure } = state
  if (failure !== undefined && failure.call.action === 'order') {
    if (failure.fault?.recovery === 'NONE') {
      return { kind: 'SUPPORT' }
    }
    if (moonPayReadsOrderAgain(state)) {
      return { kind: 'CONFIRMING', gaveUp: false }
    }
    return chargeRecorded(state)
      ? { kind: 'CONFIRMING', gaveUp: true }
      : { kind: 'ORDER_FAILED' }
  }
  if (failure !== undefined) {
    return failure.call.action === 'consent' && termsRefused(failure.fault)
      ? { kind: 'ERROR' }
      : {
          kind: 'RETRY',
          call: failure.call,
          reason: moonPayFaultReason(failure.fault),
        }
  }
  if (state.charge !== undefined) {
    return chargeStage(state)
  }
  const prompt = orderPrompt(state)
  if (prompt !== undefined) {
    return {
      kind: 'PAY',
      response: prompt.response,
      order: { orderId: prompt.response.orderId, ...termsOf(prompt) },
      spent: state.failedCharge?.orderId === prompt.response.orderId,
    }
  }
  const inFlight = state.call !== undefined
  const answer = state.answer?.action === 'order' ? undefined : state.answer
  if (answer === undefined) {
    return { kind: 'LOADING' }
  }
  const { response } = answer
  switch (response.next) {
    case 'consent':
      return { ...consentShown(response.documents), accepting: inFlight }
    case 'connect':
      return state.credentials === undefined
        ? {
            kind: 'CONNECTING',
            sessionToken: response.sessionToken,
            ...(response.resetConnection ? { reset: true } : {}),
          }
        : { kind: 'LOADING' }
    case 'kyc':
      return response.fields.length === 0
        ? { kind: 'LOADING' }
        : { kind: 'KYC', response, submitting: inFlight }
    case 'wait':
      return { kind: 'REVIEW' }
    case 'refused':
      return { kind: 'EXITED' }
    case 'capture':
      return { kind: 'CAPTURE', response, submitting: inFlight }
    case 'session':
    case 'prepareCapture':
    case 'order':
      return { kind: 'LOADING' }
  }
}

function chargeStage(state: MoonPayCheckoutState): MoonPayStage {
  if (state.answer?.action !== 'order') {
    return { kind: 'CONFIRMING', gaveUp: false }
  }
  const { response } = state.answer
  switch (response.next) {
    case 'done':
      return { kind: 'DONE', order: response.order }
    case 'refused':
      return { kind: 'SUPPORT' }
    // The order is handed over to follow its delivery, as a terminal one is.
    case 'orderPending':
      return offersDeliveryTransition(response.order)
        ? { kind: 'DONE', order: response.order }
        : { kind: 'CONFIRMING', gaveUp: false }
    // A declined charge clears `charge`, so its `order` prompt never lands here.
    case 'order':
      return { kind: 'CONFIRMING', gaveUp: false }
  }
}
