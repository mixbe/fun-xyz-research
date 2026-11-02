/** A host callback that did not settle in the time it was given. */
export class HostTimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`Host callback timed out after ${timeoutMs} ms`)
    this.name = 'HostTimeoutError'
  }
}

/**
 * Rejects with {@link HostTimeoutError} if the host's promise hasn't settled
 * in time, so a callback that never answers shows as a failure the user can
 * retry, not endless loading. The host's own work isn't cancelled; its late
 * answer is ignored.
 */
export async function withHostTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new HostTimeoutError(timeoutMs)),
          timeoutMs,
        )
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
