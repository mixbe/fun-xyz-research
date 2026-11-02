import type {
  AuthType,
  OperationData,
  OperationMetadata,
  OperationStatus,
  OperationType,
  Signature,
  UserOperation,
} from '@funkit/api-base'
import type { Address, Hex } from 'viem'
import type { Auth } from '../auth'
import {
  DEFAULT_USEROP_GAS_LIMIT,
  ENTRYPOINT_CONTRACT_INTERFACE,
} from '../common/constants'
import type { EnvOption } from '../config'
import { calcPreVerificationGas } from '../utils'
import { Chain } from './Chain'

export class Operation implements OperationData {
  opId?: Hex
  chainId: string
  opType: OperationType
  authType: AuthType
  groupId?: Hex
  message?: string
  walletAddr: Address
  userOp: UserOperation
  status?: OperationStatus
  proposer: string // do not use address in case we later use non-address data as the proposer
  proposedTime?: number
  executedBy?: string
  executedTime?: number
  relatedOpIds?: Hex[]
  signatures?: Signature[]
  txid?: string
  gasUsed?: string
  opFeeUSD?: string
  opFee?: string
  executedBlockNumber?: number
  executedBlockTimeStamp?: number

  constructor(userOp: UserOperation, metadata: OperationMetadata) {
    this.userOp = userOp
    this.userOp.preVerificationGas = userOp.preVerificationGas
      ? userOp.preVerificationGas
      : calcPreVerificationGas(this.userOp)
    this.opId = metadata.opId
    this.chainId = metadata.chainId
    this.opType = metadata.opType
    this.authType = metadata.authType
    this.groupId = metadata.groupId
    this.message = metadata.message
    this.walletAddr = metadata.walletAddr
    this.status = metadata.status
    this.proposer = metadata.proposer
    this.proposedTime = metadata.proposedTime
    this.executedBy = metadata.executedBy
    this.executedTime = metadata.executedTime
    this.relatedOpIds = metadata.relatedOpIds
    this.signatures = metadata.signatures
    this.txid = metadata.txid
    this.gasUsed = metadata.gasUsed
    this.opFeeUSD = metadata.opFeeUSD
    this.opFee = metadata.opFee
    this.executedBlockNumber = metadata.executedBlockNumber
    this.executedBlockTimeStamp = metadata.executedBlockTimeStamp
  }

  static convertTypeToObject(op: OperationData): Operation {
    return new Operation(op.userOp, op)
  }

  async getOpHash(chain: Chain, options?: EnvOption): Promise<Hex> {
    const entryPointAddress = await chain.getAddress(
      'entryPointAddress',
      options,
    )
    return await ENTRYPOINT_CONTRACT_INTERFACE.readFromChain(
      entryPointAddress,
      'getUserOpHash',
      [this.userOp],
      chain,
      options,
    )
  }

  getMaxTxCost(): bigint {
    const {
      maxFeePerGas,
      preVerificationGas,
      callGasLimit,
      verificationGasLimit,
    } = this.userOp

    const mul: bigint = this.userOp.paymasterAndData !== '0x' ? 3n : 1n
    const additionalGas = preVerificationGas ? preVerificationGas : 0n
    const requiredGas: bigint =
      callGasLimit + verificationGasLimit * mul + additionalGas

    return BigInt(maxFeePerGas) * requiredGas
  }

  async estimateGas(
    auth: Auth,
    userId: string,
    options: EnvOption = globalThis.globalEnvOption,
  ): Promise<Operation> {
    if (!this.userOp.signature || this.userOp.signature === '0x') {
      this.userOp.signature = await auth.getEstimateGasSignature(userId, this)
    }
    const chain = await Chain.getChain(
      { chainIdentifier: options.chain },
      options,
    )
    const res = await chain.estimateOpGas(
      {
        ...this.userOp,
        paymasterAndData: '0x',
        maxFeePerGas: 0n,
        maxPriorityFeePerGas: 0n,
        preVerificationGas: 0n,
        callGasLimit: 0n,
        verificationGasLimit: BigInt(DEFAULT_USEROP_GAS_LIMIT),
      },
      options,
    )

    this.userOp.preVerificationGas = res.preVerificationGas
    this.userOp.verificationGasLimit = res.verificationGasLimit
    this.userOp.callGasLimit = res.callGasLimit

    return this
  }
}
