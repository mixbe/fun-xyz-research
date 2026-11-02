import { type Address, type Hex, isAddress, parseEther } from 'viem'

import { ErrorCode, InvalidParameterError } from '@funkit/utils'
import { ERC20_CONTRACT_INTERFACE, type TransactionParams } from '../common'
import type { EnvOption } from '../config'
import { Token } from '../data'
import { Chain } from '../data/Chain'
import type {
  ApproveERC20Params,
  ApproveParams,
  TokenTransferParams,
  TransferParams,
} from './types'

export const isTokenTransferParams = (
  obj: TransferParams,
): obj is TokenTransferParams => {
  return 'amount' in obj && 'token' in obj && 'to' in obj
}

export const tokenTransferTransactionParams = async (
  params: TokenTransferParams,
  chain: Chain,
  options?: EnvOption,
): Promise<TransactionParams> => {
  const { to, amount, token } = params
  if (!isAddress(to)) {
    throw new InvalidParameterError(
      ErrorCode.InvalidParameter,
      'To address is not a valid address, please make sure it is a valid checksum address.',
      'To address is not a valid address, please make sure it is a valid checksum address.',
      { params },
      'Please make sure it is a valid checksum address',
      'https://docs.fun.xyz',
    )
  }
  const tokenObj = new Token(token, chain)
  if (tokenObj.isNative) {
    return {
      to: to as Address,
      data: '0x' as Hex,
      value: parseEther(`${amount}`),
    }
  }

  const tokenAddr = await tokenObj.getAddress(options)
  if (!tokenAddr) {
    throw new InvalidParameterError(
      ErrorCode.TokenNotFound,
      'Token address not found. Please check the token passed in.',
      'Token address not found. Please check the token passed in.',
      { params },
      'Provide correct token.',
      'https://docs.fun.xyz',
    )
  }
  const convertedAmount = await tokenObj.getDecimalAmount(amount, options)
  return ERC20_CONTRACT_INTERFACE.encodeTransactionParams(
    tokenAddr,
    'transfer',
    [to, convertedAmount],
  )
}

export const tokenTransferFromTransactionParams = async (
  params: TokenTransferParams,
  chain: Chain,
  options?: EnvOption,
): Promise<TransactionParams> => {
  const { to, amount, token, from } = params
  if (!isAddress(to ?? '') || !isAddress(from ?? '')) {
    throw new InvalidParameterError(
      ErrorCode.InvalidParameter,
      'To/from address is not a valid address, please make sure it is a valid checksum address.',
      'To/from address is not a valid address, please make sure it is a valid checksum address.',
      { params },
      'Please make sure it is a valid checksum address',
      'https://docs.fun.xyz',
    )
  }
  const tokenObj = new Token(token, chain)
  if (tokenObj.isNative) {
    return {
      to: to as Address,
      data: '0x' as Hex,
      value: parseEther(`${amount}`),
    }
  }

  const tokenAddr = await tokenObj.getAddress(options)
  if (!tokenAddr) {
    throw new InvalidParameterError(
      ErrorCode.TokenNotFound,
      'Token address not found. Please check the token passed in.',
      'Token address not found. Please check the token passed in.',
      { params },
      'Provide correct token.',
      'https://docs.fun.xyz',
    )
  }
  const convertedAmount = await tokenObj.getDecimalAmount(amount, options)
  return ERC20_CONTRACT_INTERFACE.encodeTransactionParams(
    tokenAddr,
    'transferFrom',
    [from, to, convertedAmount],
  )
}

export const isERC20ApproveParams = (
  obj: ApproveParams,
): obj is ApproveERC20Params => {
  return 'amount' in obj && 'token' in obj
}

export const erc20ApproveTransactionParams = async (
  params: ApproveERC20Params,
  options?: EnvOption,
): Promise<TransactionParams> => {
  const { spender, amount, token } = params
  if (!isAddress(spender ?? '')) {
    throw new InvalidParameterError(
      ErrorCode.InvalidParameter,
      'Spender address is not a valid address, please make sure it is a valid checksum address.',
      'Spender address is not a valid address, please make sure it is a valid checksum address.',
      { params },
      'Please make sure it is a valid checksum address',
      'https://docs.fun.xyz',
    )
  }

  // TODO: remove this fallback after refactoring -- Panda
  const chain = await Chain.getChain(
    { chainIdentifier: globalThis.globalEnvOption.chain },
    options,
  )
  const tokenObj = new Token(token, chain)
  const convertedAmount = await tokenObj.getDecimalAmount(amount, options)
  return ERC20_CONTRACT_INTERFACE.encodeTransactionParams(
    await tokenObj.getAddress(options),
    'approve',
    [spender, convertedAmount],
  )
}
