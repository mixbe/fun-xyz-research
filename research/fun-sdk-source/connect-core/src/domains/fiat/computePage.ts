import {
  TERMINAL_ORDER_STATUSES,
  TRANSITION_TABLE,
  stateKey,
} from '@fun-xyz/fiat-contract/table'
import type { StateKey } from '@fun-xyz/fiat-contract/table'
import type {
  FiatStepResponse,
  FlowState,
  OrderStatus,
} from '@fun-xyz/fiat-contract/types'

import {
  FUN_AUTH_VERIFY_ENDPOINT,
  isFunAuthState,
} from '~/domains/fiat/funAuth'
import { sharingConsentOf } from '~/domains/fiat/sharingConsent'

/**
 * Named rather than numbered: the contract's `screens: number[]` index the FE
 * doc (the number trailing each member) — useful for tracing a decision back
 * to its spec, wrong for rendering code to branch on.
 */
export type FiatScreen =
  | 'AMOUNT_ENTRY' // 0 — client-local, before any envelope exists
  | 'QUOTE_REVIEW' // 1
  | 'OTP' // 2
  | 'AUTH_CAPTURE' // provider-rendered session authorization
  | 'KYC_FORM' // 3
  | 'ORDER_REVIEW' // 4
  | 'PAYMENT_CAPTURE' // 5
  | 'BANK_INSTRUCTIONS' // 6
  | 'ORDER_TRACKING' // 7
  | 'KYC_CAPTURE' // 8
  | 'KYC_SHARING_CONSENT' // MoonPay's document-sharing consent, ahead of its capture
  | 'KYC_VERIFYING' // 9
  | 'KYC_ON_HOLD' // 10
  | 'KYC_REJECTED' // 11
  | 'ORDER_PENDING' // 12
  | 'SUCCESS' // 13
  | 'FAILURE' // 14
  | 'REFUND' // 15
  | 'DELIVERY_FAILED' // the buyer paid, but the asset the order converts into never reached them
  | 'BLOCKED' // 16
  | 'UNSUPPORTED' // no published screen for this state

// Total over the table: a state added to the contract is a compile error
// here until it is mapped.
const SCREEN_BY_STATE: Readonly<Record<StateKey, FiatScreen>> = {
  QUOTE: 'QUOTE_REVIEW',
  // The code and the verified tick. IDENTIFIER is refined in `computePage`.
  FUN_AUTH: 'OTP',
  SESSION_AUTH: 'OTP',
  'KYC/CAPTURE': 'KYC_CAPTURE',
  'KYC/INPUT_REQUIRED': 'KYC_FORM',
  'KYC/NO_ACTION_REQUIRED:IN_REVIEW': 'KYC_VERIFYING',
  'KYC/NO_ACTION_REQUIRED:ON_HOLD': 'KYC_ON_HOLD',
  'KYC/NO_ACTION_REQUIRED:REJECTED': 'KYC_REJECTED',
  PENDING_ORDER: 'ORDER_PENDING',
  BLOCKED: 'BLOCKED',
  'PAYMENT/CAPTURE': 'PAYMENT_CAPTURE',
  'PAYMENT/INSTRUCT': 'BANK_INSTRUCTIONS',
  'ORDER/AWAITING_CONFIRMATION': 'ORDER_REVIEW',
  // Base of the only fan-out (screens 7/13/14/15); `orderScreen` refines it by status.
  'ORDER/CREATED': 'ORDER_TRACKING',
  // A converted order's second leg, after its `SETTLED` offered the way here.
  'DELIVERY:PENDING': 'ORDER_TRACKING',
  'DELIVERY:SUCCEEDED': 'SUCCESS',
  'DELIVERY:FAILED': 'DELIVERY_FAILED',
}

// Unknown and non-terminal statuses both land on tracking — a client that
// stops polling strands the order. Same "non-terminal is the safe default"
// rule the contract applies to CAPTURE_ORPHANED.
const orderScreen = (status: OrderStatus): FiatScreen => {
  if (status === 'SETTLED') {
    return 'SUCCESS'
  }
  if (status === 'REFUNDED') {
    return 'REFUND'
  }
  if (isTerminalStatus(status)) {
    return 'FAILURE'
  } // EXPIRED · CANCELLED · FAILED
  return 'ORDER_TRACKING'
}

const isTerminalStatus = (status: OrderStatus): boolean =>
  TERMINAL_ORDER_STATUSES.some((terminal) => terminal === status)

const offersAwait = (transitions: FiatPageInput['transitions']): boolean =>
  (transitions ?? []).some((transition) => transition.mode === 'AWAIT')

