import type { FiatStepResponse } from '@fun-xyz/fiat-contract/types'

import type { FunLogger } from '~/utils/funLogger'
import { REDACTED, redactSensitive } from './redactSensitive'

/**
 * The redactor a fiat request logs its bodies through. A debug logger — a
 * development build, or a host that asked for `debug` — gets them whole: the
 * tokens and typed-in values are the developer's own, and a scrubbed body is
 * what stands between them and the bug they are chasing.
 */
export function fiatLogRedactor(
  logger: Pick<FunLogger, 'isDebug'>,
): (value: unknown) => unknown {
  return logger.isDebug ? passThrough : redactFiatBodyForLog
}

const passThrough = (value: unknown): unknown => value

/**
 * The transport's `redactBodyForLog` for the fiat surface.
 *
 * Responses are envelopes — redacted, they keep the state/status detail that
 * makes a log worth having. Anything else (a request body carrying typed-in
 * KYC or OTP values) has no diagnostic value beyond its presence, so it is
 * dropped wholesale rather than scrubbed field-by-field.
 */
export function redactFiatBodyForLog(value: unknown): unknown {
  if (isFiatStepResponseShaped(value)) {
    return redactSensitive(value)
  }
  if (value === undefined || value === null) {
    return value
  }
  return REDACTED
}

function isFiatStepResponseShaped(
  value: unknown,
): value is Pick<FiatStepResponse, 'state'> {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const state = (value as { state?: unknown }).state
  return typeof state === 'object' && state !== null && 'kind' in state
}
