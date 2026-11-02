import { ClientError, ErrorType } from '@funkit/utils'

export class InvalidActionError extends ClientError {
  constructor(
    code: string,
    msg: string,
    paramsUsed: unknown,
    fixSuggestion: string,
    docLink: string,
  ) {
    super(
      ErrorType.InvalidAction,
      code,
      msg,
      msg,
      paramsUsed,
      fixSuggestion,
      docLink,
    )
  }
}
