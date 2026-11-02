import type { PartialAttemptOptions } from '@lifeomic/attempt'

import { errorAbortHandler } from '../utils/error'

export type BaseResponse = unknown

export type RetryOptions<T = BaseResponse> = PartialAttemptOptions<T>

export const DEFAULT_RETRY_OPTIONS = {
  delay: 100,
  initialDelay: 0,
  maxDelay: 3000,
  factor: 2,
  maxAttempts: 2,
  timeout: 0,
  jitter: true,
  minDelay: 0,
  handleError: errorAbortHandler,
  handleTimeout: null,
  beforeAttempt: null,
  calculateDelay: null,
} as RetryOptions
