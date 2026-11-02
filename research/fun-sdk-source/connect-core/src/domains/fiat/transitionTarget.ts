import type {
  FiatEndpoint,
  Transition,
  TransitionParams,
} from '@fun-xyz/fiat-contract/types'

/** Where a transition sends, at one depth whatever its mode. */
export interface TransitionTarget {
  endpoint: FiatEndpoint
  params: TransitionParams
}

/**
 * Resolves the two fields every mode has, from the three places the contract
 * puts them.
 *
 * SUBMIT carries `endpoint`/`params` flat; AWAIT and CLIENT_SURFACE nest them in
 * the spec they need anyway (`poll` adds timing, `report` adds `expects`). So
 * the shape is asymmetric on purpose, but the asymmetry is the transport's
 * problem to absorb once, not something every caller should branch on.
 *
 * The switch is exhaustive: a fourth mode fails to compile here rather than
 * silently posting to nowhere.
 */
export function transitionTarget(transition: Transition): TransitionTarget {
  switch (transition.mode) {
    case 'SUBMIT':
      return { endpoint: transition.endpoint, params: transition.params ?? {} }
    case 'AWAIT':
      return {
        endpoint: transition.poll.endpoint,
        params: transition.poll.params ?? {},
      }
    case 'CLIENT_SURFACE':
      return {
        endpoint: transition.report.endpoint,
        params: transition.report.params ?? {},
      }
  }
}
