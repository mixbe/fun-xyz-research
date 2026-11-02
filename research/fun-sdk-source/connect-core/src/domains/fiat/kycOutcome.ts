import type { FiatStepResponse } from '@fun-xyz/fiat-contract/types'

/**
 * How a resolved identity check leaves the buyer, as the deposit screen has to
 * say it.
 *
 * - `pending` — still being read; the old limit stands.
 * - `soft` — correctable, so there is something to try again.
 * - `hard` — refused, and no retry will change it.
 */
export type KycOutcome = 'pending' | 'soft' | 'hard'

export interface KycResolution {
  outcome: KycOutcome
  /** When the buyer may try again; `ON_HOLD` is the only reason that sets it. */
  retryAfter?: string
}

/**
 * The verdict a resolved `KYC` state carries, or `undefined` while the flow is
 * anywhere else. Pure: the `complete` outcome is the client's to derive, since
 * nothing in a single response says the check just passed.
 */
export function selectKycOutcome(
  state: FiatStepResponse['state'] | undefined,
): KycResolution | undefined {
  if (state?.kind !== 'KYC') {
    return undefined
  }
  // A form asked for again after a decline is the contract's correctable
  // outcome ("Correctable outcomes return CAPTURE or INPUT_REQUIRED"). The
  // error's presence is the signal; `code` is a copy key, not a branch.
  if (state.phase === 'INPUT_REQUIRED') {
    return state.error === undefined ? undefined : { outcome: 'soft' }
  }
  if (state.phase !== 'NO_ACTION_REQUIRED') {
    return undefined
  }
  if (state.reason === 'IN_REVIEW') {
    return { outcome: 'pending' }
  }
  if (state.reason === 'ON_HOLD') {
    return { outcome: 'soft', retryAfter: state.retryAfter }
  }
  // A rejection the provider itself calls retryable is correctable; anything
  // it files under KYC_REJECTED is the refusal, whatever the flag says.
  const { retryable, category } = state.failureReason ?? {}
  return retryable === true && category !== 'KYC_REJECTED'
    ? { outcome: 'soft' }
    : { outcome: 'hard' }
}
