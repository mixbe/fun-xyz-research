import { type Address, concat, encodeAbiParameters } from 'viem'

import { PaymasterType, addTransaction } from '@funkit/api-base'
import {
  ErrorCode,
  InvalidParameterError,
  ResourceNotFoundError,
} from '@funkit/utils'
import type { Auth } from '../auth'
import { TOKEN_SPONSOR_SUPPORT_CHAINS, type TransactionParams } from '../common'
import {
  AddressZero,
  TOKEN_PAYMASTER_CONTRACT_INTERFACE,
} from '../common/constants'
import type { EnvOption } from '../config'
import { Chain, type Operation, Token } from '../data'
import { getPermitHash, getWalletPermitNonce } from '../utils'
import { Sponsor } from './Sponsor'
import type { AllTokenData } from './types'

export class TokenSponsor extends Sponsor {
  token: string

  constructor(options: EnvOption = globalThis.globalEnvOption) {
    super(
      options,
      TOKEN_PAYMASTER_CONTRACT_INTERFACE,
      'tokenPaymasterAddress',
      PaymasterType.TokenSponsor,
    )
    if (!options.gasSponsor?.token) {
      throw new InvalidParameterError(
        ErrorCode.MissingParameter,
        'token field is missing',
        'token field is missing',
        { gasSponsor: options.gasSponsor },
        'Provide correct token name or address.',
        'https://docs.fun.xyz',
      )
    }
    this.token = options.gasSponsor.token.toLowerCase()
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
        TOKEN_SPONSOR_SUPPORT_CHAINS.includes(await chain.getChainId(options))
      ) {
        this.sponsorAddress = await chain.getAddress(
          'funTokenSponsorAddress',
          options,
        )
      } else {
        throw new ResourceNotFoundError(
          ErrorCode.MissingParameter,
          'The network you are working with does not support token Fun Sponsor. You will need to run and manage your own token sponsor.',
          'The network you are working with does not support token Fun Sponsor. You will need to run and manage your own token sponsor.',
          {
            tokenSponsorSupportChains: TOKEN_SPONSOR_SUPPORT_CHAINS,
            chain: await chain.getChainId(options),
          },
          'Manage your own token sponsor, or use a supported network',
          'https://docs.fun.xyz',
        )
      }
    }
    return this.sponsorAddress
  }

  async getPaymasterAndData(
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<string> {
    // TODO: temporary fallback, remove after refactoring -- Panda
    const chain = await Chain.getChain(
      {
        chainIdentifier: globalThis.globalEnvOption.chain,
      },
      options,
    )
    const tokenAddress = await Token.getAddress(this.token, chain, options)
    const paymasterAddress = await this.getPaymasterAddress(options)
    const sponsor = await this.getFunSponsorAddress(options)
    return concat([paymasterAddress, sponsor, tokenAddress])
  }

  async getPaymasterAndDataPermit(
    partialOp: Operation,
    walletAddr: Address,
    userId: string,
    auth: Auth,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<string> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const estimateGasSignature = await auth.getEstimateGasSignature(
      userId,
      partialOp,
    )
    partialOp.userOp.signature = estimateGasSignature.toLowerCase()
    const estimationPaymasterAddress = await chain.getAddress(
      'estimationPaymasterAddress',
      options,
    )
    const { callGasLimit, verificationGasLimit, preVerificationGas } =
      await chain.estimateOpGas(
        {
          ...partialOp.userOp,
          paymasterAndData: estimationPaymasterAddress,
        },
        options,
      )
    const { maxFeePerGas } = await chain.getFeeData(options)
    const paymasterAddress = await this.getPaymasterAddress(options)
    const requiredGas =
      (callGasLimit +
        (verificationGasLimit + 400_000n) * 3n +
        preVerificationGas) *
      BigInt(maxFeePerGas)
    const tokenAddress = await Token.getAddress(this.token, chain, options)
    const decAmount =
      await TOKEN_PAYMASTER_CONTRACT_INTERFACE.readFromChain<bigint>(
        paymasterAddress,
        'getTokenValueOfEth',
        [tokenAddress, requiredGas],
        chain,
        options,
      )
    const nonce = await getWalletPermitNonce(
      walletAddr,
      chain,
      undefined,
      options,
    )
    const client = await chain.getClient(options)
    const chainId = await client.getChainId()
    const hash = getPermitHash(
      tokenAddress,
      paymasterAddress,
      decAmount,
      nonce,
      walletAddr,
      BigInt(chainId),
    )
    const sig = await auth.signHash(hash)
    const encodedSig = encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'bytes' },
      ],
      [tokenAddress, paymasterAddress, decAmount, nonce, sig],
    )
    const sponsor = await this.getFunSponsorAddress(options)
    const encodedAddresses = encodeAbiParameters(
      [{ type: 'address' }, { type: 'address' }],
      [sponsor, tokenAddress],
    )
    const encodedData = encodeAbiParameters(
      [{ type: 'bytes' }, { type: 'bytes' }],
      [encodedAddresses, encodedSig],
    )
    return concat([paymasterAddress, encodedData])
  }

  async stake(
    sponsor: Address,
    amount: number,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chainIdentifier = options.chain ?? globalThis.globalEnvOption.chain
    const chain = await Chain.getChain({ chainIdentifier }, options)
    const amountdec = await Token.getDecimalAmount(
      'eth',
      amount,
      chain,
      options,
    )
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'addEthDepositTo',
      [sponsor, amountdec],
      BigInt(amountdec),
    )
  }

  async unstake(
    receiver: Address,
    amount: number,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    // TODO: temporary fallback, remove after refactoring -- Panda
    const chainIdentifier = options.chain ?? globalThis.globalEnvOption.chain
    const chain = await Chain.getChain({ chainIdentifier }, options)
    const amountdec = await Token.getDecimalAmount(
      'eth',
      amount,
      chain,
      options,
    )
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'withdrawEthDepositTo',
      [receiver, amountdec],
    )
  }

  async getUnlockBlock(
    sponsor: Address,
    token: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<bigint> {
    // TODO: temporary fallback, remove after refactoring -- Panda
    const chain = await Chain.getChain(
      {
        chainIdentifier: globalThis.globalEnvOption.chain,
      },
      options,
    )
    const tokenAddr = Token.isNative(token)
      ? AddressZero
      : await Token.getAddress(token, chain, options)
    return (await this.getAllTokenData(tokenAddr, sponsor, options)).unlockBlock
  }

  // false means unlocked, true means locked
  async getLockState(
    sponsor: Address,
    token: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<boolean> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenAddr = Token.isNative(token)
      ? AddressZero
      : await Token.getAddress(token, chain, options)
    const unlockBlock = await this.getUnlockBlock(tokenAddr, sponsor)
    const provider = await chain.getClient(options)
    const currentBlock = await provider.getBlockNumber()
    return unlockBlock === 0n || unlockBlock > currentBlock
  }

  async getTokenInfo(
    token: string,
    options: EnvOption = globalThis.globalEnvOption,
  ) {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenAddress = await Token.getAddress(token, chain, options)
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getToken',
      [tokenAddress],
      chain,
      options,
    )
  }

  async getAllTokenData(
    spender: Address,
    token: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<AllTokenData> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenAddress = await Token.getAddress(token, chain, options)

    const data = await this.contractInterface.readFromChain<[bigint, bigint]>(
      await this.getPaymasterAddress(options),
      'getAllTokenData',
      [tokenAddress, spender],
      chain,
      options,
    )
    return {
      unlockBlock: data[0],
      tokenAmount: data[1],
    }
  }

  async getTokenBalance(
    spender: Address,
    token: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<bigint> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )

    const tokenData = new Token(token, chain)
    const tokenAddress = tokenData.isNative
      ? AddressZero
      : await tokenData.getAddress(options)

    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getTokenBalance',
      [tokenAddress, spender],
      chain,
      options,
    )
  }

  async getAllTokens(options: EnvOption = globalThis.globalEnvOption) {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getAllTokens',
      [],
      chain,
      options,
    )
  }

  async addUsableToken(
    oracle: string,
    token: string,
    aggregator: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const decimals = await Token.getDecimals(token, chain, options)
    const tokenAddress = await Token.getAddress(token, chain, options)
    const data = [oracle, tokenAddress, decimals, aggregator]
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'setTokenData',
      [data],
    )
  }

  async depositToken(
    token: string,
    spender: Address,
    amount: number,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenObj = new Token(token, chain)
    const tokenAddress = await tokenObj.getAddress(options)
    const amountDec = await tokenObj.getDecimalAmount(amount, options)
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'addTokenDepositTo',
      [tokenAddress, spender, amountDec],
    )
  }

  async withdrawToken(
    token: string,
    receiver: Address,
    amount: number,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenObj = new Token(token, chain)
    const tokenAddress = await tokenObj.getAddress(options)
    const amountdec = await tokenObj.getDecimalAmount(amount, options)
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'withdrawTokenDepositTo',
      [tokenAddress, receiver, amountdec],
    )
  }

  async lockTokenDeposit(
    token: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenData = new Token(token, chain)
    const tokenAddress = tokenData.isNative
      ? AddressZero
      : await tokenData.getAddress(options)
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'lockTokenDeposit',
      [tokenAddress],
    )
  }

  async unlockTokenDepositAfter(
    token: string,
    blocksToWait: number,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenData = new Token(token, chain)
    const tokenAddress = tokenData.isNative
      ? AddressZero
      : await tokenData.getAddress(options)
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'unlockTokenDepositAfter',
      [tokenAddress, blocksToWait],
    )
  }

  async lockDeposit(): Promise<TransactionParams> {
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'lockTokenDeposit',
      [AddressZero],
    )
  }

  async unlockDepositAfter(blocksToWait: number): Promise<TransactionParams> {
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'unlockTokenDepositAfter',
      [AddressZero, blocksToWait],
    )
  }

  async approve(
    approver: Address,
    token: string,
    amount: number,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const gasSponsorAddress = await this.getPaymasterAddress()
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    addTransaction({
      chainId: await chain.getChainId(options),
      timestamp: Date.now(),
      txid: '0x',
      transaction: {
        action: 'approve',
        amount,
        from: approver,
        to: await this.getPaymasterAddress(options),
        token,
      },
      paymasterType: this.paymasterType,
      sponsorAddress: approver,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: options.logger,
      signal: options.signal,
    })
    return Token.approve(token, gasSponsorAddress, amount, chain, options)
  }

  async getSpenderBlacklisted(
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
      'getSpenderBlacklisted',
      [spender, sponsor],
      chain,
      options,
    )
  }

  async getSpenderWhitelisted(
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
      'getSpenderWhitelisted',
      [spender, sponsor],
      chain,
      options,
    )
  }

  async getTokenWhitelisted(
    sponsor: Address,
    token: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<boolean> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenAddress = await Token.getAddress(token, chain, options)
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getTokenWhitelisted',
      [tokenAddress, sponsor],
      chain,
      options,
    )
  }

  async setTokenToWhitelistMode(): Promise<TransactionParams> {
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'setTokenListMode',
      [false],
    )
  }

  async batchWhitelistTokens(
    tokens: string[],
    modes: boolean[],
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )

    const calldata: string[] = []
    for (let i = 0; i < tokens.length; i++) {
      const tokenAddress = await Token.getAddress(tokens[i], chain, options)
      calldata.push(
        this.contractInterface.encodeData('setTokenWhitelistMode', [
          tokenAddress,
          modes[i],
        ]),
      )
    }
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'batchActions',
      [calldata],
    )
  }

  async getTokenListMode(
    sponsor: Address,
    options: EnvOption = globalThis.globalEnvOption,
  ) {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getTokenListMode',
      [sponsor],
      chain,
      options,
    )
  }

  async getTokenBlacklisted(
    sponsor: Address,
    token: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<boolean> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const tokenAddress = await Token.getAddress(token, chain, options)
    return await this.contractInterface.readFromChain(
      await this.getPaymasterAddress(options),
      'getTokenBlacklisted',
      [tokenAddress, sponsor],
      chain,
      options,
    )
  }

  async setTokenToBlacklistMode(): Promise<TransactionParams> {
    return this.contractInterface.encodeTransactionParams(
      await this.getPaymasterAddress(),
      'setTokenListMode',
      [true],
    )
  }

  async batchBlacklistTokens(
    tokens: string[],
    modes: boolean[],
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionParams> {
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const calldata: TransactionParams[] = []
    for (let i = 0; i < tokens.length; i++) {
      const tokenAddress = await Token.getAddress(tokens[i], chain, options)
      calldata.push(
        this.contractInterface.encodeTransactionParams(
          await this.getPaymasterAddress(),
          'setTokenBlacklistMode',
          [tokenAddress, modes[i]],
        ),
      )
    }
    return this.batchTransaction(calldata)
  }
}