export interface ComputePageOptions {
  /**
   * Whether a confirmed delivery ends the order.
   *
   * True only where the provider pays the recipient itself: the crypto is
   * already where it was going, so `CRYPTO_SENT` plus its transaction is the
   * last thing that happens, and waiting for the server to say `SETTLED`
   * leaves the user on a spinner over money they have. Where a deposit
   * address still has to be swept, delivery is the middle of the story and
   * this stays off.
   */
  settlesOnDelivery?: boolean
  /**
   * The backend picks the delivery address: the flow names a destination. Only
   * the backend knows whether the order converts the payout into another
   * asset, so a poll it offers at `CRYPTO_SENT` is followed, not ignored.
   */
  backendDelivers?: boolean
  /** The page this response replaces; how a code round knows it follows another. */
  previous?: FiatPage
  /** A submit produced this response, not a poll. */
  submitted?: boolean
  /** That submit was a resend: a fresh code for the round it was asked on. */
  resent?: boolean
}

export interface FiatPage {
  screen: FiatScreen
  /**
   * Two envelopes with equal identity are the *same* state: a re-entry
   * carrying an error is a banner, not a navigation, and collected form
   * values survive it.
   */
  identity: string
  /** From the table, never inferred from `transitions.length`. */
  terminal: boolean
  /**
   * The client called this order done off its delivery, ahead of the server.
   * Only here is a poll the server still offers worth ignoring: it asks about
   * an order this client has already finished with. Every other terminal page
   * keeps whatever poll the response carries — the contract emits one to
   * recover a failure, and dropping it would strand that recovery.
   */
  settledOnDelivery?: boolean
  /**
   * Which code round this is on its channel, absent on the first. The contract
   * names no round, so it is counted from the page before — see `codeRoundOf`.
   */
  round?: number
  /**
   * A code round that dropped its challenge (too many attempts, an expired
   * code) and offers only a resend: whatever that resend answers is a new code.
   */
  challengeDropped?: true
}

/** The screen shown before any envelope exists. Client-local, has no state key. */
export const AMOUNT_ENTRY_PAGE: FiatPage = {
  screen: 'AMOUNT_ENTRY',
  identity: 'client:AMOUNT_ENTRY',
  terminal: false,
}

/**
 * The envelope, not the bare state: the contract leaves `orderId` placement
 * open (`TODO(open-decision)`), and identity is wrong if the resolver can
 * only see one of the two documented spots.
 */
export type FiatPageInput = Pick<FiatStepResponse, 'state' | 'orderId'> &
  Partial<Pick<FiatStepResponse, 'transitions' | 'provider'>>

/**
 * Resolves an envelope to the screen that renders it. Total: a kind this
 * client's table version predates resolves to `UNSUPPORTED`, because the
 * stale rule lets any call return any state and a shipped client has to
 * render something.
 */
export function computePage(
  envelope: FiatPageInput,
  {
    settlesOnDelivery = false,
    backendDelivers = false,
    previous,
    submitted = false,
    resent = false,
  }: ComputePageOptions = {},
): FiatPage {
  const { state } = envelope
  const key = knownStateKey(state)
  if (key === undefined) {
    return unsupportedPage(state)
  }

  const baseIdentity = identityOf(key, envelope)
  const round = codeRoundOf(baseIdentity, state, previous, submitted, resent)
  const identity = withRound(baseIdentity, round)

  const sharingConsent = sharingConsentOf(envelope)
  if (sharingConsent !== undefined) {
    return {
      screen: 'KYC_SHARING_CONSENT',
      identity: `${identity}:${sharingConsent.terms.version}`,
      terminal: false,
    }
  }

  // OTP is only one session-auth transport. Providers such as MoonPay own
  // account connection in a native surface, so rendering the code screen for
  // that channel would leave the CLIENT_SURFACE transition unreachable.
  //
  // The surface is what makes it a capture, not the channel. Stripe's entry into
  // session auth is provider-rendered too, but carries no surface: there is
  // nothing to render until the client has checked for a Link account and the
  // backend has minted an auth intent. Routing that state here strands it on a
  // screen whose every guard needs a surface, so it falls through to OTP, where
  // the provider's own controller runs that check.
  if (
    state.kind === 'SESSION_AUTH' &&
    state.channel === 'PROVIDER_RENDERED' &&
    state.surface !== undefined
  ) {
    return { screen: 'AUTH_CAPTURE', identity, terminal: false }
  }

  // The email is asked on the amount step's contact screen, which holds the
  // entry while it is open. A server re-ask (INVALID_EMAIL) lands back there:
  // the entry screen, with the refusal worn by the contact round.
  if (isFunAuthState(state) && state.phase === 'IDENTIFIER') {
    return { screen: 'QUOTE_REVIEW', identity, terminal: false }
  }

  // Narrowed on the union, not the key string, so `status` is known-present.
  if (state.kind === 'ORDER' && state.phase === 'CREATED') {
    // A poll offered at `SETTLED` means the purchase goes on past the order
    // (a converted order's delivery). The server's next answer says what follows.
    if (state.status === 'SETTLED' && offersAwait(envelope.transitions)) {
      return { screen: 'ORDER_TRACKING', identity, terminal: false }
    }
    // The transaction is required, not just the status: `CRYPTO_SENT` without
    // one names no delivery to have arrived. Where the backend picks the
    // address, a poll it still offers says the payout went to an address that
    // converts it, not to the buyer.
    const delivered =
      settlesOnDelivery &&
      state.status === 'CRYPTO_SENT' &&
      state.tx?.hash &&
      !(backendDelivers && offersAwait(envelope.transitions))
    if (delivered) {
      return {
        screen: 'SUCCESS',
        identity,
        terminal: true,
        settledOnDelivery: true,
      }
    }
    return {
      screen: orderScreen(state.status),
      identity,
      terminal: isTerminalStatus(state.status),
    }
  }

  const screen = SCREEN_BY_STATE[key] ?? 'UNSUPPORTED'
  if (screen === 'UNSUPPORTED') {
    return unsupportedPage(state)
  }
  return {
    screen,
    identity,
    terminal: TRANSITION_TABLE[key]?.terminal ?? false,
    ...(round > 0 && { round }),
    ...(isDroppedChallenge(envelope) && { challengeDropped: true }),
  }
}

