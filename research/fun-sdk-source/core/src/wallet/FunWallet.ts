import {
  AuthType,
  type ExecutionReceipt,
  type GetWalletLidoWithdrawalsByChainIdResponse,
  type GroupMetadata,
  type OperationData,
  OperationStatus,
  OperationType,
  addTransaction,
  addUserToWallet,
  checkWalletAccessInitialization,
  createOp,
  deleteOp,
  executeOp,
  getAllWalletTokens,
  getAllWalletTokensByChainId,
  getFullReceipt,
  getGroups,
  getOps,
  getOpsOfWallet,
  getWalletLidoWithdrawalsByChainId,
  initializeWalletAccess,
  scheduleOp,
  signOp,
} from '@funkit/api-base'
import {
  http,
  type Address,
  type Hex,
  concat,
  createPublicClient,
  encodeAbiParameters,
  isAddress,
  isHex,
  keccak256,
  pad,
  toBytes,
} from 'viem'

import {
  ErrorCode,
  InternalFailureError,
  InvalidParameterError,
} from '@funkit/utils'
import { FirstClassActions } from '../actions/FirstClassActions'
import type { Auth } from '../auth'
import {
  ENTRYPOINT_CONTRACT_INTERFACE,
  type TransactionParams,
  WALLET_CONTRACT_INTERFACE,
} from '../common'
import {
  AddressZero,
  DEFAULT_USEROP_GAS_LIMIT,
  FACTORY_CONTRACT_INTERFACE,
} from '../common/constants'
import { type EnvOption, parseOptions } from '../config'
import {
  Chain,
  type InitCodeParams,
  type LoginData,
  Operation,
  Token,
  encodeLoginData,
  encodeUserAuthInitData,
  toBytes32Arr,
} from '../data'
import { CheckoutSponsor, GaslessSponsor, TokenSponsor } from '../sponsors'
import {
  generateRandomNonceKey,
  getWalletAddress,
  isGroupOperation,
  isSignatureMissing,
  isWalletInitOp,
} from '../utils'
import { getPaymasterType } from '../utils/PaymasterUtils'
import { isBytes32 } from '../utils/TypeUtils'
import type { FunWalletParams, User } from './types'

export class FunWallet extends FirstClassActions {
  walletUniqueId?: Hex
  userInfo?: Map<Hex, User>
  address?: Address

  /**
   * Creates FunWallet object
   * @constructor
   * @param {object} params - The parameters for the constructing fun wallet - (users, uniqueId) or walletAddr
   */
  constructor(params: FunWalletParams | string) {
    const chain = globalThis.globalEnvOption.chain
    super(chain)
    if (typeof params === 'string') {
      if (isAddress(params as string)) {
        this.address = params as Address
      } else {
        throw new InvalidParameterError(
          ErrorCode.InvalidParameter,
          'string input must be an address type',
          'string input must be an address type',
          params,
          'Provide either (uniqueId, users) or walletAddr when constructing a FunWallet',
          'https://docs.fun.xyz/how-to-guides/execute-transactions/create-funwallet#create-funwallet-manual-funwallet-creation',
        )
      }
    } else {
      const { users, uniqueId } = params as FunWalletParams
      if (!uniqueId || !isBytes32(uniqueId) || !users || users.length <= 0) {
        throw new InvalidParameterError(
          ErrorCode.InvalidParameter,
          'uniqueId must be bytes32 and users must be non-empty',
          'uniqueId must be bytes32 and users must be non-empty',
          params,
          'The uniqueId field should be a 32 byte Hexstring and the users field should be an array of User objects',
          'https://docs.fun.xyz/how-to-guides/execute-transactions/create-funwallet#create-funwallet-manual-funwallet-creation',
        )
      }

      this.userInfo = new Map(
        users?.map((user) => {
          if (!user.userId || !isHex(user.userId)) {
            throw new InvalidParameterError(
              ErrorCode.InvalidParameter,
              'userId is required and must be a hex string',
              'userId is required and must be a hex string',
              users,
              'Provide hex string userId when creating a FunWallet',
              'https://docs.fun.xyz/how-to-guides/execute-transactions/create-funwallet#create-funwallet-manual-funwallet-creation',
            )
          }

          if (
            user.groupInfo &&
            (!Number.isInteger(user.groupInfo.threshold) ||
              !Array.isArray(user.groupInfo.memberIds) ||
              !user.groupInfo.memberIds.every((memberId) => isHex(memberId)))
          ) {
            throw new InvalidParameterError(
              ErrorCode.InvalidParameter,
              'groupInfo must be an object with threshold as integer and memberIds as array of hex strings',
              'groupInfo must be an object with threshold as integer and memberIds as array of hex strings',
              users,
              'Provide valid groupInfo when creating a FunWallet',
              'https://docs.fun.xyz/how-to-guides/execute-transactions/create-funwallet#create-funwallet-manual-funwallet-creation',
            )
          }

          return [pad(user.userId, { size: 32 }), user] as [Hex, User]
        }),
      )

      this.walletUniqueId = uniqueId as Hex
    }
  }

