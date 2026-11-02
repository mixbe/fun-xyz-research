import type { AbiError } from 'abitype'
import {
  type AbiEvent,
  type AbiFunction,
  type Address,
  type Hex,
  type Log,
  type PublicClient,
  encodeFunctionData,
} from 'viem'

import type { TransactionParams } from '../common'
import type { EnvOption } from '../config'
import { Chain } from '../data'
import { stringify } from '../utils'

type ChainReadCall = {
  functionName: string
  args?: unknown[]
}

export class ContractInterface {
  abi: ReadonlyArray<AbiError | AbiEvent | AbiFunction>

  // biome-ignore lint/suspicious/noExplicitAny: Strict typing here clashes when importing from JSON
  constructor(abi: ReadonlyArray<any>) {
    this.abi = abi as ReadonlyArray<AbiError | AbiEvent | AbiFunction>
  }

  async readFromChain<T>(
    address: Address,
    functionName: string,
    args: unknown[],
    chainOrClient: Chain | PublicClient,
    options?: EnvOption,
  ): Promise<T> {
    const client = await parseClient(chainOrClient, options)
    try {
      return (await client.readContract({
        abi: this.abi,
        address,
        functionName,
        args,
      })) as T
    } catch (e) {
      throw new Error(
        `Error reading from chain: \n ${stringify(e)}. Info: ${stringify({
          address,
          functionName,
          args,
          chainOrClient,
          client,
        })}`,
      )
    }
  }

  async batchReadFromChain<T extends unknown[]>(
    address: Address,
    chainOrClient: Chain | PublicClient,
    calls: ChainReadCall[],
    options?: EnvOption,
  ): Promise<T> {
    const client = await parseClient(chainOrClient, options)
    return (await Promise.all(
      calls.map(async (call) => {
        return this.readFromChain(
          address,
          call.functionName,
          call.args ? call.args : [],
          client,
          options,
        )
      }),
    )) as T
  }

  encodeTransactionParams(
    address: Address,
    functionName: string,
    args: unknown[],
    value = 0n,
  ): TransactionParams {
    const data = encodeFunctionData({
      abi: this.abi,
      functionName,
      args,
    })
    return { to: address, data, value }
  }

  encodeData(functionName: string, args: unknown[]): Hex {
    return encodeFunctionData({
      abi: this.abi,
      functionName,
      args,
    })
  }

  async createFilter(
    address: Address,
    eventName: string,
    args: unknown[],
    chainOrClient: PublicClient | Chain,
    fromBlock: bigint,
    options?: EnvOption,
  ) {
    const client = await parseClient(chainOrClient, options)
    return await client.createContractEventFilter({
      abi: this.abi,
      address,
      eventName,
      args,
      fromBlock,
    })
  }

  async getLog(
    address: Address,
    name: string,
    args: ReadonlyArray<unknown> | Record<string, unknown> | undefined,
    chainOrClient: PublicClient | Chain,
    fromBlock: bigint,
    options?: EnvOption,
  ): Promise<Log[]> {
    const client = await parseClient(chainOrClient, options)
    const event = getItemFromAbi(this.abi, name, 'event') as AbiEvent
    return await client.getLogs<AbiEvent, [AbiEvent]>({
      address,
      event,
      args,
      fromBlock,
    })
  }
}

export const parseClient = async (
  chainOrClient: PublicClient | Chain,
  options?: EnvOption,
): Promise<PublicClient> => {
  if (chainOrClient instanceof Chain) {
    const chain = chainOrClient as Chain
    return await chain.getClient(options)
  }
  if (typeof chainOrClient.readContract === 'function') {
    return chainOrClient as PublicClient
  }
  throw new Error('No client or chain provided')
}

const getItemFromAbi = (
  abi: ReadonlyArray<AbiError | AbiEvent | AbiFunction>,
  name: string,
  type: string,
) => {
  const item = abi.find((item) => item.name === name && item.type === type)
  if (!item) {
    throw new Error(`No ${type} with name ${name} found in abi`)
  }
  return item
}
