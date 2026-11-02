import type { FiatClientCapability } from '@funkit/api-base'
import type {
  DestinationAsset as FiatDestinationAsset,
  FiatStepResponse,
  JsonValue,
  Quote,
} from '@fun-xyz/fiat-contract/types'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import {
  NO_CLIENT_CAPABILITIES,
  sendAuthedFiatTransition,
} from '~/domains/fiat/authedTransport'
import {
  type GetIdentityAssertion,
  type IdentityAssertionProvider,
  createIdentityAssertionProvider,
} from '~/domains/fiat/identityAssertion'
import type { ComputePageOptions } from '~/domains/fiat/computePage'
import { sessionOf } from '~/domains/fiat/funAuth'
import type { FunSessionStore } from '~/domains/fiat/funSession'
import { computePage } from '~/domains/fiat/computePage'
import {
  describeStep,
  endpointShape,
  isDeadEnd,
} from '~/domains/fiat/describeStep'
import { transitionTarget } from '~/domains/fiat/transitionTarget'
import { fiatLogRedactor } from '~/domains/fiat/fiatLogRedactor'
import type {
  SubmitTransition,
  SurfaceTransition,
  TransitionDispatch,
} from '~/domains/fiat/selectTransitions'
import { buildPollEndpoint } from '~/domains/fiat/selectTransitions'
import { schedulePoll } from '~/domains/fiat/schedulePoll'
import type { CollectedInputs, SurfaceResult } from '~/domains/fiat/submitBody'
import type { FunLogger } from '~/utils/funLogger'
import { useEffectEvent } from '../useEffectEvent'
import type { FiatFlowState, FiatPhase } from './fiatFlowReducer'
import {
  fiatFlowReducer,
  initialFiatFlowState,
  isPolling,
} from './fiatFlowReducer'
import { useSubmitter } from './useSubmitter'
import { useHasFunSession } from './useFunSessionBearer'

/**
 * How `/fiat/*` requests authenticate. One object rather than two optional
 * props, because a minter without a subject is the identity-crossing bug: the
 * cache has to be scoped to *who* the assertion speaks for, and the callback's own
 * identity cannot say. A host that inlines the callback passes a new function
 * every render, so rebuilding on that would defeat the cache, while never
 * rebuilding would let a user switch keep spending the previous user's assertion
 * until it expired. Pairing them makes the subject impossible to forget.
 */
export interface FiatIdentityAssertion {
  /** Mints the host-signed identity assertion sent as the bearer credential. */
  getAssertion: GetIdentityAssertion
  /** Who the assertion speaks for — the signed-in user's id. */
  subject: string
}

export interface UseFiatTransitionsParams {
  /** Observes a polling deadline independently of submission failures. */
  onPollGaveUp?: () => void
  apiKey: string
  logger: FunLogger
  /**
   * Sent on every request of the flow, so the server never enrolls it in an experiment it cannot render.
   * - Keep the array stable across renders: the flow's requests are rebuilt when it changes
   */
  clientCapabilities?: readonly FiatClientCapability[]
  /** Omitted only while a flow has no signed-in user to speak for. */
  identityAssertion?: FiatIdentityAssertion
  /**
   * Fun's own login, for a host that mints no assertion. A VERIFIED response
   * stores its session here, and requests carry it once one is held.
   * Ignored when `identityAssertion` is set.
   */
  funSession?: FunSessionStore
  /**
   * Holds the page's poll while the flow waits on a new Fun login: sent with
   * no bearer it would only be refused until the deadline gives up. Resumes,
   * deadline restarted, once it turns false.
   */
  pausePolling?: boolean
  /** Address that receives the purchased crypto. */
  depositAddress?: string
  /**
   * The asset the buyer ends up with. The flow's quotes carry it, and the
   * backend keeps it with the quote the order is placed on. The backend alone
   * decides whether the order converts into it after the provider pays.
   */
  destinationAsset?: FiatDestinationAsset
  /**
   * Mode 2 (Fun login) only: the recipient the app chose, sent as `depositAddress` on the
   * routing table and every quote. Undefined for a host with a minter, whose assertion names it.
   */
  clientRecipient?: string
  /**
   * Whether a confirmed delivery ends the order — true only where the
   * provider pays the recipient itself. See {@link ComputePageOptions}.
   */
  settlesOnDelivery?: boolean
  /** Called when the server says the host should invalidate learned limits. */
  onRefreshLimits?: () => void
  /**
   * A step response to open on instead of the amount entry. Read once, on mount.
   * - Hosted previews seed it to land on any screen; production flows never pass it.
   */
  initialStepResponse?: FiatStepResponse
}

