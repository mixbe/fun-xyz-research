import type {
  FiatEndpoint,
  FiatSession,
  FiatStepResponse,
  FlowState,
} from '@fun-xyz/fiat-contract/types'

/** Fun's own email login, for a customer whose host mints no identity assertion. */
export type FunAuthState = Extract<FlowState, { kind: 'FUN_AUTH' }>

/** The transition that sends the typed email and asks for a code. */
export const FUN_AUTH_START_ID = 'start'

export const FUN_AUTH_START_ENDPOINT = 'POST /fiat/auth' satisfies FiatEndpoint
export const FUN_AUTH_VERIFY_ENDPOINT =
  'POST /fiat/auth/verify' satisfies FiatEndpoint
/** Called by the SDK's session store; the server never offers it as a transition. */
export const FUN_AUTH_REFRESH_ENDPOINT =
  'POST /fiat/auth/refresh' satisfies FiatEndpoint
/** Called by the SDK's session store; the server never offers it as a transition. */
export const FUN_AUTH_REVOKE_ENDPOINT =
  'POST /fiat/auth/revoke' satisfies FiatEndpoint

export function isFunAuthState(
  state: FlowState | undefined,
): state is FunAuthState {
  return state?.kind === 'FUN_AUTH'
}

/**
 * The Fun session a VERIFIED response carries, or `undefined`.
 *
 * - Absent on a VERIFIED that only confirmed an attribute for a user who
 *   already holds a customer assertion.
 */
export function sessionOf(
  stepResponse: FiatStepResponse | undefined,
): FiatSession | undefined {
  if (
    stepResponse === undefined ||
    !isFunAuthState(stepResponse.state) ||
    stepResponse.state.phase !== 'VERIFIED' ||
    !('session' in stepResponse)
  ) {
    return undefined
  }
  return stepResponse.session
}
