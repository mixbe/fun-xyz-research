import {
  http,
  type Address,
  type Hex,
  type Log,
  type PublicClient,
  createPublicClient,
} from 'viem'

import {
  type ServerChainInfo,
  type UserOperation,
  type UserOperationGasPrice,
  estimateOp,
  getChainFromId,
  getChainFromName,
  getUserOpGasPrice,
} from '@funkit/api-base'
import { FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO } from '@funkit/chains'
import {
  ErrorCode,
  InternalFailureError,
  InvalidParameterError,
  ResourceNotFoundError,
} from '@funkit/utils'
import {
  BASE_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION,
  CONTRACT_ADDRESSES,
  ENTRYPOINT_CONTRACT_INTERFACE,
  ETHEREUM_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION,
  type EstimateGasResult,
  OPTIMISM_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION,
} from '../common'
import type { EnvOption } from '../config'
import { isContract } from '../utils'
import type { Addresses, ChainInput } from './types'

export class Chain {
  private initialized = false
  private id?: string
  private name?: string
  private addresses: Addresses = {}
  private currency?: string
  private rpcUrl?: string
  private client?: PublicClient

  private static chain: Chain

  private constructor(chainInput: ChainInput) {
    if (!chainInput.chainIdentifier && !chainInput.rpcUrl) {
      throw new InvalidParameterError(
        ErrorCode.InvalidChainIdentifier,
        'valid chain identifier or rpcUrl is required, could be chainId, chainName, Fun Chain object, or rpcUrl',
        'valid chain identifier or rpcUrl is required, could be chainId, chainName, Fun Chain object, or rpcUrl',
        { chainInput },
        'Please provide valid chain identifier or rpcUrl',
        'https://docs.fun.xyz',
      )
    }

    if (chainInput.rpcUrl) {
      this.rpcUrl = chainInput.rpcUrl
    } else if (chainInput.chainIdentifier instanceof Chain) {
      // biome-ignore lint/correctness/noConstructorReturn: TODO - ???
      return chainInput.chainIdentifier
    } else if (
      chainInput.chainIdentifier !== undefined &&
      (typeof chainInput.chainIdentifier === 'number' ||
        Number(chainInput.chainIdentifier))
    ) {
      this.id = chainInput.chainIdentifier.toString()
    } else {
      this.name = chainInput.chainIdentifier
    }
  }

  public static async getChain(
    chainInput: ChainInput,
    options?: EnvOption,
  ): Promise<Chain> {
    if (chainInput.chainIdentifier instanceof Chain) {
      return chainInput.chainIdentifier
    }

    if (
      !Chain.chain ||
      ((await Chain.chain.getChainId(options)) !==
        chainInput.chainIdentifier?.toString() &&
        (await Chain.chain.getChainName(options)) !==
          chainInput.chainIdentifier?.toString() &&
        (await Chain.chain.getRpcUrl(options)) !== chainInput.rpcUrl)
    ) {
      if (typeof chainInput.chainIdentifier === 'string') {
        chainInput.chainIdentifier = chainInput.chainIdentifier.replace(
          /\s/g,
          '',
        )
      }
      if (chainInput.chainIdentifier === 'ethereum-goerli') {
        chainInput.chainIdentifier = 'goerli'
      }
      if (chainInput.chainIdentifier === 'polygon') {
        chainInput.chainIdentifier = 'polygon-mainnet'
      }

      Chain.chain = new Chain(chainInput)
    }
    return Chain.chain
  }

  private async init(options?: EnvOption) {
    if (this.initialized) {
      return
    }

    if (this.id) {
      await this.loadChain(this.id, options)
    } else if (this.name) {
      await this.loadChain(this.name, options)
    } else if (this.rpcUrl) {
      await this.loadChainFromRpc(options)
    }

    this.initialized = true
  }

  private async loadChainFromRpc(options?: EnvOption) {
    this.client = createPublicClient({
      transport: http(this.rpcUrl),
    })
    this.id = (await this.client.getChainId()).toString()
    await this.loadChain(this.id, options)
  }

  private async loadChain(identifier: string, options?: EnvOption) {
    let chain: ServerChainInfo
    if (!Number(identifier)) {
      chain = await getChainFromName({
        name: identifier,
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: options?.logger,
        signal: options?.signal,
      })
    } else {
      chain = await getChainFromId({
        chainId: identifier,
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: options?.logger,
        signal: options?.signal,
      })
    }
    this.id = chain.id as string
    this.name = chain.name
    this.currency = chain.nativeCurrency.symbol
    const abisAddresses = Object.keys(CONTRACT_ADDRESSES).reduce(
      (result, key) => {
        result[key] = CONTRACT_ADDRESSES[key][this.id]
        return result
      },
      {},
    )
    const addresses = { ...abisAddresses }
    // TODO: need to check if FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO contains the chain
    const { chainInfo } = FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[this.id] ?? {}
    this.rpcUrl = chainInfo?.rpcUrls.default.http?.[0] || ''
    this.client = createPublicClient({ transport: http(this.rpcUrl) })
    Object.assign(this, { ...this, addresses })
  }

