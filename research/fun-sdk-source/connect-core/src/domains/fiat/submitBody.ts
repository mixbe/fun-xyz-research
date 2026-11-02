import type { JsonValue, Transition } from '@fun-xyz/fiat-contract/types'

import { PAY_ENDPOINTS } from '~/domains/fiat/quoteRequest'
import { transitionTarget } from '~/domains/fiat/transitionTarget'
import { readKycSdkResult } from '~/domains/fiat/kycSdkResult'

const DESTINATION_ENDPOINTS: readonly string[] = [
  ...PAY_ENDPOINTS,
  'POST /fiat/session/verify',
]

export type FiatBodyErrorCode = 'KEY_COLLISION' | 'MISSING_SURFACE_RESULT'

export class FiatBodyError extends Error {
  readonly code: FiatBodyErrorCode
  readonly keys: string[]
  constructor(code: FiatBodyErrorCode, message: string, keys: string[] = []) {
    super(message)
    this.name = 'FiatBodyError'
    this.code = code
    this.keys = keys
  }
}

/** Values the user typed or picked, keyed by the transition's input name. */
export type CollectedInputs = Record<string, JsonValue>

/** What a client surface handed back, e.g. `{ requestId }` from the pay sheet. */
export type SurfaceResult = Record<string, JsonValue>

export interface AssembleBodyParams {
  transition: Transition
  collected?: CollectedInputs
  surfaceResult?: SurfaceResult
  /** Address that receives crypto from a new order. */
  depositAddress?: string
}

/** Builds a body from the fields declared by a transition. */
export function assembleBody({
  transition,
  collected,
  surfaceResult,
  depositAddress,
}: AssembleBodyParams): Record<string, JsonValue> | undefined {
  const { params } = transitionTarget(transition)
  const inputs = collectInputs(transition, collected)
  const injected = injectExpects(transition, surfaceResult)
  const reported = injectResult(transition, surfaceResult)

  const collision = firstSharedKey([params, inputs, injected, reported])
  if (collision !== undefined) {
    throw new FiatBodyError(
      'KEY_COLLISION',
      `transition ${transition.id} sets ${collision} from more than one source`,
      [collision],
    )
  }

  const body = {
    ...params,
    ...inputs,
    ...injected,
    ...reported,
    ...orderDepositAddress(
      transition,
      depositAddress,
      injected,
      reported,
      inputs,
      params,
    ),
  }
  // Some transitions intentionally have no request body.
  return Object.keys(body).length === 0 ? undefined : body
}

/** Supplies the delivery address until the backend declares it itself. */
function orderDepositAddress(
  transition: Transition,
  depositAddress: string | undefined,
  ...declared: readonly Record<string, JsonValue>[]
): Record<string, JsonValue> {
  const needsDestination = DESTINATION_ENDPOINTS.includes(
    transitionTarget(transition).endpoint,
  )
  const alreadyDeclared = declared.some(
    (source) => source.depositAddress !== undefined,
  )
  return needsDestination && !alreadyDeclared && depositAddress !== undefined
    ? { depositAddress }
    : {}
}

function collectInputs(
  transition: Transition,
  collected: CollectedInputs | undefined,
): Record<string, JsonValue> {
  if (transition.mode !== 'SUBMIT' || !transition.inputs) {
    return {}
  }

  const { inputs } = transition
  const picked = pickDefined(Object.keys(inputs), collected)
  for (const name of Object.keys(picked)) {
    if (inputs[name]?.type === 'FORM_VALUES') {
      picked[name] = formValuesPayload(picked[name])
    }
  }
  return picked
}

/**
 * Answers go out as one entry per field, not as an object keyed by field id.
 *
 * The form collects them keyed, because that is what a screen edits; the
 * server reads `fieldId` off each entry and refuses the keyed form.
 */
function formValuesPayload(collected: JsonValue | undefined): JsonValue {
  if (
    collected === null ||
    typeof collected !== 'object' ||
    Array.isArray(collected)
  ) {
    return []
  }
  // A blank answer is left out: the server refuses a blank value even for an
  // optional field, and an omitted required one earns its MISSING_FIELD.
  return Object.entries(collected)
    .filter(([, value]) => typeof value !== 'string' || value.trim() !== '')
    .map(([fieldId, value]) => ({ fieldId, value }))
}

function injectExpects(
  transition: Transition,
  surfaceResult: SurfaceResult | undefined,
): Record<string, JsonValue> {
  if (transition.mode !== 'CLIENT_SURFACE') {
    return {}
  }

  const expects = transition.report.expects ?? []
  const missing = expects.filter((name) => surfaceResult?.[name] === undefined)
  if (missing.length > 0) {
    throw new FiatBodyError(
      'MISSING_SURFACE_RESULT',
      `transition ${transition.id} expects ${missing.join(', ')} from its surface`,
      missing,
    )
  }

  return pickDefined(expects, surfaceResult)
}

function injectResult(
  transition: Transition,
  surfaceResult: SurfaceResult | undefined,
): Record<string, JsonValue> {
  if (transition.mode !== 'CLIENT_SURFACE') {
    return {}
  }
  const spec = transition.report.result
  if (spec?.type !== 'KYC_SDK_RESULT') {
    return {}
  }
  const result = readKycSdkResult(surfaceResult)
  if (result === undefined) {
    throw new FiatBodyError(
      'MISSING_SURFACE_RESULT',
      `transition ${transition.id} reports a ${spec.type} its surface did not give`,
      [spec.bodyKey],
    )
  }
  return { [spec.bodyKey]: result }
}

function pickDefined(
  names: readonly string[],
  source: Record<string, JsonValue> | undefined,
): Record<string, JsonValue> {
  const picked: Record<string, JsonValue> = {}
  for (const name of names) {
    const value = source?.[name]
    if (value !== undefined) {
      picked[name] = value
    }
  }
  return picked
}

function firstSharedKey(
  sources: readonly Record<string, unknown>[],
): string | undefined {
  const seen = new Set<string>()
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      if (seen.has(key)) {
        return key
      }
      seen.add(key)
    }
  }
  return undefined
}
