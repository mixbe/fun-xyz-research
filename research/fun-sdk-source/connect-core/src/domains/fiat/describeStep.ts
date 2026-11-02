import { TRANSITION_TABLE } from '@fun-xyz/fiat-contract/table'
import type { FiatStepResponse } from '@fun-xyz/fiat-contract/types'

import { knownStateKey } from './computePage'
import { isFunAuthState } from './funAuth'

/**
 * What a transition landed on, in fields safe to log.
 *
 * - The state reached, what it left to press, and any refusal — never the
 *   envelope, and never a transition's params.
 */
export function describeStep(
  stepResponse: FiatStepResponse,
): Record<string, string> {
  const { state } = stepResponse
  const error = 'error' in state ? state.error : undefined
  return {
    state: state.kind,
    ...('phase' in state && typeof state.phase === 'string'
      ? { phase: state.phase }
      : {}),
    ...('channel' in state && typeof state.channel === 'string'
      ? { channel: state.channel }
      : {}),
    ...(error === undefined ? {} : { errorCode: error.code ?? '-' }),
    next: stepResponse.transitions.map(({ id }) => id).join(',') || '-',
  }
}

/**
 * `GET /fiat/orders/o_31c` becomes `GET /fiat/orders/:id`.
 *
 * - Bodies are redacted wholesale here, so a ref reaching a log line through
 *   the path is the same value arriving by another door.
 */
export function endpointShape(endpoint: string): string {
  return endpoint
    .split('/')
    .map((segment) => (IDENTIFIER.test(segment) ? ':id' : segment))
    .join('/')
}

// Server-minted handles: `qr_…`, `q_…`, `o_…`, `dlv_…`, and bare uuids.
const IDENTIFIER =
  /^(?:[a-z]{1,3}_\S+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

/**
 * A step that should have offered a way on and did not.
 *
 * - The table says which states may legally carry none — `BLOCKED` and a
 *   rejection are endings, `ON_HOLD` simply has no button. Asking it beats a
 *   hand-kept list that silently rots as states are added.
 * - `FUN_AUTH` is keyed once for three phases, and the table allows its
 *   transitions for the phases that collect something; VERIFIED closes the
 *   step with none.
 * - So this is the server contradicting its own contract, which is why it is
 *   worth a warning rather than a note.
 */
export function isDeadEnd(stepResponse: FiatStepResponse): boolean {
  if (stepResponse.transitions.length > 0) {
    return false
  }
  const { state } = stepResponse
  if (isFunAuthState(state) && state.phase === 'VERIFIED') {
    return false
  }
  // A kind this build predates has no table row to contradict; its screen
  // already reports it as unsupported.
  const key = knownStateKey(state)
  if (key === undefined) {
    return false
  }
  const allowed = TRANSITION_TABLE[key]?.allowedTransitions ?? []
  return allowed.length > 0
}
