import type { FiatReadEndpoint } from '@funkit/api-base'
import type {
  FiatEndpoint,
  PollSpec,
  Transition,
} from '@fun-xyz/fiat-contract/types'

export type SubmitTransition = Extract<Transition, { mode: 'SUBMIT' }>
export type AwaitTransition = Extract<Transition, { mode: 'AWAIT' }>
export type SurfaceTransition = Extract<Transition, { mode: 'CLIENT_SURFACE' }>

export interface TransitionDispatch {
  /** Every SUBMIT, in emitted order — the buttons a screen renders. */
  ctas: SubmitTransition[]
  /** At most one AWAIT; a second would mean two pollers on one state. */
  poll?: AwaitTransition
  /** At most one CLIENT_SURFACE; the surface owns the screen while it runs. */
  surface?: SurfaceTransition
}

/**
 * Splits `transitions[]` by mode so screens never inspect the array.
 *
 * Mode is the whole dispatch: SUBMIT is something the user does, AWAIT is
 * something the client waits for, CLIENT_SURFACE is something a provider runs.
 * A screen that filtered the array itself would be free to disagree with the
 * harness about which is which.
 *
 * Extra AWAIT or CLIENT_SURFACE entries are ignored rather than merged — the
 * first wins, deterministically, because running two pollers or mounting two
 * surfaces is worse than ignoring an emission the contract does not produce.
 */
export function selectTransitions(
  transitions: readonly Transition[],
): TransitionDispatch {
  const ctas = transitions.filter(isSubmit)
  const poll = transitions.find(isAwait)
  const surface = transitions.find(isSurface)

  return {
    ctas,
    ...(poll === undefined ? {} : { poll }),
    ...(surface === undefined ? {} : { surface }),
  }
}

/**
 * Builds a poll's request endpoint, with its params as a query string.
 *
 * Polls are GETs, so their `params` cannot ride in a body — and the recorded
 * `GET /fiat/quotes/{ref}` poll carries one. Encoded here rather than in the
 * transport, which takes the endpoint whole and stays free of the contract.
 *
 * Returns the read type: a poll that arrived as anything but a GET is a
 * contract violation, and the transport would refuse it for want of an
 * idempotency key it has no business minting for a read.
 */
export function buildPollEndpoint(poll: PollSpec): FiatReadEndpoint {
  if (!poll.endpoint.startsWith('GET ')) {
    throw new Error(`fiat poll endpoint is not a read: ${poll.endpoint}`)
  }
  const entries = Object.entries(poll.params ?? {}).filter(
    ([, value]) => value !== null && typeof value !== 'object',
  )
  if (entries.length === 0) {
    return poll.endpoint as FiatReadEndpoint
  }

  const query = entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&')

  return `${poll.endpoint}?${query}` as FiatReadEndpoint
}

const isSubmit = (t: Transition): t is SubmitTransition => t.mode === 'SUBMIT'
const isAwait = (t: Transition): t is AwaitTransition => t.mode === 'AWAIT'
const isSurface = (t: Transition): t is SurfaceTransition =>
  t.mode === 'CLIENT_SURFACE'
