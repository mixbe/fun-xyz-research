import { type Address, concat } from 'viem'

import { PaymasterType } from '@funkit/api-base'
import { ErrorCode, ResourceNotFoundError } from '@funkit/utils'
import {
  GASLESS_PAYMASTER_CONTRACT_INTERFACE,
  GASLESS_SPONSOR_SUPPORT_CHAINS,
  type TransactionParams,
} from '../common'
import type { EnvOption } from '../config'
import { Chain, Token } from '../data'
import { Sponsor } from './Sponsor'
export class GaslessSponsor extends Sponsor {
  constructor(options: EnvOption = globalThis.globalEnvOption) {
    super(
      options,
      GASLESS_PAYMASTER_CONTRACT_INTERFACE,
      'gaslessPaymasterAddress',
      PaymasterType.GaslessSponsor,
    )
  }

  async getFunSponsorAddress(
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<Address> {
    if (!this.sponsorAddress) {
      const chain = await Chain.getChain(
        { chainIdentifier: options.chain },
        options,
      )
      if (
        GASLESS_SPONSOR_SUPPORT_CHAINS.includes(await chain.getChainId(options))
      ) {
        this.sponsorAddress = await chain.getAddress(
          'funGaslessSponsorAddress',
          options,
        )
      } else {
        throw new ResourceNotFoundError(
          ErrorCode.MissingParameter,
          'The network you are working with does not support gasless Fun Sponsor. You will need to run and manage your own gasless sponsor.',
          'The network you are working with does not support gasless Fun Sponsor. You will need to run and manage your own gasless sponsor.',
          {
            gaslessSponsorSupportChains: GASLESS_SPONSOR_SUPPORT_CHAINS,
            chain: await chain.getChainId(options),
          },
          'Manage your own gasless sponsor, or use a supported network.',
          'https://docs.fun.xyz',
        )
      }
    }
    return this.sponsorAddress
  }

  async getPaymasterAndData(
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<string> {
    const paymasterAddress = await this.getPaymasterAddress(options)
    const sponsor = await this.getFunSponsorAddress(options)
    return concat([paymasterAddress, sponsor])
  }

  async stake(
    sponsor: Address,
    amount: number,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const amountdec = await Token.getDecimalAmount(
      'eth',
      amount,
      chain,
      options,
    )
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'addDepositTo',
      [sponsor, amountdec],
      BigInt(amountdec),
    )
  }

  async unstake(
    receiver: Address,
    amount: number,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const amountdec = await Token.getDecimalAmount(
      'eth',
      amount,
      chain,
      options,
    )
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'withdrawDepositTo',
      [receiver, amountdec],
    )
  }

  async getUnlockBlock(
    sponsor: Address,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<number> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getUnlockBlock',
      [sponsor],
      chain,
      options,
    )
  }

  async getLockState(
    sponsor: Address,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<boolean> {
    const unlockBlock = Number(await this.getUnlockBlock(sponsor, options))
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const client = await chain.getClient(options)
    const currentBlock = await client.getBlockNumber()
    return unlockBlock === 0 || unlockBlock > currentBlock
  }

  async getBalance(
    sponsor: Address,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<bigint> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getBalance',
      [sponsor],
      chain,
      options,
    )
  }

  async lockDeposit(): Promise<TransactionParams> {
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'lockDeposit',
      [],
    )
  }

  async unlockDepositAfter(blocksToWait: number): Promise<TransactionParams> {
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'unlockDepositAfter',
      [blocksToWait],
    )
  }

  async getSpenderBlacklistMode(
    spender: Address,
    sponsor: Address,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<boolean> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getSpenderBlacklistMode',
      [spender, sponsor],
      chain,
      options,
    )
  }

  async getSpenderWhitelistMode(
    spender: Address,
    sponsor: Address,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<boolean> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getSpenderWhitelistMode',
      [spender, sponsor],
      chain,
      options,
    )
  }
}