export interface FiatFlow {
  phase: FiatPhase
  page: FiatFlowState['page']
  stepResponse?: FiatStepResponse
  quote?: Quote
  identityAssertionProvider?: IdentityAssertionProvider
  /** See {@link UseFiatTransitionsParams.clientCapabilities}; quotes and provider calls for this flow send them too. */
  clientCapabilities: readonly FiatClientCapability[]
  /** See {@link UseFiatTransitionsParams.destinationAsset}; quotes for this flow name it too. */
  destinationAsset?: FiatDestinationAsset
  /** See {@link UseFiatTransitionsParams.clientRecipient}. */
  clientRecipient?: string
  ctas: TransitionDispatch['ctas']
  surface: TransitionDispatch['surface']
  collected: CollectedInputs
  isPolling: boolean
  /**
   * The page's poll hit its deadline; nothing will move the flow on by itself.
   * Optional so flows built outside this hook still satisfy the type.
   */
  pollGaveUp?: boolean
  isInFlight: boolean
  error: unknown
  submitError: unknown
  receive: (stepResponse: FiatStepResponse) => void
  setField: (name: string, value: JsonValue) => void
  /** Submits a collected transition, optionally adding values produced atomically by a provider surface. */
  submit: (
    cta: SubmitTransition,
    additionalInputs?: CollectedInputs,
  ) => Promise<void>
  /** Whether the submitted transition produced a response, for measured UI stages. */
  submitWithOutcome: (
    cta: SubmitTransition,
    additionalInputs?: CollectedInputs,
    mapStepResponse?: (stepResponse: FiatStepResponse) => FiatStepResponse,
  ) => Promise<boolean>
  reportSurface: (
    result: SurfaceResult,
    transition?: SurfaceTransition,
  ) => Promise<void>
  retry: () => Promise<void>
  exit: () => void
}

