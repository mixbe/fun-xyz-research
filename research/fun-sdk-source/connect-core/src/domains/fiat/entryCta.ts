import type { FiatStepResponse, Surface } from '@fun-xyz/fiat-contract/types'

import {
  FUN_AUTH_START_ENDPOINT,
  FUN_AUTH_START_ID,
  isFunAuthState,
} from './funAuth'
import { PAY_ENDPOINTS, SESSION_ENDPOINT } from './quoteRequest'
import type { SubmitTransition, SurfaceTransition } from './selectTransitions'
import { selectTransitions } from './selectTransitions'
import { sharingConsentOf } from './sharingConsent'

/** The tap sends a request this client builds. */
export interface SubmitControl {
  mode: 'SUBMIT'
  cta: SubmitTransition
}

/** A provider component is the control; the app draws no button of its own. */
export interface SurfaceControl {
  mode: 'CLIENT_SURFACE'
  surface: Surface
  transition: SurfaceTransition
}

/**
 * The tap enters a step the response already carries. Banxa answers the quote
 * endpoint with a KYC round rather than a price, so there is a screen to reach
 * and nothing to send to reach it.
 */
export interface EnterControl {
  mode: 'ENTER'
  stepResponse: FiatStepResponse
}

/**
 * How the control is operated — named with the contract's own transition
 * modes rather than a client-side render word. Held apart from `kind` so that
 * intent and presentation vary independently: two intents may legitimately
 * draw the same way, and one intent may draw two ways depending on the rail.
 */
export type EntryControl = SubmitControl | SurfaceControl | EnterControl

/**
 * What the amount screen's primary control *means*. Intent only — how it is
 * drawn comes from `EntryControl` and the predicates below, so a screen never
 * has to infer presentation from the category.
 *
 * The legal set for a QUOTE state is enumerated by the contract itself, in
 * `TRANSITION_TABLE['QUOTE'].allowedTransitions` of `@fun-xyz/fiat-contract`,
 * with the condition each is emitted under. Read that for the authority; this
 * union only says what the client does about it.
 */
export type EntryCta =
  /**
   * This tap pays. It creates the order, authorises the method that will
   * create one, or hands off to the provider sheet that does both — three
   * rails, one intent.
   */
  | { kind: 'PAY'; control: EntryControl }
  /**
   * The user is not established yet: a provider session (`POST /fiat/session`)
   * or a Fun identity (`POST /fiat/auth`). Nothing is wrong and nothing is
   * being verified — the flow simply has not met them.
   */
  | { kind: 'AUTHENTICATE'; control: SubmitControl }
  /**
   * A step this build does not know. It still renders and still submits — the
   * contract's `labelFallback` rule is what lets a new step ship without a
   * client release — but landing here means the backend moved ahead of us,
   * which is worth saying out loud rather than absorbing silently.
   */
  | { kind: 'UNRECOGNIZED'; control: SubmitControl }
  /**
   * The quote endpoint answered with a later step instead of a price — an
   * identity round, most often. The deposit is held on a screen past this one,
   * so the tap hands the envelope to the flow.
   */
  | { kind: 'CONTINUE'; control: EnterControl }
  /** Nothing to offer yet, or the flow has moved past this screen. */
  | { kind: 'PENDING' }

// A Fun identity is never offered on a QUOTE: the quote endpoint answers
// `FUN_AUTH` instead, which `sessionOpening` reads.
const AUTHENTICATE_ENDPOINTS: readonly string[] = [SESSION_ENDPOINT]

/** Whether the amount screen still owns the flow, or a later screen has it. */
export function isEntryOwnedState(
  stepResponse: FiatStepResponse | undefined,
): boolean {
  return stepResponse === undefined || stepResponse.state.kind === 'QUOTE'
}

/** Whether there is any control to draw at all. */
export function shouldRenderCta(entry: EntryCta): boolean {
  return entry.kind !== 'PENDING'
}

/**
 * The provider-drawn control, or `undefined` when the app draws its own.
 * Returned rather than asserted so a caller can reach the surface without
 * narrowing a union it did not build.
 */
export function surfaceControl(entry: EntryCta): SurfaceControl | undefined {
  if (entry.kind === 'PENDING' || entry.control.mode !== 'CLIENT_SURFACE') {
    return undefined
  }
  return entry.control
}

/**
 * Whether a provider component draws the control, in which case the app
 * renders no button of its own and the provider owns the tap.
 */
export function rendersOwnControl(entry: EntryCta): boolean {
  return surfaceControl(entry) !== undefined
}

