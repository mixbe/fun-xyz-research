import type { FiatClientCapability } from '@funkit/api-base'
import type {
  FiatEndpoint,
  FiatStepResponse,
  JsonValue,
  Transition,
} from '@fun-xyz/fiat-contract/types'
import {
  getResponseErrorBody,
  isFiatRateLimitError,
  isFiatWriteEndpoint,
} from '@funkit/api-base'
import { useCallback, useRef, useState } from 'react'

import { sendAuthedFiatTransition } from '~/domains/fiat/authedTransport'
import type { IdentityAssertionProvider } from '~/domains/fiat/identityAssertion'
import { fiatLogRedactor } from '~/domains/fiat/fiatLogRedactor'
import { transitionTarget } from '~/domains/fiat/transitionTarget'
import {
  type CollectedInputs,
  FiatBodyError,
  type SurfaceResult,
  assembleBody,
} from '~/domains/fiat/submitBody'
import type { FunLogger } from '~/utils/funLogger'
import { randomUuid } from '~/utils/randomUuid'
import { useEffectEvent } from '../useEffectEvent'

/**
 * A body that has been assembled, wrapped so that "assembled to nothing" — a
 * transition with no request body — stays distinct from "never assembled",
 * which is a fire whose assembly threw and has nothing to replay.
 */
interface AssembledBody {
  body: Record<string, JsonValue> | undefined
}

interface Attempt {
  params: FireParams
  idempotencyKey: string
  assembled?: AssembledBody
}

export interface FireParams {
  transition: Transition
  collected?: CollectedInputs
  surfaceResult?: SurfaceResult
  /** Replace a successful response before the flow reducer sees it. */
  mapStepResponse?: (stepResponse: FiatStepResponse) => FiatStepResponse
}

export interface UseSubmitterParams {
  apiKey: string
  logger: FunLogger
  clientCapabilities: readonly FiatClientCapability[]
  identityAssertionProvider?: IdentityAssertionProvider
  depositAddress?: string
  onStepResponse: (stepResponse: FiatStepResponse) => void
}

export interface Submitter {
  /** Fires a transition. Resolves to the next step response, or `undefined` if it failed. */
  fire: (params: FireParams) => Promise<FiatStepResponse | undefined>
  /** Re-fires the last attempt under its original idempotency key. */
  retry: () => Promise<FiatStepResponse | undefined>
  isInFlight: boolean
  /** Cleared when the next fire starts. `retry` is only meaningful while it is set. */
  error?: unknown
}

/** Fires one transition at a time and safely reuses its key on retry. */
export function useSubmitter({
  apiKey,
  logger,
  clientCapabilities,
  identityAssertionProvider,
  depositAddress,
  onStepResponse,
}: UseSubmitterParams): Submitter {
  const [isInFlight, setIsInFlight] = useState(false)
  const [error, setError] = useState<unknown>()

  // State cannot stop two taps in the same render.
  const inFlight = useRef(false)
  const lastFire = useRef<Attempt | undefined>(undefined)

  const publish = useEffectEvent((stepResponse: FiatStepResponse) =>
    onStepResponse(stepResponse),
  )

  const send = useCallback(
    async (
      params: FireParams,
      idempotencyKey: string,
      replay?: AssembledBody,
    ): Promise<FiatStepResponse | undefined> => {
      if (inFlight.current) {
        logger.info('connect-core:fiat:submit_ignored_while_in_flight', {
          transitionId: params.transition.id,
        })
        return undefined
      }

      inFlight.current = true
      setIsInFlight(true)
      setError(undefined)
      const attempt: Attempt = { params, idempotencyKey }
      lastFire.current = attempt

      try {
        // A key means one body to the backend, so a retry replays the body its
        // key was minted with instead of rebuilding it. `depositAddress` can
        // resolve between the fire and the retry, and re-assembling would post
        // a second, different order under a key already on record — which the
        // backend answers by replaying the first order or rejecting the key.
        attempt.assembled = replay ?? {
          body: assembleBody({ ...params, depositAddress }),
        }

        const stepResponse = await sendWriteOrReadFiatTransition({
          request: {
            apiKey,
            logger,
            clientCapabilities,
            redactBodyForLog: fiatLogRedactor(logger),
          },
          identityAssertionProvider,
          endpoint: transitionTarget(params.transition).endpoint,
          body: attempt.assembled.body,
          idempotencyKey,
        })

        const received = params.mapStepResponse?.(stepResponse) ?? stepResponse
        publish(received)
        return received
      } catch (caught) {
        const bodyError = caught instanceof FiatBodyError ? caught : undefined
        const refusal = getResponseErrorBody(caught)
        const event = 'connect-core:fiat:submit_failed'
        const properties = {
          transitionId: params.transition.id,
          mode: params.transition.mode,
          reason: caught instanceof Error ? caught.name : 'unknown',
          errorCode: refusal?.errorCode,
          errorReason:
            typeof refusal?.reason === 'string' ? refusal.reason : undefined,
          ...(isFiatRateLimitError(caught) ? { rateLimited: true } : {}),
        }

        if (bodyError === undefined) {
          logger.warn(event, properties)
        } else {
          logger.error(event, {
            ...properties,
            code: bodyError.code,
            keys: bodyError.keys,
            error: bodyError,
          })
        }

        setError(caught)
        return undefined
      } finally {
        inFlight.current = false
        setIsInFlight(false)
      }
    },
    [
      apiKey,
      logger,
      clientCapabilities,
      identityAssertionProvider,
      depositAddress,
    ],
  )

  const fire = useCallback(
    (params: FireParams) => send(params, randomUuid()),
    [send],
  )

  const retry = useCallback(() => {
    const previous = lastFire.current
    if (previous === undefined) {
      return Promise.resolve(undefined)
    }
    return send(previous.params, previous.idempotencyKey, previous.assembled)
  }, [send])

  return { fire, retry, isInFlight, error }
}

interface SendTransitionParams {
  request: {
    apiKey: string
    logger: FunLogger
    clientCapabilities: readonly FiatClientCapability[]
    redactBodyForLog: ReturnType<typeof fiatLogRedactor>
  }
  identityAssertionProvider: IdentityAssertionProvider | undefined
  endpoint: FiatEndpoint
  body: Record<string, JsonValue> | undefined
  idempotencyKey: string
}

function sendWriteOrReadFiatTransition({
  request,
  identityAssertionProvider,
  endpoint,
  body,
  idempotencyKey,
}: SendTransitionParams): Promise<FiatStepResponse> {
  const withBody = body === undefined ? {} : { body }
  const transition = { ...request, abortOn429: true }

  if (isFiatWriteEndpoint(endpoint)) {
    return sendAuthedFiatTransition<FiatStepResponse>(
      {
        ...transition,
        params: { endpoint, ...withBody, idempotencyKey },
      },
      identityAssertionProvider,
    )
  }
  return sendAuthedFiatTransition<FiatStepResponse>(
    { ...transition, params: { endpoint, ...withBody } },
    identityAssertionProvider,
  )
}
