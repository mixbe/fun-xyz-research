import {
  InvalidParameterError,
  ResourceNotFoundError,
  UserOpFailureError,
} from '@funkit/utils'
import type { AttemptContext } from '@lifeomic/attempt'

export const errorAbortHandler = (err: Error, context: AttemptContext) => {
  if (
    err instanceof ResourceNotFoundError ||
    err instanceof InvalidParameterError ||
    err instanceof UserOpFailureError
  ) {
    context.abort()
  }
}

export const serializeHeaders = (headers: Headers) => {
  const headersObject: Record<string, string> = {}
  headers.forEach((value, key) => {
    headersObject[key] = value
  })
  return headersObject
}
