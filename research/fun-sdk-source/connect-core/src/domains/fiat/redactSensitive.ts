import type {
  FiatStepResponse,
  FlowState,
  Instructions,
  JsonValue,
  Surface,
  Transition,
  TransitionParams,
} from '@fun-xyz/fiat-contract/types'

/** Stands in for a scrubbed value so a log still shows the field was present. */
export const REDACTED = '[redacted]'

/**
 * Returns a copy with session tokens and payment instructions scrubbed, safe
 * to log. State kind, phase, status and fee ids survive — that is the part
 * worth logging.
 *
 * Switches on the contract's unions rather than matching key names, so a new
 * surface or instruction kind fails to compile instead of leaking.
 */
export function redactSensitive<T extends Pick<FiatStepResponse, 'state'>>(
  envelope: T,
): T {
  let redacted = { ...envelope, state: redactState(envelope.state) }
  if ('providerAuthToken' in redacted && redacted.providerAuthToken) {
    redacted = {
      ...redacted,
      providerAuthToken: {
        ...redacted.providerAuthToken,
        clientSecret: REDACTED,
      },
    }
  }
  // A Fun login's VERIFIED carries its bearer and refresh handle: either one
  // is the buyer's session to whoever reads the log.
  if ('session' in redacted && redacted.session) {
    redacted = {
      ...redacted,
      session: {
        ...redacted.session,
        accessToken: REDACTED,
        refreshHandle: REDACTED,
      },
    }
  }
  return 'transitions' in redacted && Array.isArray(redacted.transitions)
    ? { ...redacted, transitions: redacted.transitions.map(redactTransition) }
    : redacted
}

/**
 * Transition params are untyped, so they are matched by name, at any depth and in any case.
 * `heldValues` is a buyer's own name, phone and country (ENG-6590); `verifiedEmail` rides
 * session-auth SUBMITs. The rest are credential names no param should log.
 */
const SENSITIVE_PARAM_NAMES = new Set([
  'heldvalues',
  'verifiedemail',
  'email',
  'phonenumber',
  'clientsecret',
  'client_secret',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'token',
  'secret',
  'password',
  'ssn',
  'taxidentifier',
  'tax_identifier',
])

function redactTransition(transition: Transition): Transition {
  switch (transition.mode) {
    case 'SUBMIT':
      return transition.params === undefined
        ? transition
        : { ...transition, params: redactParams(transition.params) }
    case 'AWAIT':
      return transition.poll.params === undefined
        ? transition
        : {
            ...transition,
            poll: {
              ...transition.poll,
              params: redactParams(transition.poll.params),
            },
          }
    case 'CLIENT_SURFACE':
      return transition.report.params === undefined
        ? transition
        : {
            ...transition,
            report: {
              ...transition.report,
              params: redactParams(transition.report.params),
            },
          }
  }
}

function redactParams(params: TransitionParams): TransitionParams {
  return redactByName(params) as TransitionParams
}

function redactByName(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(redactByName)
  }
  if (value === null || typeof value !== 'object') {
    return value
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      SENSITIVE_PARAM_NAMES.has(key.toLowerCase())
        ? REDACTED
        : redactByName(inner as JsonValue),
    ]),
  )
}

function redactState(state: FlowState): FlowState {
  // Both carriers, independently: today no state has a surface AND
  // instructions (they are separate PAYMENT phases), but an either/or would
  // leak the second the contract adds one that does.
  let redacted = state
  if ('surface' in redacted && redacted.surface !== undefined) {
    redacted = { ...redacted, surface: redactSurface(redacted.surface) }
  }
  if ('instructions' in redacted) {
    redacted = {
      ...redacted,
      instructions: redactInstructions(redacted.instructions),
    }
  }
  return redacted
}

/**
 * Params that say which screen a surface is, not whose: without them a logged surface can't be
 * drawn again. Kept only while they read as names (no digits), so a secret never rides along.
 */
const SHAPE_PARAMS = new Set(['action', 'allowedCalls', 'resultFields'])
const NAME = /^[A-Za-z_]{1,40}$/

function isNameLike(value: unknown): boolean {
  return Array.isArray(value)
    ? value.every((item) => typeof item === 'string' && NAME.test(item))
    : typeof value === 'string' && NAME.test(value)
}

function redactSurface(surface: Surface): Surface {
  return {
    ...surface,
    params: Object.fromEntries(
      Object.entries(surface.params).map(([key, value]) => [
        key,
        SHAPE_PARAMS.has(key) && isNameLike(value) ? value : REDACTED,
      ]),
    ),
  }
}

function redactInstructions(instructions: Instructions): Instructions {
  switch (instructions.kind) {
    case 'BANK_FIELDS':
      // Ids and labels are the useful half — they say which fields the user was
      // shown without saying whose account they name.
      return {
        ...instructions,
        fields: instructions.fields.map((field) => ({
          ...field,
          value: REDACTED,
        })),
      }
    case 'REFERENCE':
      return { ...instructions, code: REDACTED }
    case 'DEEPLINK':
    case 'QR_IMAGE':
      return { ...instructions, url: withoutQuery(instructions.url) }
  }
}

/**
 * Keeps the destination, drops everything after it: provider URLs carry the
 * session in the query string or fragment.
 *
 * Hand-parsed rather than via `URL` — Hermes ships an incomplete implementation,
 * and this is a substring either way.
 */
function withoutQuery(url: string): string {
  const cut = url.search(/[?#]/)
  if (cut === -1) {
    return url
  }
  // Separator kept so the log says which part was dropped.
  return `${url.slice(0, cut + 1)}${REDACTED}`
}
