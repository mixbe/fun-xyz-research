import type { HandleError, PartialAttemptOptions } from '@lifeomic/attempt'

import {
  InvalidParameterError,
  ResourceNotFoundError,
  UserOpFailureError,
} from '@funkit/utils'

const errorHandler: HandleError<unknown> = (err, context) => {
  if (
    err instanceof ResourceNotFoundError ||
    err instanceof InvalidParameterError ||
    err instanceof UserOpFailureError
  ) {
    context.abort()
  }
}

// biome-ignore lint/suspicious/noExplicitAny: default options are compatible with any type
export const DEFAULT_RETRY_OPTIONS: PartialAttemptOptions<any> = {
  delay: 100,
  initialDelay: 0,
  maxDelay: 3000,
  factor: 2,
  maxAttempts: 5,
  timeout: 0,
  jitter: true,
  minDelay: 0,
  handleError: errorHandler,
  handleTimeout: null,
  beforeAttempt: null,
  calculateDelay: null,
}
