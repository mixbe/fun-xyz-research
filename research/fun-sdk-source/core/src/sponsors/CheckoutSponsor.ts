import type { Address } from 'viem'

import { PaymasterType } from '@funkit/api-base'
import {
  CHECKOUT_PAYMASTER_CONTRACT_INTERFACE,
  type TransactionParams,
} from '../common'
import type { EnvOption } from '../config'
import { Chain, Token } from '../data'
import { Sponsor } from './Sponsor'

export class CheckoutSponsor extends Sponsor {
  constructor(options: EnvOption = globalThis.globalEnvOption) {
    super(
      options,
      CHECKOUT_PAYMASTER_CONTRACT_INTERFACE,
      'checkoutPaymasterAddress',
      PaymasterType.CheckoutSponsor,
    )
  }

  async getPaymasterAndData(options: EnvOption): Promise<string> {
    const paymasterAddress = await this.getPaymasterAddress(options)
    return paymasterAddress.toLowerCase()
  }

  async stake(
    _sponsor: string,
    amount: number,
    options: EnvOption,
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
      'deposit',
      [],
      BigInt(amountdec),
    )
  }

  async unstake(
    receiver: string,
    amount: number,
    options: EnvOption,
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
      'withdrawTo',
      [receiver, amountdec],
    )
  }

  override async lockDeposit(): Promise<TransactionParams> {
    throw new Error('lockDeposit is not supported on CheckoutSponsor')
  }

  override async unlockDepositAfter(
    _blocksToWait: number,
  ): Promise<TransactionParams> {
    throw new Error('unlockDepositAfter is not supported on CheckoutSponsor')
  }

  /** True if the specified sponsor is in blacklist mode. **/
  override async getListMode(
    _sponsor: string,
    _options: EnvOption = globalThis.globalEnvOption,
  ): Promise<boolean> {
    throw new Error('getListMode is not supported on CheckoutSponsor')
  }

  override async setToBlacklistMode(): Promise<TransactionParams> {
    throw new Error('setToBlacklistMode is not supported on Checkout Sponsor')
  }

  override async setToWhitelistMode(): Promise<TransactionParams> {
    throw new Error('setToWhitelistMode is not supported on Checkout Sponsor')
  }

  override async batchTransaction(
    _transactions: TransactionParams[],
  ): Promise<TransactionParams> {
    throw new Error('batchTransaction is not supported on Checkout Sponsor')
  }

  override async addSpenderToWhitelist(
    _spender: Address,
  ): Promise<TransactionParams> {
    throw new Error(
      'addSpenderToWhitelist is not supported on Checkout Sponsor',
    )
  }

  override async removeSpenderFromWhitelist(
    _spender: Address,
  ): Promise<TransactionParams> {
    throw new Error(
      'removeSpenderFromWhitelist is not supported on Checkout Sponsor',
    )
  }

  override async batchWhitelistSpenders(
    _spenders: Address[],
    _modes: boolean[],
  ): Promise<TransactionParams> {
    throw new Error(
      'batchWhitelistSpenders is not supported on Checkout Sponsor',
    )
  }

  override async addSpenderToBlacklist(
    _spender: Address,
  ): Promise<TransactionParams> {
    throw new Error(
      'addSpenderToBlacklist is not supported on Checkout Sponsor',
    )
  }

  override async removeSpenderFromBlacklist(
    _spender: Address,
  ): Promise<TransactionParams> {
    throw new Error(
      'removeSpenderFromBlacklist is not supported on Checkout Sponsor',
    )
  }

  override async batchBlacklistSpenders(
    _spenders: Address[],
    _modes: boolean[],
  ): Promise<TransactionParams> {
    throw new Error(
      'batchBlacklistSpenders is not supported on Checkout Sponsor',
    )
  }
}
