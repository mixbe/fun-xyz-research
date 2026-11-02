import {
  http,
  type Address,
  type Hash,
  type Hex,
  type JsonRpcAccount,
  type PrivateKeyAccount,
  type TransactionReceipt,
  type Chain as ViemChain,
  type WalletClient,
  createWalletClient,
  custom,
  isHex,
  keccak256,
  pad,
  toBytes,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as viemChains from 'viem/chains'

import {
  type Wallet,
  getUserWalletIdentities,
  getUserWalletsByAddr,
} from '@funkit/api-base'
import {
  ErrorCode,
  InvalidParameterError,
  ResourceNotFoundError,
} from '@funkit/utils'
import {
  type TransactionData,
  type TransactionParams,
  VALID_PRIVATE_KEY_LENGTH,
} from '../common'
import type { EnvOption } from '../config'
import {
  Chain,
  type Operation,
  type WalletSignature,
  encodeWalletSignature,
} from '../data'
import { getAuthUniqueId, getGasStation } from '../utils'
import { isBytes32 } from '../utils/TypeUtils'
import { convertProviderToClient, convertSignerToClient } from '../viem'
import type { AuthInput } from './types'

const gasSpecificChain: {
  [id in string]?: {
    gasStationUrl: string
    backupPriorityFee: number | `${number}`
    backupFee: number | `${number}`
  }
} = {
  '137': {
    gasStationUrl: 'https://gasstation.polygon.technology/v2',
    backupPriorityFee: '1000', // 1000 gwei
    backupFee: '200', // 200 gwei
  },
  // TODO: Do the actual calculation for scroll transactions https://docs.scroll.io/en/developers/transaction-fees-on-scroll/
  '534352': {
    gasStationUrl: '',
    backupPriorityFee: 1, // 50 gwei
    backupFee: 1, // 50 gwei
  },
}

const preProcessesChains: { [chainId: number]: string } = {}
for (const key in viemChains) {
  const chain = viemChains[key as keyof typeof viemChains]
  preProcessesChains[chain.id] = key
}

preProcessesChains['36865'] = 'funtestnet'
const chains: Record<string, ViemChain> = { ...viemChains }
chains.funtestnet = {
  id: 36865,
  name: 'Fun Testnet',
  nativeCurrency: { name: 'ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [] }, public: { http: [] } },
}

export class Auth {
  authId?: string
  signer?: PrivateKeyAccount | JsonRpcAccount
  client?: WalletClient
  inited = false
  account?: Address
  constructor(authInput: AuthInput) {
    if (authInput.web2AuthId) {
      this.authId = authInput.web2AuthId
    }

    if (authInput.client) {
      this.client = authInput.client
    } else if (authInput.windowEth) {
      this.client = createWalletClient({
        transport: custom(authInput.windowEth),
      })
    } else if (authInput.rpc) {
      this.client = createWalletClient({
        transport: http(authInput.rpc),
      })
    } else if (authInput.provider) {
      this.client = convertProviderToClient({ provider: authInput.provider })
    } else if (authInput.signer) {
      this.client = convertSignerToClient({ signer: authInput.signer })
    } else if (authInput.privateKey) {
      let privateKey: Hex
      if (isBytes32(authInput.privateKey)) {
        privateKey = authInput.privateKey as Hex
      } else if (
        !isHex(authInput.privateKey) &&
        authInput.privateKey.length === VALID_PRIVATE_KEY_LENGTH
      ) {
        privateKey = `0x${authInput.privateKey}`
      } else {
        throw new InvalidParameterError(
          ErrorCode.InvalidParameter,
          'privateKey is not a valid one',
          'privateKey is not a valid one',
          authInput.privateKey,
          'Provide valid privateKey string',
          'https://docs.fun.xyz/how-to-guides/configure-account',
        )
      }
      this.signer = privateKeyToAccount(privateKey)
    } else {
      throw new InvalidParameterError(
        ErrorCode.MissingParameter,
        'valid authInput is required',
        'valid authInput is required',
        authInput,
        'Provide viem client, privateKey, window eth (check viem.sh), rpc signer, provider, or signer when constructing Auth',
        'https://docs.fun.xyz/how-to-guides/configure-account',
      )
    }
  }

  async init(): Promise<void> {
    if (this.inited) {
      return
    }
    if (this.client) {
      const address = await this.client.requestAddresses()
      this.account = address[0]
    } else if (this.signer) {
      this.account = this.signer.address
    }
    this.authId ??= this.account
    this.inited = true
  }

  /**
   * Signs a hash using the stored signer and returns the signature.
   * @param {Hex} hash - The hash to be signed.
   * @param {boolean} isGroupOp - Whether the operation is a group operation (default: false).
   * @returns {Promise<Hex>} The signature of the hash.
   */
  async signHash(hash: Hex, isGroupOp = false): Promise<Hex> {
    await this.init()
    let signature: Hash
    if (this.signer?.type === 'local') {
      signature = await this.signer.signMessage({
        message: { raw: toBytes(hash) },
      })
    } else if (this.client && this.account) {
      signature = await this.client.signMessage({
        account: this.account,
        message: { raw: toBytes(hash) },
      })
    } else {
      throw new Error('No signer or client')
    }
    if (isGroupOp) {
      return signature
    }
    const walletSignature: WalletSignature = {
      userId: await this.getUserId(),
      signature,
    }
    return encodeWalletSignature(walletSignature)
  }

  /**
   * Signs an operation using the stored signer and returns the signature.
   * @param {Operation} operation - The operation to be signed.
   * @param {Chain} chain - The chain instance associated with the operation.
   * @param {boolean} isGroupOp - Whether the operation is a group operation (default: false).
   * @returns {Promise<Hex>} The signature of the operation.
   */
  async signOp(
    operation: Operation,
    chain: Chain,
    isGroupOp = false,
    options?: EnvOption,
  ): Promise<Hex> {
    await this.init()
    const opHash = await operation.getOpHash(chain, options)
    return await this.signHash(opHash, isGroupOp)
  }

  /**
   * Retrieves the address associated with the initialized signer or client.
   * @returns {Promise<Address>} The address associated with the signer or client.
   * @throws {Error} If no signer or client is available.
   */
  async getAddress(): Promise<Address> {
    await this.init()
    if (this.account) {
      return this.account
    }
    throw new Error('No signer or client')
  }

  /**
   * Retrieves the user ID by padding the address associated with the signer or client.
   * @returns {Promise<Hex>} The padded user ID.
   */
  async getUserId(): Promise<Hex> {
    return pad(await this.getAddress(), { size: 32 }).toLowerCase() as Hex
  }

  /**
   * Generates an estimate gas signature for an operation using the provided user ID.
   * @param {string} userId - The user ID to generate the estimate gas signature for.
   * @param {Operation} _ - The operation (not used in this method).
   * @returns {Promise<Hex>} The estimate gas signature.
   */
  async getEstimateGasSignature(userId: string, _: Operation): Promise<Hex> {
    await this.init()
    const walletSignature: WalletSignature = {
      userId: pad(userId as Hex, { size: 32 }),
      signature: pad('0x', { size: 65 }),
    }
    return encodeWalletSignature(walletSignature)
  }

  /**
   * Retrieves a unique ID for the wallet based on an index and optional skipDBActions flag.
   * @param {number} index - The index for generating the unique ID (default: 0).
   * @param {boolean} skipDBActions - Whether to skip database actions (default: false).
   * @returns {Promise<Hex>} The generated unique ID for the wallet.
   */
  async getWalletUniqueId(
    index = 0,
    skipDBActions = false,
    options?: EnvOption,
  ): Promise<Hex> {
    await this.init()
    const authUniqueId = await getAuthUniqueId(
      this.authId ?? '',
      await this.getAddress(),
      skipDBActions,
      options,
    )
    return keccak256(toBytes(`${authUniqueId}-${index}`))
  }

  /**
   * Sends a transaction with the provided transaction data and options.
   * @param {TransactionParams} txData - The transaction data including 'to', 'data', and 'value'.
   * @param {EnvOption} options - The environment options (default: globalEnvOption).
   * @returns {Promise<TransactionReceipt>} The transaction receipt.
   */
  async sendTx(
    txData: TransactionParams,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<TransactionReceipt> {
    await this.init()
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const chainId = await chain.getChainId(options)
    const { to, data } = txData
    const { value = 0n } = txData
    if (!chain || !chainId) {
      throw new InvalidParameterError(
        ErrorCode.MissingParameter,
        'chain object is missing or incorrect',
        'chain object is missing or incorrect',
        { options, chainId },
        'Provide proper chain information from options field',
        'https://docs.fun.xyz',
      )
    }

    if (!this.signer) {
      throw new InvalidParameterError(
        ErrorCode.MissingParameter,
        'signer is missing or incorrect',
        'signer is missing or incorrect',
        { options, signer: this.signer },
        'Provide proper chain information from options field',
        'https://docs.fun.xyz',
      )
    }

    const client = await chain.getClient(options)

    const txClient: WalletClient =
      this.client ??
      createWalletClient({
        account: this.signer,
        transport: http(client.transport.url),
        chain: chains[preProcessesChains[await chain.getChainId(options)]],
      })

    let tx: {
      data?: Address
      to: Address
      maxFeePerGas?: bigint
      maxPriorityFeePerGas?: bigint
      value: bigint
    }

    let maxFee: number
    let maxPriorityFee: number

    if (gasSpecificChain[chainId]) {
      const { backupFee, backupPriorityFee, gasStationUrl } =
        gasSpecificChain[chainId]

      try {
        const { standard } = await getGasStation(gasStationUrl, options)
        maxPriorityFee = standard.maxPriorityFee
        maxFee = standard.maxFee
      } catch (_err) {
        maxPriorityFee = Number(backupPriorityFee)
        maxFee = Number(backupFee)
      }

      tx = {
        to,
        value: BigInt(value),
        data,
        maxFeePerGas: BigInt(Math.floor(maxFee * 1e9)),
        maxPriorityFeePerGas: BigInt(Math.floor(maxPriorityFee * 1e9)),
      }
    } else {
      tx = { to, value: BigInt(value), data }
    }

    if (!this.account) {
      throw new InvalidParameterError(
        ErrorCode.MissingParameter,
        'account is missing or incorrect',
        'account is missing or incorrect',
        { options, account: this.account },
        'Provide proper chain information from options field',
        'https://docs.fun.xyz',
      )
    }

    const hash = await txClient.sendTransaction({
      ...tx,
      account: this.signer ?? this.account, // TODO: Handle missing account?
      chain: chains[preProcessesChains[await chain.getChainId(options)]],
    })

    if (chainId !== '1' && chainId !== '5') {
      return await client.waitForTransactionReceipt({
        hash,
        timeout: 30_000,
      })
    }
    // ethereum mainnet is crazy slow and viem will throw out error
    const maxRetry = 10
    let retryCount = 0
    while (retryCount < maxRetry) {
      try {
        return await client.waitForTransactionReceipt({
          hash,
          timeout: 30_000,
        })
      } catch (_err) {
        retryCount++
        await new Promise((r) => setTimeout(r, 5000))
      }
    }

    // TODO: This is not a nice error
    throw Error('Failed to get transaction receipt after several retries')
  }

  /**
   * Sends an array of transactions and returns an array of corresponding transaction receipts.
   * @param {TransactionData[]} txs - An array of transaction data.
   * @returns {Promise<TransactionReceipt[]>} An array of transaction receipts.
   */
  async sendTxs(txs: TransactionData[]): Promise<TransactionReceipt[]> {
    const receipts: TransactionReceipt[] = []
    for (const tx of txs) {
      if (tx.chain) {
        receipts.push(await this.sendTx(tx, { chain: tx.chain }))
      } else {
        receipts.push(await this.sendTx(tx))
      }
    }
    return receipts
  }

  /**
   * Retrieves the user IDs of the current auth object associated with a wallet address on a specific chain.
   * @param {Address} wallet - The wallet address for which to retrieve user IDs.
   * @param {string} chainId - The chain identifier.
   * @returns {Promise<Hex[]>} An array of user IDs associated with the wallet address.
   */
  async getUserIds(
    wallet: Address,
    chainId: string,
    options?: EnvOption,
  ): Promise<Hex[]> {
    await this.init()
    return await getUserWalletIdentities({
      authId: this.authId ?? '',
      chainId,
      walletAddr: wallet,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: options?.logger,
      signal: options?.signal,
    })
  }

  /**
   * Retrieves the wallets associated with the current auth object.
   * @param {string} [chainId] - Optional chain identifier.
   * @returns {Promise<Wallet[]>} An array of wallet objects associated with the address.
   */
  async getWallets(chainId?: string, options?: EnvOption): Promise<Wallet[]> {
    await this.init()
    try {
      return await getUserWalletsByAddr({
        addr: await this.getAddress(),
        chainId,
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: options?.logger,
        signal: options?.signal,
      })
    } catch (err) {
      if (err instanceof ResourceNotFoundError) {
        return []
      }
      throw err
    }
  }
}
