import { type Address, pad } from 'viem'

import {
  ErrorCode,
  InvalidParameterError,
  ResourceNotFoundError,
} from '@funkit/utils'
import type { Auth } from '../auth'
import type { TransactionParams } from '../common'
import type { EnvOption } from '../config'
import { Chain, type Operation } from '../data'
import { getOnChainGroupData } from '../utils/GroupUtils'
import {
  addOwnerTxParams,
  createSessionKeyTransactionParams,
  removeOwnerTxParams,
} from './AccessControl'
import { createExecuteBatchTxParams } from './BatchActions'
import {
  createGroupTxParams,
  removeGroupTxParams,
  updateGroupTxParams,
} from './Group'
import {
  finishUnstakeTransactionParams,
  isFinishUnstakeParams,
  isRequestUnstakeParams,
  requestUnstakeTransactionParams,
  stakeTransactionParams,
} from './Stake'
import {
  erc20ApproveTransactionParams,
  isERC20ApproveParams,
  isTokenTransferParams,
  tokenTransferFromTransactionParams,
  tokenTransferTransactionParams,
} from './Token'
import type {
  AddOwnerParams,
  AddUserToGroupParams,
  ApproveParams,
  CreateGroupParams,
  FinishUnstakeParams,
  RemoveGroupParams,
  RemoveOwnerParams,
  RemoveUserFromGroupParams,
  RequestUnstakeParams,
  SessionKeyParams,
  StakeParams,
  TransferParams,
  UpdateGroupParams,
  UpdateThresholdOfGroupParams,
} from './types'

export abstract class FirstClassActions {
  protected chain: Chain

  constructor(chain: Chain) {
    this.chain = chain
  }

  /**
   * Creates a new operation to be associated with the wallet and prepares it for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the operation.
   * @param {TransactionParams} transactionParams - The parameters for the transaction.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The created and prepared operation.
   */
  abstract createOperation(
    auth: Auth,
    userId: string,
    transactionParams: TransactionParams,
    txOptions: EnvOption,
  ): Promise<Operation>

  /**
   * Retrieves the wallet address associated with this FunWallet. The address should be the same for all EVM chains so no input is needed
   * If the address is not already cached, it fetches it using the wallet's unique ID and chain information.
   * @returns {Promise<Address>} The wallet address.
   */
  abstract getAddress(options?: EnvOption): Promise<Address>

  /**
   * Initiates a transfer operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the transfer.
   * @param {TransferParams} params - The parameters for the transfer.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared transfer operation.
   * @throws {InvalidParameterError} When provided parameters are missing or incorrect.
   */
  async transfer(
    auth: Auth,
    userId: string,
    params: TransferParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const overrideChain = await Chain.getChain(
      { chainIdentifier: txOptions?.chain },
      txOptions,
    )
    let transactionParams: TransactionParams
    if (isTokenTransferParams(params)) {
      if (params.from) {
        transactionParams = await tokenTransferFromTransactionParams(
          params,
          overrideChain ?? this.chain,
          txOptions,
        )
      } else {
        transactionParams = await tokenTransferTransactionParams(
          params,
          overrideChain ?? this.chain,
          txOptions,
        )
      }
    } else {
      throw new InvalidParameterError(
        ErrorCode.InvalidParameter,
        'Params were missing or incorrect',
        'Params were missing or incorrect',
        { params },
        'Provide correct transfer params.',
        'https://docs.fun.xyz',
      )
    }
    return await this.createOperation(
      auth,
      userId,
      transactionParams,
      txOptions,
    )
  }

  /**
   * Initiates a erc20/erc721 token approval operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the token approval.
   * @param {ApproveParams} params - The parameters for the token approval.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared token approval operation.
   * @throws {InvalidParameterError} When provided parameters are missing or incorrect.
   */
  async tokenApprove(
    auth: Auth,
    userId: string,
    params: ApproveParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    let transactionParams: TransactionParams
    if (isERC20ApproveParams(params)) {
      transactionParams = await erc20ApproveTransactionParams(params, txOptions)
    } else {
      throw new InvalidParameterError(
        ErrorCode.InvalidParameter,
        'Params were missing or incorrect',
        'Params were missing or incorrect',
        { params },
        'Provide correct token approve params.',
        'https://docs.fun.xyz',
      )
    }
    return await this.createOperation(
      auth,
      userId,
      transactionParams,
      txOptions,
    )
  }

  /**
   * Initiates a stake operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the stake operation.
   * @param {StakeParams} params - The parameters for the stake operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared stake operation.
   */
  async stake(
    auth: Auth,
    userId: string,
    params: StakeParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const transactionParams = await stakeTransactionParams(params, txOptions)
    return await this.createOperation(
      auth,
      userId,
      transactionParams,
      txOptions,
    )
  }

