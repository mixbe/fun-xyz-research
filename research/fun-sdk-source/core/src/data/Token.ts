import { type Address, formatUnits, isAddress, parseUnits } from 'viem'

import {
  ErrorCode,
  InternalFailureError,
  InvalidParameterError,
} from '@funkit/utils'
import { ERC20_CONTRACT_INTERFACE, type TransactionParams } from '../common'
import type { EnvOption } from '../config'
import { getTokenAddressBySymbolAndChainId } from '../utils'
import type { Chain } from './Chain'

const wrappedNativeTokens = {
  eth: 'weth',
  matic: 'wmatic',
  pol: 'wpol',
  mnt: 'wmnt',
}

export class Token {
  address?: Address
  chain: Chain
  isNative = false
  symbol = ''

  constructor(input: Address | string, chain: Chain) {
    this.chain = chain

    if (isAddress(input)) {
      this.address = input
      return
    }

    if (input.toLowerCase() in wrappedNativeTokens) {
      this.isNative = true
    }

    this.symbol = input.toLowerCase()
  }

  async getAddress(options?: EnvOption): Promise<Address> {
    const chainId = await this.chain.getChainId(options)

    if (this.isNative) {
      const nativeName = wrappedNativeTokens[this.symbol]
      return await getTokenAddressBySymbolAndChainId(
        nativeName,
        chainId,
        options,
      )
    }
    if (this.address) {
      return this.address
    }
    if (this.symbol) {
      return await getTokenAddressBySymbolAndChainId(
        this.symbol,
        chainId,
        options,
      )
    }
    throw new InternalFailureError(
      ErrorCode.ServerMissingData,
      'server missing token symbol and address info',
      '',
      { symbol: this.symbol, address: this.address, isNative: this.isNative },
      'Please check token symbol and address. If things look correct, contract fun support for help',
      'https://docs.fun.xyz',
    )
  }

  async getDecimals(options?: EnvOption): Promise<bigint> {
    if (this.isNative) {
      return 18n
    }
    return await ERC20_CONTRACT_INTERFACE.readFromChain(
      await this.getAddress(options),
      'decimals',
      [],
      this.chain,
      options,
    )
  }

  async getBalance(address: Address, options?: EnvOption): Promise<string> {
    const amount = await this.getBalanceBN(address, options)
    const decimals = await this.getDecimals(options)
    return formatUnits(amount, Number(decimals))
  }

  async getBalanceBN(address: Address, options?: EnvOption): Promise<bigint> {
    const chain = this.chain
    let amount = 0n
    if (this.isNative) {
      const client = await chain.getClient(options)
      amount = await client.getBalance({ address })
    } else {
      amount = await ERC20_CONTRACT_INTERFACE.readFromChain(
        await this.getAddress(options),
        'balanceOf',
        [address],
        chain,
        options,
      )
    }
    return amount
  }

  async getApproval(
    owner: string,
    spender: string,
    options?: EnvOption,
  ): Promise<bigint> {
    if (this.isNative) {
      throw new InvalidParameterError(
        ErrorCode.InvalidParameter,
        'Native token can not approve',
        'Native token can not approve',
        { isNative: this.isNative },
        'No need to approve native token',
        'https://docs.fun.xyz',
      )
    }
    const chain = this.chain
    return BigInt(
      await ERC20_CONTRACT_INTERFACE.readFromChain(
        await this.getAddress(options),
        'allowance',
        [owner, spender],
        chain,
        options,
      ),
    )
  }

  async getDecimalAmount(
    amount: number | string,
    options?: EnvOption,
  ): Promise<bigint> {
    const decimals = await this.getDecimals(options)
    return parseUnits(`${amount}`, Number(decimals))
  }

  async approve(
    spender: string,
    amount: number,
    options?: EnvOption,
  ): Promise<TransactionParams> {
    const amountDec = await this.getDecimalAmount(amount, options)
    const calldata = ERC20_CONTRACT_INTERFACE.encodeTransactionParams(
      await this.getAddress(options),
      'approve',
      [spender, amountDec],
    )
    // TODO: Check if picking precise keys is actually needed
    const { to, data, value } = calldata
    return { to, data, value }
  }

  async transfer(
    spender: string,
    amount: number,
    options?: EnvOption,
  ): Promise<TransactionParams> {
    const amountDec = await this.getDecimalAmount(amount, options)
    return ERC20_CONTRACT_INTERFACE.encodeTransactionParams(
      await this.getAddress(options),
      'transfer',
      [spender, amountDec],
    )
  }

  static async getAddress(
    data: string,
    chain: Chain,
    options?: EnvOption,
  ): Promise<Address> {
    const token = new Token(data, chain)
    return await token.getAddress(options)
  }

  static async getDecimals(
    data: string,
    chain: Chain,
    options?: EnvOption,
  ): Promise<bigint> {
    const token = new Token(data, chain)
    return await token.getDecimals(options)
  }

  static async getBalance(
    data: string,
    address: Address,
    chain: Chain,
    options?: EnvOption,
  ): Promise<string> {
    const token = new Token(data, chain)
    return await token.getBalance(address, options)
  }

  static async getBalanceBN(
    data: string,
    address: Address,
    chain: Chain,
    options?: EnvOption,
  ): Promise<bigint> {
    const token = new Token(data, chain)
    return await token.getBalanceBN(address, options)
  }

  static async getApproval(
    data: string,
    owner: string,
    spender: string,
    chain: Chain,
    options?: EnvOption,
  ): Promise<bigint> {
    const token = new Token(data, chain)
    return await token.getApproval(owner, spender, options)
  }

  static async getDecimalAmount(
    data: string,
    amount: number,
    chain: Chain,
    options?: EnvOption,
  ): Promise<bigint> {
    const token = new Token(data, chain)
    return await token.getDecimalAmount(amount, options)
  }

  static async approve(
    data: string,
    spender: string,
    amount: number,
    chain: Chain,
    options?: EnvOption,
  ): Promise<TransactionParams> {
    const token = new Token(data, chain)
    return await token.approve(spender, amount, options)
  }

  static async transfer(
    data: string,
    spender: string,
    amount: number,
    chain: Chain,
    options?: EnvOption,
  ): Promise<TransactionParams> {
    const token = new Token(data, chain)
    return await token.transfer(spender, amount, options)
  }

  static isNative(data: string): boolean {
    return data.toLowerCase() in wrappedNativeTokens
  }
}