/**
 * The step a tap should hand to the flow, or `undefined` when the tap sends a
 * request instead.
 */
export function enteredStep(entry: EntryCta): FiatStepResponse | undefined {
  if (entry.kind === 'PENDING' || entry.control.mode !== 'ENTER') {
    return undefined
  }
  return entry.control.stepResponse
}

/**
 * The transition a tap should send, or `undefined` when the app has nothing
 * to send — no control at all, or one the provider operates itself.
 */
export function submittableTransition(
  entry: EntryCta,
): SubmitTransition | undefined {
  if (entry.kind === 'PENDING' || entry.control.mode !== 'SUBMIT') {
    return undefined
  }
  return entry.control.cta
}

/**
 * The round that opens a session, when the quote endpoint answered with one
 * instead of a price. Coinbase prices nobody without a number and an
 * acceptance, so this round collects them — the client sends it rather than
 * entering it, or the screen that asks never runs.
 *
 * A resend reaches the same endpoint to replace a challenge the user already
 * holds, so it opens nothing. Reading it as the opening would put "replace what
 * you are looking at" under the screen's own button.
 *
 * MoonPay's sharing consent opens nothing either: its text is on its own screen,
 * and as an opening it would be prepared before the tap under MoonPay's terms.
 *
 * A Fun-run login answers the entry quote with `FUN_AUTH` in phase IDENTIFIER;
 * its `start` collects the email the code goes to, so it opens the same way.
 */
function sessionOpening(
  stepResponse: FiatStepResponse,
): SubmitTransition | undefined {
  if (isFunAuthState(stepResponse.state)) {
    return selectTransitions(stepResponse.transitions).ctas.find(
      (cta) =>
        cta.id === FUN_AUTH_START_ID &&
        cta.endpoint === FUN_AUTH_START_ENDPOINT,
    )
  }
  if (
    stepResponse.state.kind !== 'SESSION_AUTH' ||
    sharingConsentOf(stepResponse) !== undefined
  ) {
    return undefined
  }
  return selectTransitions(stepResponse.transitions).ctas.find(
    (cta) => cta.endpoint === SESSION_ENDPOINT && cta.id !== RESEND_ID,
  )
}

/** The id every provider's resend carries, whatever shape the round takes. */
export const RESEND_ID = 'resend'

/**
 * Precedence is surface, then pay, then everything else — a running surface
 * outranks any button, and the paying CTA is found by endpoint wherever it
 * sits in the array. Position is never the discriminant.
 *
 * The remainder is split rather than pooled: `AUTHENTICATE` is the set the
 * contract enumerates, `UNRECOGNIZED` is anything else. Both draw the same
 * server-supplied label, so the split buys no rendering. What it buys is
 * telling a user who has not signed in apart from a backend that has moved
 * ahead of this build.
 */
export function selectEntryCta(
  stepResponse: FiatStepResponse | undefined,
): EntryCta {
  if (stepResponse === undefined) {
    return { kind: 'PENDING' }
  }

  // Only the quote endpoint's answers reach here, so a state that is not a
  // quote is that endpoint skipping pricing — it has a round for the user
  // before it will price anything.
  if (stepResponse.state.kind !== 'QUOTE') {
    const opening = sessionOpening(stepResponse)
    return opening === undefined
      ? { kind: 'CONTINUE', control: { mode: 'ENTER', stepResponse } }
      : { kind: 'AUTHENTICATE', control: { mode: 'SUBMIT', cta: opening } }
  }

  const dispatch = selectTransitions(stepResponse.transitions)
  const surface = stepResponse.state.surface
  if (surface !== undefined && dispatch.surface !== undefined) {
    // Every CLIENT_SURFACE the table allows on QUOTE reports to an order
    // endpoint, so a surface here is the pay rail drawn by the provider.
    return {
      kind: 'PAY',
      control: {
        mode: 'CLIENT_SURFACE',
        surface,
        transition: dispatch.surface,
      },
    }
  }

  const pay = dispatch.ctas.find((cta) => PAY_ENDPOINTS.includes(cta.endpoint))
  if (pay !== undefined) {
    return { kind: 'PAY', control: { mode: 'SUBMIT', cta: pay } }
  }

  const [next] = dispatch.ctas
  if (next === undefined) {
    return { kind: 'PENDING' }
  }
  return AUTHENTICATE_ENDPOINTS.includes(next.endpoint)
    ? { kind: 'AUTHENTICATE', control: { mode: 'SUBMIT', cta: next } }
    : { kind: 'UNRECOGNIZED', control: { mode: 'SUBMIT', cta: next } }
}
