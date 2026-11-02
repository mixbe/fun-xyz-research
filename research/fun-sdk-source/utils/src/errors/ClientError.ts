import { safeParseJson } from '../utils/json'
import { BaseError } from './BaseError'
import FWErrorsJson from './errors.json'
import { ErrorBaseType, ErrorCode, ErrorType } from './types'
export class ClientError extends BaseError {
  constructor(
    type: string,
    code: string,
    msg: string,
    rawMessage: string,
    paramsUsed: unknown,
    fixSuggestion: string,
    docLink: string,
  ) {
    super(
      ErrorBaseType.ClientError,
      type,
      code,
      msg,
      rawMessage,
      paramsUsed,
      fixSuggestion,
      docLink,
      false,
    )
  }
}

export class InvalidParameterError extends ClientError {
  constructor(
    code: string,
    msg: string,
    rawMessage: string,
    paramsUsed: unknown,
    fixSuggestion: string,
    docLink: string,
  ) {
    super(
      ErrorType.InvalidParameter,
      code,
      msg,
      rawMessage,
      paramsUsed,
      fixSuggestion,
      docLink,
    )
  }
}

export class ResourceNotFoundError extends ClientError {
  constructor(
    code: string,
    msg: string,
    rawMessage: string,
    paramsUsed: unknown,
    fixSuggestion: string,
    docLink: string,
  ) {
    if (msg.includes('Chain name not found')) {
      // biome-ignore lint/suspicious/noExplicitAny: <if the message isn't a human-readable string but a stringified json we'll have the `reqId` param>
      const { reqId } = safeParseJson<any>(msg)
      super(
        ErrorType.ResourceNotFound,
        ErrorCode.ChainNotSupported,
        ': Chain name not found or not supported.',
        rawMessage,
        { reqId },
        'Change your EnvOptions to the correct chain identifier.',
        docLink,
      )
    } else {
      super(
        ErrorType.ResourceNotFound,
        code,
        msg,
        rawMessage,
        paramsUsed,
        fixSuggestion,
        docLink,
      )
    }
  }
}

export class ThrottlingError extends ClientError {
  constructor(
    code: string,
    msg: string,
    rawMessage: string,
    paramsUsed: unknown,
    fixSuggestion: string,
    docLink: string,
  ) {
    super(
      ErrorType.ThrottlingError,
      code,
      msg,
      rawMessage,
      paramsUsed,
      fixSuggestion,
      docLink,
    )
  }
}

export class AccessDeniedError extends ClientError {
  constructor(
    code: string,
    msg: string,
    rawMessage: string,
    paramsUsed: unknown,
    fixSuggestion: string,
    docLink: string,
  ) {
    super(
      ErrorType.AccessDeniedError,
      code,
      msg,
      rawMessage,
      paramsUsed,
      fixSuggestion,
      docLink,
    )
  }
}

const FWErrors: { [code in string]?: { info: string; suggestion: string } } =
  FWErrorsJson

export class UserOpFailureError extends ClientError {
  constructor(
    code: string,
    msg: string,
    rawMessage: string,
    paramsUsed: unknown,
    fixSuggestion: string,
    docLink: string,
  ) {
    const FWCode = findFWContractError(msg)
    if (FWCode && FWErrors[FWCode]) {
      // biome-ignore lint/suspicious/noExplicitAny: <if the message isn't a human-readable string but a stringified json we'll have the `reqId` param>
      const { reqId } = safeParseJson<any>(msg)
      super(
        ErrorType.UserOpFailureError,
        ErrorCode.FunWalletErrorCode,
        FWErrors[FWCode].info,
        rawMessage,
        { reqId },
        FWErrors[FWCode].suggestion,
        docLink,
      )
    } else {
      super(
        ErrorType.UserOpFailureError,
        code,
        msg,
        rawMessage,
        paramsUsed,
        fixSuggestion,
        docLink,
      )
    }
  }
}

const findFWContractError = (msg: string) => {
  let match = msg.match(/FW\d{3}/)
  if (!match) {
    match = msg.match(/AA\d./)
  }
  return match?.[0]
}