  /**
   * Initiates an unstake operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the unstake operation.
   * @param {RequestUnstakeParams | FinishUnstakeParams} params - The parameters for the unstake operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared unstake operation.
   * @throws {InvalidParameterError} When provided parameters are missing or incorrect.
   */
  async unstake(
    auth: Auth,
    userId: string,
    params: RequestUnstakeParams | FinishUnstakeParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    params.recipient ??= await this.getAddress(txOptions)
    let transactionParams: TransactionParams
    if (isRequestUnstakeParams(params)) {
      transactionParams = await requestUnstakeTransactionParams(
        params as RequestUnstakeParams,
        txOptions,
      )
    } else if (isFinishUnstakeParams(params)) {
      transactionParams = await finishUnstakeTransactionParams(
        params as FinishUnstakeParams,
        txOptions,
      )
    } else {
      throw new InvalidParameterError(
        ErrorCode.InvalidParameter,
        'Params were missing or incorrect',
        'Params were missing or incorrect',
        { params },
        'Provide correct unstake params.',
        'https://docs.fun.xyz',
      )
    }
    return await this.createOperation(
      auth,
      userId,
      transactionParams,
      txOptions,
    )
  }

  /**
   * Initiates a session key creation operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the session key creation.
   * @param {SessionKeyParams} params - The parameters for the session key creation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared session key creation operation.
   */
  async createSessionKey(
    auth: Auth,
    userId: string,
    params: SessionKeyParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const transactionParams = await createSessionKeyTransactionParams(
      params,
      txOptions,
    )
    return await this.createOperation(
      auth,
      userId,
      transactionParams,
      txOptions,
    )
  }

  /**
   * Initiates an add owner operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the add owner operation.
   * @param {AddOwnerParams} params - The parameters for the add owner operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared add owner operation.
   */
  async addOwner(
    auth: Auth,
    userId: string,
    params: AddOwnerParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const txParams = await addOwnerTxParams(params, txOptions)
    return await this.createOperation(auth, userId, txParams, txOptions)
  }

  /**
   * Initiates a remove owner operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the remove owner operation.
   * @param {RemoveOwnerParams} params - The parameters for the remove owner operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared remove owner operation.
   */
  async removeOwner(
    auth: Auth,
    userId: string,
    params: RemoveOwnerParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const txParams = await removeOwnerTxParams(params, txOptions)
    return await this.createOperation(auth, userId, txParams, txOptions)
  }

  /**
   * Initiates a create group operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the create group operation.
   * @param {CreateGroupParams} params - The parameters for the create group operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared create group operation.
   */
  async createGroup(
    auth: Auth,
    userId: string,
    params: CreateGroupParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const txParams = await createGroupTxParams(params, txOptions)
    return await this.createOperation(auth, userId, txParams, txOptions)
  }

  /**
   * Initiates an add user to group operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the add user to group operation.
   * @param {AddUserToGroupParams} params - The parameters for the add user to group operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared add user to group operation.
   */
  async addUserToGroup(
    auth: Auth,
    userId: string,
    params: AddUserToGroupParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    params.userId = pad(params.userId, { size: 32 })
    params.groupId = pad(params.groupId, { size: 32 })
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const onChainGroupData = await getOnChainGroupData(
      params.groupId,
      chain,
      await this.getAddress(txOptions),
      txOptions,
    )
    if (!onChainGroupData || onChainGroupData.memberIds.length === 0) {
      throw new ResourceNotFoundError(
        ErrorCode.GroupNotFound,
        'group is not found',
        'group is not found',
        { params },
        'Provide correct groupId and chainId.',
        'https://docs.fun.xyz',
      )
    }

    const originalMembers = new Set(onChainGroupData.memberIds)
    const members = new Set(onChainGroupData.memberIds)
    members.add(params.userId)
    if (members.size <= originalMembers.size) {
      throw new InvalidParameterError(
        ErrorCode.UserAlreadyExists,
        'user already exists in group',
        'user already exists in group',
        { params, originalMembers, userId: params.userId },
        'Catch this error and swallow it as the user is already added.',
        'https://docs.fun.xyz',
      )
    }

    const updateGroupParams: UpdateGroupParams = {
      groupId: params.groupId,
      group: {
        userIds: Array.from(members),
        threshold: onChainGroupData.threshold,
      },
    }

    const txParams = await updateGroupTxParams(updateGroupParams, txOptions)
    return await this.createOperation(auth, userId, txParams, txOptions)
  }