  async getChainId(options?: EnvOption): Promise<string> {
    await this.init(options)
    return this.id ?? ''
  }

  async getChainName(options?: EnvOption): Promise<string> {
    await this.init(options)
    return this.name ?? ''
  }

  async getRpcUrl(options?: EnvOption): Promise<string> {
    await this.init(options)
    return this.rpcUrl ?? ''
  }

  async getAddress(name: string, options?: EnvOption): Promise<Address> {
    await this.init(options)
    const res = this.addresses[name]
    if (!res) {
      throw new ResourceNotFoundError(
        ErrorCode.AddressNotFound,
        'address not found',
        'address not found',
        { name },
        'Provide correct name to query address',
        'https://docs.fun.xyz',
      )
    }
    return res
  }

  async getCurrency(options?: EnvOption): Promise<string> {
    await this.init(options)
    return this.currency ?? ''
  }

  async getClient(options?: EnvOption): Promise<PublicClient> {
    await this.init(options)
    // biome-ignore lint/style/noNonNullAssertion: <always PublicClient>
    return this.client!
  }

  async getFeeData(options?: EnvOption): Promise<UserOperationGasPrice> {
    await this.init(options)
    let result: {
      maxFeePerGas: bigint
      maxPriorityFeePerGas: bigint
    }
    try {
      result = await getUserOpGasPrice({
        chainId: this.id ?? '',
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: options?.logger,
        signal: options?.signal,
      })
    } catch (_err) {
      // biome-ignore lint/style/noNonNullAssertion: <always PublicClient>
      const fallBackGasPrice = await this.client!.getGasPrice()
      result = {
        maxFeePerGas: fallBackGasPrice,
        maxPriorityFeePerGas: fallBackGasPrice,
      }
    }
    return result
  }

  async estimateOpGas(
    partialOp: UserOperation,
    options?: EnvOption,
  ): Promise<EstimateGasResult> {
    await this.init(options)
    if (!this.addresses || !this.addresses.entryPointAddress) {
      throw new InternalFailureError(
        ErrorCode.AddressNotFound,
        'entryPointAddress is required',
        '',
        { partialOp },
        'This is an internal error, please contact support.',
        'https://docs.fun.xyz',
      )
    }
    // clone partialOp and replace paymasterAndData with a workaround for pimlico since they overestimate gas limits for simulation
    const estimationUserOp = Object.assign({}, partialOp)
    if (this.id === '8453') {
      estimationUserOp.paymasterAndData =
        BASE_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION
    } else if (this.id === '10') {
      estimationUserOp.paymasterAndData =
        OPTIMISM_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION
    } else if (this.id === '1' || this.id === '36865') {
      estimationUserOp.paymasterAndData =
        ETHEREUM_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION
    }

    let { preVerificationGas, callGasLimit, verificationGasLimit } =
      await estimateOp({
        input: {
          chainId: this.id ?? '',
          entryPointAddress: this.addresses.entryPointAddress,
          userOp: estimationUserOp,
        },
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: options?.logger,
        signal: options?.signal,
      })
    if (!preVerificationGas || !verificationGasLimit || !callGasLimit) {
      throw new Error(
        JSON.stringify({
          preVerificationGas,
          callGasLimit,
          verificationGasLimit,
        }),
      )
    }
    callGasLimit = BigInt(callGasLimit) * 2n
    preVerificationGas = BigInt(preVerificationGas)
    verificationGasLimit = BigInt(verificationGasLimit) + 200_000n
    return { preVerificationGas, verificationGasLimit, callGasLimit }
  }

  async getTxId(
    userOpHash: string,
    timeout = 60_000,
    interval = 5_000,
    fromBlock?: bigint,
    options?: EnvOption,
  ): Promise<Hex | null> {
    const endtime = Date.now() + timeout
    const client = await this.getClient(options)
    const entryPointAddress = await this.getAddress(
      'entryPointAddress',
      options,
    )
    const fromBlockFinal = fromBlock || (await client.getBlockNumber()) - 100n
    while (Date.now() < endtime) {
      let events: Log[]
      const chainId = await client.getChainId()
      if (chainId === 84531 || chainId === 36865) {
        events = await ENTRYPOINT_CONTRACT_INTERFACE.getLog(
          entryPointAddress,
          'UserOperationEvent',
          { userOpHash },
          client,
          fromBlockFinal,
          options,
        )
      } else {
        const filter = await ENTRYPOINT_CONTRACT_INTERFACE.createFilter(
          entryPointAddress,
          'UserOperationEvent',
          [userOpHash],
          client,
          fromBlockFinal,
          options,
        )
        events = await client.getFilterLogs({ filter })
      }

      if (events.length > 0) {
        return events[0].transactionHash
      }
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
    return null
  }

  async addressIsContract(
    address: Address,
    options?: EnvOption,
  ): Promise<boolean> {
    return isContract(address, await this.getClient(options))
  }
}
