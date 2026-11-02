import type { PollSpec } from '@fun-xyz/fiat-contract/types'
import { defaultCalculateDelay, retry } from '@lifeomic/attempt'

/** Thrown to mean "same state, ask again" — `retry`'s signal to run again. */
class KeepPolling extends Error {}

const ABORTED = 'ATTEMPT_ABORTED'

export interface SchedulePollHandlers {
  /**
   * Runs one poll. Resolving `false` stops the schedule — the caller decides,
   * because "did the flow move on" is a question about the envelope this module
   * deliberately does not read.
   */
  onPoll: () => boolean | Promise<boolean>
  /** The deadline passed with the flow still on this state. */
  onGiveUp?: () => void
  /** A poll failed, or the spec was unusable. A failed request does not stop the schedule. */
  onError?: (error: unknown) => void
}

/**
 * Polls `spec` until the caller stops it, the deadline passes, or the returned
 * canceller is called. Always call the canceller on unmount.
 */
export function schedulePoll(
  spec: PollSpec,
  handlers: SchedulePollHandlers,
): () => void {
  const startedAt = Date.now()
  let cancelled = false

  const deadline = spec.giveUpAfterMs ?? Number.POSITIVE_INFINITY

  void retry(
    async () => {
      const keepGoing = await handlers.onPoll()
      if (keepGoing) {
        throw new KeepPolling()
      }
    },
    {
      ...attemptOptionsFor(spec),
      // Backoff and jitter stay the library's; the only override is the last
      // wait, clamped to what is left of the deadline so give-up lands ON it
      // rather than up to one full interval late.
      calculateDelay: (context, attemptOptions) => {
        const remaining = deadline - (Date.now() - startedAt)
        const next =
          context.attemptNum === 0
            ? attemptOptions.initialDelay
            : defaultCalculateDelay(context, attemptOptions)
        return Math.max(Math.min(next, remaining), 0)
      },
      // The only two ways this loop ends on its own: the caller cancelled, or
      // the envelope's deadline passed with the flow still on this state.
      beforeAttempt: (context) => {
        if (cancelled || Date.now() - startedAt >= deadline) {
          context.abort()
        }
      },
      handleError: (error) => {
        if (!(error instanceof KeepPolling)) {
          handlers.onError?.(error)
        }
      },
    },
  ).catch((error: unknown) => {
    if (cancelled) {
      return
    }
    if (isAborted(error)) {
      handlers.onGiveUp?.()
      return
    }
    // `retry` validates its own numbers and throws before the first attempt, so
    // a spec outside the contract's bounds surfaces here. Reported rather than
    // swallowed: the alternative is a poll that silently never starts.
    handlers.onError?.(error)
  })

  return () => {
    cancelled = true
  }
}

/**
 * Translates a `PollSpec` into `retry` options.
 *
 * The numbers pass through untouched. The contract bounds them — whole, inside
 * the platform timer range, `backoffFactor >= 1`, and `maxIntervalMs` required
 * alongside a factor and never below `intervalMs` — so sanitising here would
 * only hide an emission that is already invalid.
 */
export function attemptOptionsFor(spec: PollSpec) {
  return {
    delay: spec.intervalMs,
    // The first poll lands one interval in, not immediately.
    initialDelay: spec.intervalMs,
    // The jitter window's floor, so no attempt polls faster than asked.
    minDelay: spec.intervalMs,
    maxDelay: spec.maxIntervalMs ?? spec.intervalMs,
    factor: spec.backoffFactor ?? 1,
    // Full jitter, so clients waiting on the same order after an outage do not
    // come back in lockstep.
    jitter: true,
    // Unbounded: `giveUpAfterMs` is the bound, and it is wall-clock.
    maxAttempts: 0,
  }
}

const isAborted = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { code?: string }).code === ABORTED