/** Drives transitions, submissions, and polling for one fiat flow. */
export function useFiatTransitions({
  onPollGaveUp: notifyPollGaveUp,
  apiKey,
  logger,
  clientCapabilities = NO_CLIENT_CAPABILITIES,
  identityAssertion,
  funSession,
  pausePolling = false,
  depositAddress,
  destinationAsset,
  clientRecipient,
  settlesOnDelivery,
  onRefreshLimits,
  initialStepResponse,
}: UseFiatTransitionsParams): FiatFlow {
  const backendDelivers = destinationAsset !== undefined
  const [state, dispatch] = useReducer(
    fiatFlowReducer,
    initialStepResponse,
    (seed): FiatFlowState =>
      seed === undefined
        ? initialFiatFlowState
        : fiatFlowReducer(initialFiatFlowState, {
            type: 'STEP_RESPONSE_RECEIVED',
            stepResponse: seed,
            pageOptions: { settlesOnDelivery, backendDelivers },
          }),
  )

  const canMintAssertion = identityAssertion !== undefined
  // Read as each submission is sent: a sign-out while the code is being
  // checked must not be undone by the answer.
  const loginMark = useRef<number | undefined>(undefined)
  const receive = useCallback(
    (stepResponse: FiatStepResponse) => {
      // The server says this response may have moved what the buyer can spend, so the ceiling
      // this session learned is no longer theirs. Dropping the scope refetches it.
      if (stepResponse.refreshLimits) {
        onRefreshLimits?.()
      }
      // A VERIFIED that confirmed an attribute for a customer's own user must
      // not start a second bearer beside the customer's assertion.
      const session = canMintAssertion ? undefined : sessionOf(stepResponse)
      if (session !== undefined) {
        funSession?.set(session, loginMark.current)
      }
      dispatch({
        type: 'STEP_RESPONSE_RECEIVED',
        stepResponse,
        pageOptions: { settlesOnDelivery, backendDelivers },
      })
    },
    [
      onRefreshLimits,
      settlesOnDelivery,
      backendDelivers,
      funSession,
      canMintAssertion,
    ],
  )

  // One cache across renders even when the host inlines the callback, so the
  // provider cannot be memoized on the callback itself. `useEffectEvent`
  // rather than a ref assigned during render: a render React discards still
  // moves a ref, which would let a mint call a callback that was never
  // committed. The subject is what actually bounds the cache, so switching
  // users starts a new one instead of reusing an assertion minted for the last.
  const mintAssertion = useEffectEvent(() =>
    identityAssertion === undefined
      ? Promise.reject(new Error('identity assertion was removed mid-flow'))
      : identityAssertion.getAssertion(),
  )
  const assertionSubject = identityAssertion?.subject
  const hasFunSession = useHasFunSession(funSession)
  const identityAssertionProvider = useMemo(() => {
    if (canMintAssertion) {
      return createIdentityAssertionProvider(mintAssertion)
    }
    // Unauthenticated until a session exists, which is how the server knows
    // to answer with the email step.
    return hasFunSession ? funSession?.provider : undefined
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [canMintAssertion, assertionSubject, hasFunSession, funSession])
  const bearerSource = bearerSourceOf(canMintAssertion, hasFunSession)
  // Once per flow, and again only when a verified email switches it on.
  useEffect(() => {
    logger.info('connect-core:fiat:bearer_source', { source: bearerSource })
  }, [bearerSource, logger])

  const submitter = useSubmitter({
    apiKey,
    logger,
    clientCapabilities,
    identityAssertionProvider,
    depositAddress,
    onStepResponse: receive,
  })

  const submitting = useRef(false)
  /** What the last fire was, so a retry can say what it is replaying. */
  const lastFired = useRef<FiredTransition>({ id: '-', endpoint: '-' })

  /**
   * Runs one transition and says what it did.
   *
   * The failure path already logs. What was missing is the other half: which
   * transition fired and where it went.
   *
   * - DEBUG for the ordinary pair: every step emits them, so they are for
   *   following one session, not for watching the rail.
   * - WARN for a step that offers nothing: the screen may render, but there
   *   is no way on from it.
   */
  const runSubmission = useCallback(
    async (
      fired: FiredTransition,
      send: () => Promise<FiatStepResponse | undefined>,
    ) => {
      if (submitting.current) {
        return false
      }
      submitting.current = true
      lastFired.current = fired
      loginMark.current = funSession?.mark()
      dispatch({ type: 'SUBMIT_STARTED', transitionId: fired.id })
      try {
        logger.debug('connect-core:fiat:transition_fired', fired)
        const stepResponse = await send()
        if (stepResponse === undefined) {
          dispatch({ type: 'SUBMIT_FAILED' })
          return false
        }
        const settled = { ...fired, ...describeStep(stepResponse) }
        if (isDeadEnd(stepResponse)) {
          logger.warn('connect-core:fiat:transition_dead_end', settled)
        } else {
          logger.debug('connect-core:fiat:transition_settled', settled)
        }
        return true
      } finally {
        submitting.current = false
      }
    },
    [logger, funSession],
  )

  const submitWithOutcome = useCallback(
    (
      cta: SubmitTransition,
      additionalInputs?: CollectedInputs,
      mapStepResponse?: (stepResponse: FiatStepResponse) => FiatStepResponse,
    ) =>
      runSubmission(
        {
          id: cta.id,
          endpoint: endpointShape(transitionTarget(cta).endpoint),
        },
        () =>
          submitter.fire({
            transition: cta,
            collected: { ...state.collected, ...additionalInputs },
            ...(mapStepResponse === undefined ? {} : { mapStepResponse }),
          }),
      ),
    [runSubmission, submitter, state.collected],
  )
  const submit = useCallback(
    async (cta: SubmitTransition, additionalInputs?: CollectedInputs) => {
      await submitWithOutcome(cta, additionalInputs)
    },
    [submitWithOutcome],
  )

  const reportSurface = useCallback(
    async (result: SurfaceResult, transition?: SurfaceTransition) => {
      // A surface carried by a quote is drawn straight from the quote and
      // never reaches the reducer, so its caller passes the transition to
      // report with. Only a surface the reducer owns can be looked up here.
      const surface = transition ?? state.dispatch.surface
      if (surface === undefined) {
        return
      }
      dispatch({ type: 'SURFACE_SETTLED' })
      await runSubmission(
        {
          id: surface.id,
          endpoint: endpointShape(transitionTarget(surface).endpoint),
        },
        () =>
          submitter.fire({
            transition: surface,
            surfaceResult: result,
          }),
      )
    },
    [runSubmission, submitter, state.dispatch],
  )

  // The submitter replays the attempt it kept, so the transition being sent
  // is the last one fired rather than anything the caller names here.
  const retry = useCallback(async () => {
    await runSubmission({ ...lastFired.current, retry: true }, submitter.retry)
  }, [runSubmission, submitter])

  const setField = useCallback((name: string, value: JsonValue) => {
    dispatch({ type: 'FIELD_CHANGED', name, value })
  }, [])

  const exit = useCallback(() => dispatch({ type: 'EXITED' }), [])

  const notifyGiveUp = useEffectEvent(() => {
    // An observer must not turn a handled deadline into an unhandled rejection.
    void Promise.resolve()
      .then(notifyPollGaveUp)
      .catch((error) => {
        logger.warn('connect-core:fiat:poll_gave_up_notify_failed', {
          reason: error instanceof Error ? error.name : 'unknown',
        })
      })
  })

  const onPollGaveUp = useCallback((error: unknown) => {
    dispatch({ type: 'POLL_GAVE_UP', error })
    notifyGiveUp()
  }, [])

  usePollRegion({
    apiKey,
    logger,
    clientCapabilities,
    identityAssertionProvider,
    paused: pausePolling,
    state,
    receive,
    onPollGaveUp,
  })

  return {
    phase: state.phase,
    page: state.page,
    stepResponse: state.stepResponse,
    quote: state.quote,
    identityAssertionProvider,
    clientCapabilities,
    destinationAsset,
    clientRecipient,
    ctas: state.dispatch.ctas,
    surface: state.dispatch.surface,
    collected: state.collected,
    isPolling: isPolling(state),
    pollGaveUp: state.poll.gaveUp === true,
    isInFlight: submitter.isInFlight,
    error: state.error,
    submitError: submitter.error,
    receive,
    setField,
    submit,
    submitWithOutcome,
    reportSurface,
    retry,
    exit,
  }
}

type BearerSource = 'customer_minter' | 'fun_session' | 'none'

function bearerSourceOf(
  canMintAssertion: boolean,
  hasFunSession: boolean,
): BearerSource {
  if (canMintAssertion) {
    return 'customer_minter'
  }
  return hasFunSession ? 'fun_session' : 'none'
}

/** Which transition a log line is about. */
interface FiredTransition {
  id: string
  endpoint: string
  retry?: boolean
}

/** Polls an AWAIT transition until the flow moves to another page. */
function usePollRegion({
  apiKey,
  logger,
  clientCapabilities,
  identityAssertionProvider,
  paused,
  state,
  receive,
  onPollGaveUp,
}: {
  apiKey: string
  logger: FunLogger
  clientCapabilities: readonly FiatClientCapability[]
  identityAssertionProvider: IdentityAssertionProvider | undefined
  paused: boolean
  state: FiatFlowState
  receive: (stepResponse: FiatStepResponse) => void
  onPollGaveUp: (error: unknown) => void
}): void {
  const polling = isPolling(state)
  const poll = state.dispatch.poll
  const startedOnIdentity = state.page.identity

  const onStepResponse = useEffectEvent((stepResponse: FiatStepResponse) =>
    receive(stepResponse),
  )
  // Read against the page it answers, so a later code round still matches itself.
  const identityOf = useEffectEvent(
    (stepResponse: FiatStepResponse) =>
      computePage(stepResponse, { previous: state.page }).identity,
  )
  const onGiveUp = useEffectEvent(() => {
    logger.warn('connect-core:fiat:poll_gave_up', {
      identity: startedOnIdentity,
    })
    // The deadline is the one failure a poll region produces itself, so it is
    // also the one error the reducer cannot read off a step response.
    onPollGaveUp(
      new Error(`fiat poll gave up before the flow left ${startedOnIdentity}`),
    )
  })

  useEffect(() => {
    if (!polling || poll === undefined || paused) {
      return
    }

    const controller = new AbortController()
    let disposed = false

    const cancel = schedulePoll(poll.poll, {
      onPoll: async () => {
        const stepResponse = await sendAuthedFiatTransition<FiatStepResponse>(
          {
            apiKey,
            logger,
            clientCapabilities,
            signal: controller.signal,
            redactBodyForLog: fiatLogRedactor(logger),
            abortOn429: true,
            params: { endpoint: buildPollEndpoint(poll.poll) },
          },
          identityAssertionProvider,
        )
        if (disposed) {
          return false
        }
        onStepResponse(stepResponse)
        return identityOf(stepResponse) === startedOnIdentity
      },
      onGiveUp,
      onError: (error) => {
        if (isAbort(error)) {
          return
        }
        logger.warn('connect-core:fiat:poll_failed', {
          identity: startedOnIdentity,
          reason: error instanceof Error ? error.name : 'unknown',
        })
      },
    })

    return () => {
      disposed = true
      controller.abort()
      cancel()
    }
  }, [
    polling,
    poll,
    paused,
    startedOnIdentity,
    apiKey,
    logger,
    clientCapabilities,
    identityAssertionProvider,
  ])
}

const isAbort = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError'
