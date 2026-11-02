import type {
  FiatStepResponse,
  JsonValue,
  Quote,
} from '@fun-xyz/fiat-contract/types'

import type { ComputePageOptions, FiatPage } from '~/domains/fiat/computePage'
import { AMOUNT_ENTRY_PAGE, computePage } from '~/domains/fiat/computePage'
import { RESEND_ID } from '~/domains/fiat/entryCta'
import type { TransitionDispatch } from '~/domains/fiat/selectTransitions'
import { selectTransitions } from '~/domains/fiat/selectTransitions'
import type { CollectedInputs } from '~/domains/fiat/submitBody'

/**
 * What the client is doing, which is not what the flow is in — the step
 * response says the latter. Deliberately flat: `POLLING` is not here because polling
 * runs *alongside* collecting rather than instead of it, and modelling it as a
 * phase would make "waiting for the user while polling" unrepresentable.
 */
export type FiatPhase =
  | 'RENDERING' // nothing received yet — amount entry, before the flow starts
  | 'COLLECTING' // the screen is up, waiting on the user
  | 'SURFACE_RUNNING' // a provider surface is mounted and owns the screen
  | 'IN_FLIGHT' // a transition is being submitted
  | 'RETRYABLE' // the last submission failed and can be replayed
  | 'TERMINAL' // the table says the flow is over
  | 'EXITED' // the user closed the flow

/**
 * Polling runs alongside whatever the screen is doing, so it is tracked here
 * rather than as a phase — see `FiatPhase` above.
 *
 * `active` is the step response's doing: it asked for a poll. `paused` is ours: a
 * submit is in flight and a poll landing now would answer with the state that
 * submit is about to replace. `gaveUp` marks a poll that hit its deadline
 * rather than one the step response never asked for.
 */
export interface PollRegion {
  active: boolean
  paused: boolean
  gaveUp?: true
}

export interface FiatFlowState {
  phase: FiatPhase
  page: FiatPage
  stepResponse?: FiatStepResponse
  /** Latest priced terms, retained while a later payment state owns the UI. */
  quote?: Quote
  dispatch: TransitionDispatch
  /** Values the user has entered on the current screen. */
  collected: CollectedInputs
  poll: PollRegion
  error?: unknown
  /** The transition the submit in flight carries. */
  firing?: string
}

export type FiatFlowEvent =
  | {
      type: 'STEP_RESPONSE_RECEIVED'
      stepResponse: FiatStepResponse
      /** How this flow reads an order — see {@link ComputePageOptions}. */
      pageOptions?: ComputePageOptions
    }
  | { type: 'FIELD_CHANGED'; name: string; value: JsonValue }
  | { type: 'SUBMIT_STARTED'; transitionId?: string }
  | { type: 'SUBMIT_FAILED' }
  | { type: 'SURFACE_SETTLED' }
  | { type: 'POLL_GAVE_UP'; error?: unknown }
  | { type: 'EXITED' }

export const initialFiatFlowState: FiatFlowState = {
  phase: 'RENDERING',
  page: AMOUNT_ENTRY_PAGE,
  dispatch: { ctas: [] },
  collected: {},
  poll: { active: false, paused: false },
}

/** Polling only runs where all three agree, so callers ask this, not the fields. */
export function isPolling(state: FiatFlowState): boolean {
  return state.poll.active && !state.poll.paused && state.phase !== 'EXITED'
}

/**
 * The meta-machine, as a reducer.
 *
 * Two rules do most of the work:
 * - Terminality comes from the table via `page.terminal`, never from
 *   `transitions.length`. `KYC{ON_HOLD}` emits no transitions and is not over.
 * - Collected values survive a step response with the *same* identity and are
 *   dropped otherwise, so an error re-entry is a banner on the screen the user
 *   is already on rather than a form that blanks itself.
 */
export function fiatFlowReducer(
  state: FiatFlowState,
  event: FiatFlowEvent,
): FiatFlowState {
  // Closing is absorbing: a request in flight when the sheet closed must not be
  // able to reopen it by resolving.
  if (state.phase === 'EXITED') {
    return state
  }

  switch (event.type) {
    case 'STEP_RESPONSE_RECEIVED':
      return onStepResponse(state, event.stepResponse, event.pageOptions)

    case 'FIELD_CHANGED':
      return {
        ...state,
        collected: { ...state.collected, [event.name]: event.value },
      }

    case 'SUBMIT_STARTED':
      return {
        ...state,
        phase: 'IN_FLIGHT',
        firing: event.transitionId,
        error: undefined,
        // A poll landing mid-submit would answer with the state the submit is
        // about to replace, and the later of the two writes would win.
        poll: { ...state.poll, paused: true },
      }

    case 'SUBMIT_FAILED':
      // The transport error belongs to the submitter, which owns retrying it.
      // `error` here is the step response's own `FailureReason`, and a failed
      // submission did not produce one.
      return {
        ...state,
        phase: 'RETRYABLE',
        poll: { ...state.poll, paused: false },
      }

    case 'SURFACE_SETTLED':
      // The surface is done; what happens next is the report's step response.
      return state.phase === 'SURFACE_RUNNING'
        ? { ...state, phase: 'COLLECTING' }
        : state

    case 'POLL_GAVE_UP':
      return {
        ...state,
        poll: { ...state.poll, active: false, gaveUp: true },
        error: event.error ?? state.error,
      }

    case 'EXITED':
      return {
        ...state,
        phase: 'EXITED',
        poll: { active: false, paused: false },
      }
  }
}

function onStepResponse(
  state: FiatFlowState,
  stepResponse: FiatStepResponse,
  pageOptions?: ComputePageOptions,
): FiatFlowState {
  const page = computePage(stepResponse, {
    ...pageOptions,
    previous: state.page,
    submitted: state.phase === 'IN_FLIGHT',
    resent: state.phase === 'IN_FLIGHT' && state.firing === RESEND_ID,
  })
  const dispatch = selectTransitions(stepResponse.transitions)
  const sameState = page.identity === state.page.identity

  return {
    phase: phaseFor(page, dispatch),
    page,
    stepResponse,
    quote:
      'quote' in stepResponse.state ? stepResponse.state.quote : state.quote,
    dispatch,
    // Same identity means the same state, so what the user typed is still
    // about this screen. A new one starts empty.
    collected: sameState ? state.collected : {},
    // Only a delivery the client settled itself ignores the poll the response
    // carries; a terminal page the server declared keeps its own, which is how
    // a failure recovers.
    poll: {
      active: dispatch.poll !== undefined && page.settledOnDelivery !== true,
      paused: false,
    },
    // Errors ride on the state as fields, so the step response is the only
    // source. `DELIVERY` carries none.
    error: 'error' in stepResponse.state ? stepResponse.state.error : undefined,
  }
}

function phaseFor(page: FiatPage, dispatch: TransitionDispatch): FiatPhase {
  if (page.terminal) {
    return 'TERMINAL'
  }
  if (dispatch.surface !== undefined) {
    return 'SURFACE_RUNNING'
  }
  return 'COLLECTING'
}