  /**
   * Initiates a remove user from group operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the remove user from group operation.
   * @param {RemoveUserFromGroupParams} params - The parameters for the remove user from group operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared remove user from group operation.
   */
  async removeUserFromGroup(
    auth: Auth,
    userId: string,
    params: RemoveUserFromGroupParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    params.userId = pad(params.userId, { size: 32 })
    params.groupId = pad(params.groupId, { size: 32 })
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const onChainGroupData = await getOnChainGroupData(
      params.groupId,
      chain,
      await this.getAddress(txOptions),
      txOptions,
    )
    if (!onChainGroupData || onChainGroupData.memberIds.length === 0) {
      throw new ResourceNotFoundError(
        ErrorCode.GroupNotFound,
        'group is not found',
        'group is not found',
        { params },
        'Provide correct groupId and chainId.',
        'https://docs.fun.xyz',
      )
    }

    const originalMembers = new Set(onChainGroupData.memberIds)
    const members = new Set(onChainGroupData.memberIds)
    members.delete(params.userId)
    if (members.size >= originalMembers.size) {
      throw new ResourceNotFoundError(
        ErrorCode.UserNotFound,
        'user does not exist in group',
        'user does not exist in group',
        { params, originalMembers, userId: params.userId },
        'Catch this error and swallow it as the user does not exist in the group.',
        'https://docs.fun.xyz',
      )
    }

    const updateGroupParams: UpdateGroupParams = {
      groupId: params.groupId,
      group: {
        userIds: Array.from(members),
        threshold: onChainGroupData.threshold,
      },
    }
    const txParams = await updateGroupTxParams(updateGroupParams, txOptions)
    return await this.createOperation(auth, userId, txParams, txOptions)
  }

  /**
   * Initiates an update threshold of group operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the update threshold of group operation.
   * @param {UpdateThresholdOfGroupParams} params - The parameters for the update threshold of group operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared update threshold of group operation.
   */
  async updateThresholdOfGroup(
    auth: Auth,
    userId: string,
    params: UpdateThresholdOfGroupParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    params.groupId = pad(params.groupId, { size: 32 })
    const chain = await Chain.getChain(
      { chainIdentifier: txOptions.chain },
      txOptions,
    )
    const onChainGroupData = await getOnChainGroupData(
      params.groupId,
      chain,
      await this.getAddress(txOptions),
      txOptions,
    )
    if (!onChainGroupData || onChainGroupData.memberIds.length === 0) {
      throw new ResourceNotFoundError(
        ErrorCode.GroupNotFound,
        'group is not found',
        'group is not found',
        { params },
        'Provide correct groupId and chainId.',
        'https://docs.fun.xyz',
      )
    }

    if (
      !Number.isInteger(params.threshold) ||
      params.threshold < 1 ||
      params.threshold > onChainGroupData.memberIds.length
    ) {
      throw new InvalidParameterError(
        ErrorCode.InvalidThreshold,
        'threshold can not be 0 or bigger than number of members in the group',
        'threshold can not be 0 or bigger than number of members in the group',
        { params, memberIds: onChainGroupData.memberIds },
        'Provide proper threshold number.',
        'https://docs.fun.xyz',
      )
    }

    const updateGroupParams: UpdateGroupParams = {
      groupId: params.groupId,
      group: {
        userIds: onChainGroupData.memberIds,
        threshold: params.threshold,
      },
    }
    const txParams = await updateGroupTxParams(updateGroupParams, txOptions)
    return await this.createOperation(auth, userId, txParams, txOptions)
  }

  /**
   * Initiates a remove group operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the remove group operation.
   * @param {RemoveGroupParams} params - The parameters for the remove group operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared remove group operation.
   */
  async removeGroup(
    auth: Auth,
    userId: string,
    params: RemoveGroupParams,
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    params.groupId = pad(params.groupId, { size: 32 })
    const txParams = await removeGroupTxParams(params, txOptions)
    return await this.createOperation(auth, userId, txParams, txOptions)
  }

  /**
   * Initiates a batch operation and returns the prepared operation for execution.
   * @param {Auth} auth - The authentication instance for the user.
   * @param {string} userId - The ID of the user initiating the batch operation.
   * @param {TransactionParams[]} params - An array of transaction parameters for the batch operation.
   * @param {EnvOption} txOptions - Transaction environment options (default: global environment options).
   * @returns {Promise<Operation>} The prepared batch operation.
   */
  async createBatchOperation(
    auth: Auth,
    userId: string,
    params: TransactionParams[],
    txOptions: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    const walletAddress = await this.getAddress(txOptions)
    const txParams = createExecuteBatchTxParams(params, walletAddress)
    return await this.createOperation(auth, userId, txParams, txOptions)
  }
}