/**
 * - A clean response to a submit on the same channel is the next code: the
 *   digits typed for the last one must not be sent against it.
 * - One carrying an error is the same round re-entered — the bad-code banner —
 *   and a poll never answers a code, so both keep the round.
 * - A resend replaces the code on the round the user is looking at, so it
 *   keeps the round too — unless that round had dropped its challenge, whose
 *   locked digits belong to no code.
 */
function codeRoundOf(
  baseIdentity: string,
  state: FlowState,
  previous: FiatPage | undefined,
  submitted: boolean,
  resent: boolean,
): number {
  if (!isCodeRound(state)) {
    return 0
  }
  const previousRound = previous?.round ?? 0
  if (previous?.identity !== withRound(baseIdentity, previousRound)) {
    return 0
  }
  const freshCode = submitted && (!resent || previous.challengeDropped === true)
  return freshCode && state.error === undefined
    ? previousRound + 1
    : previousRound
}

// FUN_AUTH only: a provider's code round always carries its submit.
function isDroppedChallenge({ state, transitions }: FiatPageInput): boolean {
  return (
    isFunAuthState(state) &&
    state.phase === 'CODE' &&
    transitions !== undefined &&
    !transitions.some(
      (transition) =>
        transition.mode === 'SUBMIT' &&
        transition.endpoint === FUN_AUTH_VERIFY_ENDPOINT,
    )
  )
}

function isCodeRound(
  state: FlowState,
): state is Extract<FlowState, { kind: 'FUN_AUTH' | 'SESSION_AUTH' }> {
  if (isFunAuthState(state)) {
    return state.phase === 'CODE'
  }
  return state.kind === 'SESSION_AUTH' && state.channel !== 'PROVIDER_RENDERED'
}

function withRound(identity: string, round: number): string {
  return round > 0 ? `${identity}:${round}` : identity
}

/**
 * The table key, or `undefined` for a kind this build predates.
 *
 * Caught rather than pre-validated against a kind list — a list would be a
 * second copy of the contract's switch, free to drift from it.
 */
export function knownStateKey(state: FlowState): StateKey | undefined {
  try {
    return stateKey(state)
  } catch {
    return undefined
  }
}

/**
 * Distinct per kind so two unknown states are not treated as the same one, and
 * never terminal — a client that wrongly calls a flow over stops polling.
 */
function unsupportedPage(state: FlowState): FiatPage {
  return {
    screen: 'UNSUPPORTED',
    identity: `unsupported:${String(state.kind)}`,
    terminal: false,
  }
}

/**
 * Two KYC form rounds — or two session rounds, or two orders — share a key and
 * a screen but must not share identity: a second round would silently inherit
 * the first round's typed-in values.
 */
function identityOf(key: StateKey, envelope: FiatPageInput): string {
  const discriminant = discriminantOf(envelope)
  return discriminant === undefined ? key : `${key}:${discriminant}`
}

function discriminantOf({ state, orderId }: FiatPageInput): string | undefined {
  switch (state.kind) {
    case 'QUOTE':
      return state.quote.quoteRef
    // A second round is a different channel, not a repeat of the first: the
    // code typed for the phone must not be carried into the email round. A
    // re-entry on the same channel is the bad-code banner, so it keeps it.
    case 'SESSION_AUTH':
      return state.channel
    // The email, the code and the verified tick are three pages: a code typed
    // for one challenge must not survive into the next phase.
    case 'FUN_AUTH':
      return `${state.channel}:${state.phase}`
    case 'KYC':
      return state.phase === 'INPUT_REQUIRED' ? state.form.formId : undefined
    case 'PAYMENT':
      // In-state placement wins; the envelope sibling is the other documented
      // spot for the same id.
      return state.phase === 'INSTRUCT' ? (state.orderId ?? orderId) : undefined
    case 'ORDER':
      return state.phase === 'CREATED'
        ? (state.order?.orderId ?? orderId)
        : state.quote.quoteRef
    case 'DELIVERY':
      return orderId
    default:
      return undefined
  }
}