  /**
   * Retrieves the wallet address associated with this FunWallet. The address should be the same for all EVM chains so no input is needed
   * If the address is not already cached, it fetches it using the wallet's unique ID and chain information.
   * @returns {Promise<Address>} The wallet address.
   */
  async getAddress(
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Address> {
    if (!this.address) {
      const chainIdentifier = txOptions.chain
      this.address = await getWalletAddress(
        await Chain.getChain(
          { chainIdentifier: chainIdentifier ?? 137 },
          txOptions,
        ),
        this.walletUniqueId ?? '0x',
        txOptions,
      )
    }
    return this.address
  }

  /**
   * Retrieves the wallet address associated with the provided unique ID using the given API key.
   * @param {string} uniqueId - The unique ID of the wallet.
   * @param {string} apiKey - The API key to access the required resources.
   * @returns {Promise<Address>} The wallet address.
   */
  static async getAddress(
    uniqueId: string,
    apiKey: string,
    options?: EnvOption,
  ): Promise<Address> {
    globalThis.globalEnvOption.apiKey = apiKey
    return await getWalletAddress(
      await Chain.getChain({ chainIdentifier: 137 }, options),
      keccak256(toBytes(uniqueId)),
      options,
    )
  }

  /**
   * Retrieves the wallet address associated with the provided unique ID in an offline environment.
   * @param {string} uniqueId - The unique ID of the wallet.
   * @param {string} rpcUrl - The URL of the RPC endpoint for offline querying.
   * @param {Address} factoryAddress - The address of the factory contract.
   * @returns {Promise<Address>} The wallet address.
   */
  static async getAddressOffline(
    uniqueId: string,
    rpcUrl: string,
    factoryAddress: Address,
    options?: EnvOption,
  ) {
    const client = createPublicClient({
      transport: http(rpcUrl),
    })
    return await FACTORY_CONTRACT_INTERFACE.readFromChain(
      factoryAddress,
      'getAddress',
      [keccak256(toBytes(uniqueId))],
      client,
      options,
    )
  }

  /**
   * Get all tokens for a specific chain
   * @param {string} chainId string version of the chainId or ALL. If empty, then default to the one in globalEnvOption
   * @param {boolean} onlyVerifiedTokens If true, only return alchemy tokens that are verified(filters spam) - defaults to false
   * @returns JSON
   */
  async getTokens(
    chainIdInput?: string,
    onlyVerifiedTokens = false,
    options?: EnvOption,
  ) {
    let chainId: string
    if (!chainIdInput) {
      const chain = await Chain.getChain(
        {
          chainIdentifier: globalThis.globalEnvOption.chain,
        },
        options,
      )
      chainId = await chain.getChainId(options)
    } else {
      chainId = chainIdInput
    }

    const walletAddress = await this.getAddress(options)
    return chainId === 'ALL'
      ? await getAllWalletTokens({
          walletAddress,
          onlyVerifiedTokens,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: options?.logger,
          signal: options?.signal,
        })
      : await getAllWalletTokensByChainId({
          chainId,
          walletAddress,
          onlyVerifiedTokens,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: options?.logger,
          signal: options?.signal,
        })
  }

  async getLidoWithdrawals(options?: EnvOption) {
    const walletAddress = await this.getAddress(options)
    return await getWalletLidoWithdrawalsByChainId({
      chainId: '1',
      walletAddress,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: options?.logger,
      signal: options?.signal,
    })
  }

  /**
   * Get all tokens on all supported chains. Merge tokens by symbol
   * @param {string} chainIdInput string version of the chainId or ALL. If empty, then default to the one in globalEnvOption
   * @param {*} onlyVerifiedTokens true if you want to filter out spam tokens(Uses alchemy lists)
   * @param {boolean} checkStatus true if you want to check if the address has any pending lido withdrawals
   * @returns JSON of all tokens owned by address
   */
  async getAssets(
    chainIdInput?: string,
    onlyVerifiedTokens = false,
    checkStatus = false,
    options?: EnvOption,
  ) {
    let chainId: string
    if (!chainIdInput) {
      const chain = await Chain.getChain(
        {
          chainIdentifier: globalThis.globalEnvOption.chain,
        },
        options,
      )
      chainId = await chain.getChainId(options)
    } else {
      chainId = chainIdInput
    }
    const tokens = await this.getTokens(chainId, onlyVerifiedTokens, options)
    const lidoWithdrawals: GetWalletLidoWithdrawalsByChainIdResponse =
      checkStatus ? await this.getLidoWithdrawals(options) : [[], []]
    return { ...lidoWithdrawals, ...tokens }
  }

  /**
   * Retrieves the nonce value for the specified sender address and nonce key.
   * If the nonce is unavailable, a random nonce key is generated and returned as the nonce.
   * @param {string} sender - The sender's address.
   * @param {string} key - The nonce key (default: randomly generated).
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<bigint>} The nonce value.
   */
  async getNonce(
    sender: string,
    key = generateRandomNonceKey(),
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<bigint> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const entryPointAddress = await chain.getAddress(
      'entryPointAddress',
      txOptions,
    )
    let nonce = undefined
    let retryCount = 3
    while ((nonce === undefined || nonce === null) && retryCount > 0) {
      nonce = await ENTRYPOINT_CONTRACT_INTERFACE.readFromChain(
        entryPointAddress,
        'getNonce',
        [sender, key],
        chain,
        txOptions,
      )
      retryCount--
    }

    if (nonce !== undefined && nonce !== null) {
      return BigInt(nonce)
    }
    return BigInt(key << 64n)
  }

  /**
   * Retrieves a list of operations associated with the wallet.
   * @param {OperationStatus} status - The status of operations to retrieve (default: OperationStatus.ALL).
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<OperationData[]>} A list of operations.
   */
  async getOperations(
    status: OperationStatus = OperationStatus.ALL,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<OperationData[]> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    return await getOpsOfWallet({
      walletAddr: await this.getAddress(txOptions),
      chainId: await chain.getChainId(txOptions),
      status,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: txOptions?.logger,
      signal: txOptions?.signal,
    })
  }

  /**
   * Retrieves a specific operation by its ID.
   * @param {Hex} opId - The ID of the operation to retrieve.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<OperationData>} The requested operation.
   */
  async getOperation(
    opId: Hex,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<OperationData> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    return (
      await getOps({
        opIds: [opId],
        chainId: await chain.getChainId(txOptions),
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions?.logger,
        signal: txOptions?.signal,
      })
    )[0]
  }

  /**
   * Retrieves a list of users associated with the wallet and their potential corresponding group information.
   * @param {Auth} auth - The authentication instance for retrieving user information.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<User[]>} A list of users with their group information.
   */
  async getUsers(
    auth: Auth,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<User[]> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const storedUserIds = await auth.getUserIds(
      await this.getAddress(txOptions),
      await chain.getChainId(txOptions),
      txOptions,
    )
    const userIds = new Set([...storedUserIds])
    if (this.userInfo) {
      for (const userId of this.userInfo.keys()) {
        userIds.add(userId.toLowerCase() as Hex)
      }
    }

    const users: User[] = []
    const groupIds: Hex[] = []

    for (const userId of userIds) {
      if (
        pad(userId, { size: 32 }).toLowerCase() === (await auth.getUserId())
      ) {
        users.push({ userId: pad(userId, { size: 32 }) } as User)
      } else {
        groupIds.push(pad(userId, { size: 32 }))
      }
    }

    if (groupIds && groupIds.length > 0) {
      const groups = await getGroups({
        groupIds,
        chainId: await chain.getChainId(txOptions),
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions?.logger,
        signal: txOptions?.signal,
      })
      for (const group of groups) {
        users.push({
          userId: group.groupId,
          groupInfo: {
            threshold: group.threshold,
            memberIds: group.memberIds,
          },
        })
      }
    }

    return users
  }

  /**
   * Checks the deployment status of the wallet's address to determine if it's a contract.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<boolean>} `true` if the address is a contract, `false` otherwise.
   */
  async getDeploymentStatus(
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<boolean> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    return await chain.addressIsContract(
      await this.getAddress(txOptions),
      txOptions,
    )
  }

  /**
   * Creates the wallet.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The operation to create the wallet.
   */
  async create(
    auth: Auth,
    userId: string,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const transactionParams: TransactionParams = {
      to: await this.getAddress(txOptions),
      data: '0x',
      value: 0n,
    }
    return await this.createOperation(
      auth,
      userId,
      transactionParams,
      txOptions,
    )
  }

  /**
   * Saves the wallet to the authentication system.
   * @param auth - The auth or signer to save the wallet to.
   * @param txOptions - The configuration options.
   * @returns A Promise that resolves when the wallet is saved to the authentication system.
   */
  async saveWalletToAuth(
    auth: Auth,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<void> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const walletAddr = await this.getAddress(txOptions)
    const userId = await auth.getUserId()
    const users = await auth.getUserIds(
      walletAddr,
      await chain.getChainId(txOptions),
      txOptions,
    )
    if (!users.includes(userId)) {
      if (
        (await checkWalletAccessInitialization({
          walletAddr,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: txOptions?.logger,
          signal: txOptions?.signal,
        })) === false
      ) {
        await initializeWalletAccess({
          walletAddr,
          creatorAddr: await auth.getAddress(),
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: txOptions?.logger,
          signal: txOptions?.signal,
        })
      }
      await addUserToWallet({
        authId: await auth.getAddress(),
        chainId: await chain.getChainId(txOptions),
        walletAddr,
        userIds: [userId],
        walletUniqueId: this.walletUniqueId,
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions?.logger,
        signal: txOptions?.signal,
      })
    }
  }

  /**
   * Creates a new operation to be associated with the wallet and prepares it for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the operation.
   * @param {TransactionParams} transactionParams - The parameters for the transaction.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The created and prepared operation.
   */
  async createOperation(
    auth: Auth,
    userId: string,
    transactionParams: TransactionParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    if (!userId || userId === '') {
      throw new InvalidParameterError(
        ErrorCode.MissingParameter,
        'userId is required',
        'userId is required',
        { userId },
        'Provide userId when createOperation',
        'https://docs.fun.xyz/how-to-guides/execute-transactions#execute-transactions',
      )
    }
    const normalizedUserId = pad(userId as Hex, {
      size: 32,
    }).toLowerCase() as Hex
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const sender = await this.getAddress(txOptions)
    const initCode = (await chain.addressIsContract(sender, txOptions))
      ? '0x'
      : await this.getThisInitCode(chain, txOptions)
    let paymasterAndData = '0x'

    let maxFeePerGas: bigint
    let maxPriorityFeePerGas: bigint
    const chainId = await chain.getChainId(txOptions)
    const OPStackChains = ['10', '8453']
    if (OPStackChains.includes(chainId)) {
      const gasPrice = await chain.getFeeData(txOptions)
      maxFeePerGas = gasPrice.maxFeePerGas
      maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas
    } else {
      maxFeePerGas = 1n
      maxPriorityFeePerGas = 1n
    }

    const partialOp = {
      callData: await this.buildCalldata(
        auth,
        normalizedUserId,
        transactionParams,
        txOptions,
      ),
      paymasterAndData,
      sender,
      maxFeePerGas,
      maxPriorityFeePerGas,
      initCode,
      nonce:
        txOptions.nonce !== null && txOptions.nonce !== undefined
          ? txOptions.nonce
          : await this.getNonce(sender, undefined, txOptions),
      preVerificationGas: 100_000n,
      callGasLimit: BigInt(DEFAULT_USEROP_GAS_LIMIT),
      verificationGasLimit: BigInt(DEFAULT_USEROP_GAS_LIMIT),
    }

    if ((await chain.getChainId(txOptions)) === '36865') {
      partialOp.callGasLimit = BigInt(10e5)
      partialOp.verificationGasLimit = BigInt(10e5)
    }

    const isGroupOp: boolean = (await auth.getUserId()) !== normalizedUserId

    const operation: Operation = new Operation(partialOp, {
      chainId: await chain.getChainId(txOptions),
      opType: isGroupOp
        ? OperationType.GROUP_OPERATION
        : OperationType.SINGLE_OPERATION,
      authType: isGroupOp ? AuthType.MULTI_SIG : AuthType.ECDSA,
      walletAddr: await this.getAddress(txOptions),
      proposer: await auth.getAddress(),
    })

    if (isGroupOp) {
      operation.groupId = normalizedUserId
    }

    if (txOptions.gasSponsor && Object.keys(txOptions.gasSponsor).length > 0) {
      if (txOptions.gasSponsor.token) {
        const sponsor = new TokenSponsor(txOptions)
        if (txOptions.gasSponsor.usePermit) {
          paymasterAndData = (
            await sponsor.getPaymasterAndDataPermit(
              operation,
              await this.getAddress(txOptions),
              normalizedUserId,
              auth,
            )
          ).toLowerCase()
        } else {
          paymasterAndData = (
            await sponsor.getPaymasterAndData(txOptions)
          ).toLowerCase()
        }
      } else if (txOptions.gasSponsor.useCheckoutSponsor) {
        const sponsor = new CheckoutSponsor(txOptions)
        paymasterAndData = (
          await sponsor.getPaymasterAndData(txOptions)
        ).toLowerCase()
      } else {
        const sponsor = new GaslessSponsor(txOptions)
        paymasterAndData = (
          await sponsor.getPaymasterAndData(txOptions)
        ).toLowerCase()
      }
    }
    operation.userOp.paymasterAndData = paymasterAndData

    const estimatedOperation = await this.estimateOperation(
      auth,
      normalizedUserId,
      operation,
      txOptions,
    )

    if (txOptions.bypassInit) {
      estimatedOperation.userOp.initCode = '0x'
    }

    // sign the userOp directly here as we do not have the opId yet
    estimatedOperation.userOp.signature = await auth.signOp(
      estimatedOperation,
      chain,
      isGroupOperation(operation),
      txOptions,
    )

    if (txOptions.skipDBAction !== true) {
      const opId = await createOp({
        op: estimatedOperation,
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions?.logger,
        signal: txOptions?.signal,
      })
      estimatedOperation.opId = opId as Hex
      if (
        !(await checkWalletAccessInitialization({
          walletAddr: sender,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: txOptions?.logger,
          signal: txOptions?.signal,
        }))
      ) {
        await initializeWalletAccess({
          walletAddr: sender,
          creatorAddr: await auth.getAddress(),
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: txOptions?.logger,
          signal: txOptions?.signal,
        })
      }
    }

    return estimatedOperation
  }

  /**
   * Signs an operation using the provided authentication instance and returns the signed operation.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {Operation} operation - The operation to be signed.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The signed operation.
   */
  async signOperation(
    auth: Auth,
    operation: OperationData,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const finalOperation = Operation.convertTypeToObject(operation)
    finalOperation.userOp.signature = await auth.signOp(
      finalOperation,
      chain,
      isGroupOperation(finalOperation),
      txOptions,
    )
    if (isGroupOperation(finalOperation) && txOptions.skipDBAction !== true) {
      await signOp({
        opId: finalOperation.opId ?? '0x',
        chainId: await chain.getChainId(txOptions),
        signature: finalOperation.userOp.signature as Hex,
        signedBy: await auth.getAddress(),
        threshold: this.userInfo?.get(finalOperation.groupId ?? '0x')?.groupInfo
          ?.threshold,
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions?.logger,
        signal: txOptions?.signal,
      })
    }

    return finalOperation
  }

  /**
   * Executes an operation and returns the execution receipt.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {Operation} operation - The operation to be executed.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<ExecutionReceipt>} The execution receipt of the operation.
   */
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO - Complexity
  async executeOperation(
    auth: Auth,
    operation: OperationData,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<ExecutionReceipt> {
    const finalTxOptions = parseOptions(txOptions)
    const finalOperation = Operation.convertTypeToObject(operation)
    const chain = await Chain.getChain(
      {
        chainIdentifier: finalTxOptions.chain,
      },
      txOptions,
    )
    const chainId = await chain.getChainId(txOptions)
    const finalOperationGroupId = finalOperation.groupId ?? '0x'
    const finalOperationOpId = finalOperation.opId ?? '0x'

    if (finalTxOptions.skipDBAction !== true) {
      // cache group info
      if (isGroupOperation(finalOperation)) {
        const groups: GroupMetadata[] = await getGroups({
          groupIds: [finalOperationGroupId],
          chainId,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: txOptions?.logger,
          signal: txOptions?.signal,
        })
        if (groups && groups.length > 0) {
          // could be empty as a new wallet wants to create a group
          this.userInfo?.set(finalOperationGroupId, {
            userId: finalOperationGroupId,
            groupInfo: {
              threshold: groups[0].threshold,
              memberIds: groups[0].memberIds,
            },
          })
        }
      }
    }

    const threshold: number =
      this.userInfo?.get(finalOperationGroupId)?.groupInfo?.threshold ?? 1

    if (threshold <= 1) {
      if (
        !finalOperation.userOp.signature ||
        finalOperation.userOp.signature === '0x'
      ) {
        finalOperation.userOp.signature = await auth.signOp(
          finalOperation,
          chain,
          isGroupOperation(finalOperation),
          txOptions,
        )
      }
    } else {
      if (finalTxOptions.skipDBAction !== true) {
        // check remote collected signature
        const storedOps = await getOps({
          opIds: [finalOperationOpId],
          chainId,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: txOptions?.logger,
          signal: txOptions?.signal,
        })

        let collectedSigCount: number
        if (
          isSignatureMissing(await auth.getUserId(), storedOps[0]?.signatures)
        ) {
          collectedSigCount = storedOps[0]?.signatures?.length
            ? storedOps[0]?.signatures?.length + 1
            : 1
          if (collectedSigCount >= threshold) {
            finalOperation.userOp.signature = await auth.signOp(
              finalOperation,
              chain,
              isGroupOperation(finalOperation),
              txOptions,
            )
          }
        } else {
          collectedSigCount = storedOps[0]?.signatures?.length ?? 1
        }

        if (collectedSigCount < threshold) {
          throw new InvalidParameterError(
            ErrorCode.InsufficientSignatures,
            'Signatures are not sufficient to execute the operation',
            'Signatures are not sufficient to execute the operation',
            { threshold, collectedSigCount, chainId },
            'Only execute operation with enough signatures',
            'https://docs.fun.xyz/how-to-guides/execute-transactions#execute-transactions',
          )
        }
      } else {
        throw new InvalidParameterError(
          ErrorCode.InsufficientSignatures,
          'Signatures are not sufficient to execute the operation',
          'Signatures are not sufficient to execute the operation',
          { threshold, chainId, skipDBAction: finalTxOptions.skipDBAction },
          'Only execute operation with enough signatures',
          'https://docs.fun.xyz/how-to-guides/execute-transactions#execute-transactions',
        )
      }
    }

    let receipt: ExecutionReceipt
    if (isGroupOperation(finalOperation)) {
      receipt = await executeOp({
        input: {
          opId: finalOperationOpId,
          chainId,
          executedBy: await auth.getAddress(),
          entryPointAddress: await chain.getAddress(
            'entryPointAddress',
            txOptions,
          ),
          signature: finalOperation.userOp.signature as Hex,
          groupInfo: this.userInfo?.get(finalOperationGroupId)?.groupInfo,
        },
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions.logger,
        signal: txOptions.signal,
      })
    } else {
      receipt = await executeOp({
        input: {
          opId: finalOperationOpId,
          chainId,
          executedBy: await auth.getAddress(),
          entryPointAddress: await chain.getAddress(
            'entryPointAddress',
            txOptions,
          ),
          signature: finalOperation.userOp.signature as Hex,
          userOp: finalOperation.userOp,
        },
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions.logger,
        signal: txOptions.signal,
      })
    }
    receipt = await getFullReceipt({
      opId: finalOperationOpId,
      chainId,
      userOpHash: receipt.userOpHash,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: txOptions.logger,
      signal: txOptions.signal,
    })
    if (
      isWalletInitOp(finalOperation.userOp) &&
      finalTxOptions.skipDBAction !== true
    ) {
      await addUserToWallet({
        authId: await auth.getAddress(),
        chainId,
        walletAddr: await this.getAddress(finalTxOptions),
        userIds: this.userInfo ? Array.from(this.userInfo.keys()) : [],
        walletUniqueId: this.walletUniqueId,
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: finalTxOptions.logger,
        signal: finalTxOptions.signal,
      })

      if (finalTxOptions?.gasSponsor?.sponsorAddress) {
        const paymasterType = getPaymasterType(finalTxOptions)
        addTransaction({
          chainId,
          timestamp: Date.now(),
          txid: receipt.txId,
          transaction: {
            action: 'sponsor',
            amount: -1, // Get amount from lazy processing
            from: finalTxOptions.gasSponsor.sponsorAddress,
            to: await this.getAddress(finalTxOptions),
            token: 'eth',
            txid: receipt.txId,
          },
          paymasterType,
          sponsorAddress: finalTxOptions.gasSponsor.sponsorAddress,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: finalTxOptions.logger,
          signal: finalTxOptions.signal,
        })
      }
    }
    return receipt
  }

  /**
   * Schedules an operation for execution and returns the scheduled operation's ID.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {Operation} finalOperation - The operation to be scheduled.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Hex>} The ID of the scheduled operation.
   */
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO - Complexity
  async scheduleOperation(
    auth: Auth,
    operation: Operation,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Hex> {
    const finalTxOptions = parseOptions(txOptions)
    const finalOperation = Operation.convertTypeToObject(operation)
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const chainId = await chain.getChainId(txOptions)
    const finalOperationGroupId = finalOperation.groupId ?? '0x'
    const finalOperationOpId = finalOperation.opId ?? '0x'

    if (finalTxOptions.skipDBAction !== true) {
      // cache group info
      if (isGroupOperation(finalOperation)) {
        const groups: GroupMetadata[] = await getGroups({
          groupIds: [finalOperationGroupId],
          chainId,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: txOptions.logger,
          signal: txOptions.signal,
        })
        if (groups && groups.length > 0) {
          // could be empty as a new wallet wants to create a group
          this.userInfo?.set(finalOperationGroupId, {
            userId: finalOperationGroupId,
            groupInfo: {
              threshold: groups[0].threshold,
              memberIds: groups[0].memberIds,
            },
          })
        }
      }
    }

    const threshold: number =
      this.userInfo?.get(finalOperationGroupId)?.groupInfo?.threshold ?? 1

    if (threshold <= 1) {
      if (
        !finalOperation.userOp.signature ||
        finalOperation.userOp.signature === '0x'
      ) {
        finalOperation.userOp.signature = await auth.signOp(
          finalOperation,
          chain,
          isGroupOperation(finalOperation),
          txOptions,
        )
      }
    } else {
      if (finalTxOptions.skipDBAction !== true) {
        // check remote collected signature
        const storedOps = await getOps({
          opIds: [finalOperationOpId],
          chainId,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: txOptions.logger,
          signal: txOptions.signal,
        })

        let collectedSigCount: number
        if (
          isSignatureMissing(await auth.getUserId(), storedOps[0]?.signatures)
        ) {
          collectedSigCount = storedOps[0]?.signatures?.length
            ? storedOps[0]?.signatures?.length + 1
            : 1
          if (collectedSigCount >= threshold) {
            finalOperation.userOp.signature = await auth.signOp(
              finalOperation,
              chain,
              isGroupOperation(finalOperation),
              txOptions,
            )
          }
        } else {
          collectedSigCount = storedOps[0]?.signatures?.length ?? 1
        }

        if (collectedSigCount < threshold) {
          throw new InvalidParameterError(
            ErrorCode.InsufficientSignatures,
            'Signatures are not sufficient to execute the operation',
            'Signatures are not sufficient to execute the operation',
            { threshold, collectedSigCount, chainId },
            'Only execute operation with enough signatures',
            'https://docs.fun.xyz/how-to-guides/execute-transactions#execute-transactions',
          )
        }
      } else {
        throw new InvalidParameterError(
          ErrorCode.InsufficientSignatures,
          'Signatures are not sufficient to execute the operation',
          'Signatures are not sufficient to execute the operation',
          { threshold, chainId, skipDBAction: finalTxOptions.skipDBAction },
          'Only execute operation with enough signatures',
          'https://docs.fun.xyz/how-to-guides/execute-transactions#execute-transactions',
        )
      }
    }

    if (isGroupOperation(finalOperation)) {
      await scheduleOp({
        input: {
          opId: finalOperationOpId,
          chainId,
          scheduledBy: await auth.getAddress(),
          entryPointAddress: await chain.getAddress(
            'entryPointAddress',
            txOptions,
          ),
          signature: finalOperation.userOp.signature as Hex,
          groupInfo: this.userInfo?.get(finalOperationGroupId)?.groupInfo,
        },
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions.logger,
        signal: txOptions.signal,
      })
    } else {
      await scheduleOp({
        input: {
          opId: finalOperationOpId,
          chainId,
          scheduledBy: await auth.getAddress(),
          entryPointAddress: await chain.getAddress(
            'entryPointAddress',
            txOptions,
          ),
          signature: finalOperation.userOp.signature as Hex,
          userOp: finalOperation.userOp,
        },
        apiKey: globalThis.globalEnvOption.apiKey,
        logger: txOptions.logger,
        signal: txOptions.signal,
      })
    }
    if (!finalOperation.opId) {
      throw new InternalFailureError(
        ErrorCode.ServerFailure,
        'Operation id is required',
        '',
        finalOperation,
        'Make sure you are scheduling a valid operation',
        'https://docs.fun.xyz/',
      )
    }
    return finalOperation.opId
  }

  /**
   * Removes an operation from the system using its ID.
   * @param {Auth} _ - The authentication instance (not used in this method).
   * @param {Hex} operationId - The ID of the operation to be removed.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<void>} A promise that resolves after the operation is removed.
   */
  async removeOperation(
    _: Auth,
    operationId: Hex,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<void> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    await deleteOp({
      opId: operationId,
      chainId: await chain.getChainId(txOptions),
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: txOptions?.logger,
      signal: txOptions?.signal,
    })
  }

  /**
   * Creates and prepares a rejection operation for an existing operation.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} groupId - The ID of the group to which the operation belongs.
   * @param {Operation} operation - The operation to be rejected.
   * @param {string} rejectionMessage - Optional rejection message.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared rejection operation.
   */
  async createRejectOperation(
    auth: Auth,
    groupId: string,
    operation: OperationData,
    rejectionMessage?: string,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ) {
    const rejectOperation = await this.transfer(
      auth,
      groupId,
      { to: await this.getAddress(txOptions), amount: 0, token: 'eth' },
      {
        ...txOptions,
        skipDBAction: true,
        nonce: BigInt(operation.userOp.nonce),
      },
    )
    if (rejectionMessage) {
      rejectOperation.message = rejectionMessage
    }
    rejectOperation.relatedOpIds = [operation.opId ?? '0x']
    rejectOperation.opType = OperationType.REJECTION
    rejectOperation.opId = (await createOp({
      op: rejectOperation,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: txOptions.logger,
      signal: txOptions.signal,
    })) as Hex
    return rejectOperation
  }

  /**
   * Estimates the gas cost for executing an operation and returns the updated operation with gas estimation details.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the operation.
   * @param {Operation} operation - The operation for which to estimate gas.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The updated operation with gas estimation details.
   */
  async estimateOperation(
    auth: Auth,
    userId: string,
    operation: Operation,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const estimateGasSignature = await auth.getEstimateGasSignature(
      userId,
      operation,
    )
    operation.userOp.signature = estimateGasSignature.toLowerCase()
    // FIXME: Nov 22 - Skipping estimation as pimlico will throw errors now unless state is mocked
    // https://fun-xyz.slack.com/archives/C04Q5T1MQP3/p1732304544612249?thread_ts=1732302272.386699&cid=C04Q5T1MQP3
    // const estimationPaymasterAddress = await chain.getAddress(
    //   'estimationPaymasterAddress',
    // )
    const paymasterAndData = operation.userOp.paymasterAndData
    // const res = await chain.estimateOpGas({
    //   ...operation.userOp,
    //   paymasterAndData: estimationPaymasterAddress,
    // })
    operation.userOp = {
      ...operation.userOp,
      // ...res,
      paymasterAndData,
    }

    const { maxFeePerGas, maxPriorityFeePerGas } =
      await chain.getFeeData(txOptions)
    operation.userOp.maxFeePerGas = maxFeePerGas
    operation.userOp.maxPriorityFeePerGas = maxPriorityFeePerGas
    return operation
  }

  private async getThisInitCode(chain: Chain, options?: EnvOption) {
    const owners: Hex[] = this.userInfo ? Array.from(this.userInfo.keys()) : []
    const entryPointAddress = await chain.getAddress(
      'entryPointAddress',
      options,
    )
    const factoryAddress = await chain.getAddress('factoryAddress', options)
    const rbac = await chain.getAddress('rbacAddress', options)
    const userAuth = await chain.getAddress('userAuthAddress', options)

    const loginData: LoginData = {
      salt: this.walletUniqueId,
    }

    const rbacInitData = toBytes32Arr(owners)

    let userAuthInitData = '0x' as Hex
    const groupUsers: User[] = this.userInfo
      ? Array.from(this.userInfo.values()).filter(
          (user) => user.groupInfo !== null && user.groupInfo !== undefined,
        )
      : []
    if (groupUsers.length > 0) {
      userAuthInitData = encodeUserAuthInitData(groupUsers)
    }

    const initCodeParams: InitCodeParams = {
      entryPointAddress,
      factoryAddress,
      implementationAddress: AddressZero,
      loginData,
      verificationAddresses: [rbac, userAuth],
      verificationData: [rbacInitData, userAuthInitData],
    }

    return this.getInitCode(initCodeParams)
  }

  private getInitCode(input: InitCodeParams) {
    const encodedVerificationInitdata = encodeAbiParameters(
      [
        {
          type: 'address[]',
          name: 'verificationAddresses',
        },
        {
          type: 'bytes[]',
          name: 'verificationData',
        },
      ],
      [input.verificationAddresses, input.verificationData],
    )
    const initializerCallData = WALLET_CONTRACT_INTERFACE.encodeData(
      'initialize',
      [input.entryPointAddress, encodedVerificationInitdata],
    )

    const data = FACTORY_CONTRACT_INTERFACE.encodeData('createAccount', [
      initializerCallData,
      encodeLoginData(input.loginData),
    ])
    return concat([input.factoryAddress, data])
  }

  /**
   * Encodes arbitrary transactions calls to include fees
   * @param params Transaction Params, generated from various calldata generating functions
   * @param options EnvOptions to read fee data from
   * @returns calldata to be passed into createUserOperation
   */
  private async buildCalldata(
    auth: Auth,
    userId: string,
    params: TransactionParams,
    options: EnvOption,
  ): Promise<Hex> {
    if (!params.value) {
      params.value = 0n
    }
    if (options.fee) {
      if (
        !options.fee.token &&
        options.gasSponsor &&
        options.gasSponsor.token
      ) {
        options.fee.token = options.gasSponsor.token
      }
      if (!options.fee.token) {
        throw new InvalidParameterError(
          ErrorCode.MissingParameter,
          'EnvOption.fee.token or EnvOption.gasSponsor.token is required',
          'EnvOption.fee.token or EnvOption.gasSponsor.token is required',
          { options },
          'Provide EnvOption.fee.token or EnvOption.gasSponsor.token when calling wallet.createOperation',
          'https://docs.fun.xyz/how-to-guides/execute-transactions#execute-transactions',
        )
      }
      if (!options.fee.recipient) {
        throw new InvalidParameterError(
          ErrorCode.MissingParameter,
          'EnvOption.fee.recipient is required',
          'EnvOption.fee.recipient is required',
          { options },
          'Provide EnvOption.fee.recipient when calling wallet.createOperation',
          'https://docs.fun.xyz/how-to-guides/execute-transactions#execute-transactions',
        )
      }

      const chain = await Chain.getChain(
        { chainIdentifier: options.chain },
        options,
      )
      const token = new Token(options.fee.token, chain)
      if (options.fee.gasPercent && !token.isNative) {
        throw new InvalidParameterError(
          ErrorCode.InvalidParameterCombination,
          'GasPercent is only valid for native tokens',
          'GasPercent is only valid for native tokens',
          { options },
          'Use native token as the fee token if you want to charge fee based on percentage',
          'https://docs.fun.xyz/how-to-guides/configure-environment/set-developer-fee',
        )
      }

      if (token.isNative) {
        options.fee.token = AddressZero
      } else {
        options.fee.token = await token.getAddress(options)
      }

      if (options.fee.amount) {
        options.fee.amount = Number(
          await token.getDecimalAmount(options.fee.amount, options),
        )
      } else if (options.fee.gasPercent) {
        const feedata = [options.fee.token, options.fee.recipient, 1]
        const estimateGasCalldata = WALLET_CONTRACT_INTERFACE.encodeData(
          'execFromEntryPointWithFee',
          [params.to, params.value, params.data, feedata],
        )
        const operation = await this.createOperation(
          auth,
          userId,
          { to: params.to, value: params.value, data: estimateGasCalldata },
          { ...options, fee: undefined },
        )
        const gasUsed = operation.getMaxTxCost()
        options.fee.amount = Math.ceil(
          (Number(gasUsed) * options.fee.gasPercent) / 100,
        )
      } else {
        throw new InvalidParameterError(
          ErrorCode.MissingParameter,
          'EnvOption.fee.amount or EnvOption.fee.gasPercent is required',
          'EnvOption.fee.amount or EnvOption.fee.gasPercent is required',
          { options },
          'Provide either EnvOption.fee.amount or EnvOption.fee.gasPercent when calling wallet.createOperation',
          'https://docs.fun.xyz/how-to-guides/configure-environment/set-developer-fee',
        )
      }
      const feedata = [
        options.fee.token,
        options.fee.recipient,
        options.fee.amount,
      ]
      return WALLET_CONTRACT_INTERFACE.encodeData('execFromEntryPointWithFee', [
        params.to,
        params.value,
        params.data,
        feedata,
      ])
    }
    return WALLET_CONTRACT_INTERFACE.encodeData('execFromEntryPoint', [
      params.to,
      params.value,
      params.data,
    ])
  }
}
