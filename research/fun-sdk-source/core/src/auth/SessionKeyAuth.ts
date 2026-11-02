import { type Hash, type Hex, decodeAbiParameters, pad, toBytes } from 'viem'

import { ETH_TRANSFER_SELECTOR, WALLET_ABI } from '../common'
import {
  type Chain,
  type Operation,
  type WalletSignature,
  encodeWalletSignature,
} from '../data'
import type { MerkleTree } from '../utils/MerkleUtils'
import { getSigHash } from '../utils/ViemUtils'
import { Auth } from './Auth'
import type { AuthInput, WalletCallData } from './types'

const SELECTOR_LENGTH = 10

export class SessionKeyAuth extends Auth {
  ruleId: Hex
  roleId: Hex

  targetSelectorMerkleTree: MerkleTree
  feeRecipientMerkleTree: MerkleTree

  constructor(
    authInput: AuthInput,
    ruleId: Hex,
    roleId: Hex,
    targetSelectorMerkleTree: MerkleTree,
    feeRecipientMerkleTree: MerkleTree,
  ) {
    super(authInput)
    this.ruleId = ruleId
    this.roleId = roleId
    this.targetSelectorMerkleTree = targetSelectorMerkleTree
    this.feeRecipientMerkleTree = feeRecipientMerkleTree
  }

  override async signOp(operation: Operation, chain: Chain): Promise<Hex> {
    if (!this.targetSelectorMerkleTree) {
      throw new Error('SessionKeyAuth not connected to wallet')
    }
    await this.init()
    const opHash = await operation.getOpHash(chain)

    let signature: Hash
    if (this.signer?.type === 'local') {
      signature = await this.signer.signMessage({
        message: { raw: toBytes(opHash) },
      })
    } else if (this.client && this.account) {
      signature = await this.client.signMessage({
        account: this.account,
        message: { raw: toBytes(opHash) },
      })
    } else {
      throw new Error('No signer or client')
    }
    const target = getTargetFromCall(operation.userOp.callData as Hex)
    const selector = getSelectorFromCall(operation.userOp.callData as Hex)
    const walletSignature: WalletSignature = {
      userId: await this.getUserId(),
      signature,
      roleId: this.roleId,
      ruleId: this.ruleId,
      extraData: {
        targetPath: this.targetSelectorMerkleTree.getPathForItem(target),
        selectorPath: this.targetSelectorMerkleTree.getPathForItem(selector),
      },
    }
    return encodeWalletSignature(walletSignature)
  }

  override async getEstimateGasSignature(
    userId: string,
    operation: Operation,
  ): Promise<Hex> {
    if (!this.targetSelectorMerkleTree) {
      throw new Error('SessionKeyAuth not connected to wallet')
    }
    await this.init()
    const target = getTargetFromCall(operation.userOp.callData as Hex)
    const selector = getSelectorFromCall(operation.userOp.callData as Hex)
    try {
      const walletSignature: WalletSignature = {
        userId: pad(userId as Hex, { size: 32 }),
        signature: pad('0x', { size: 65 }),
        roleId: this.roleId,
        ruleId: this.ruleId,
        extraData: {
          targetPath: this.targetSelectorMerkleTree.getPathForItem(target),
          selectorPath: this.targetSelectorMerkleTree.getPathForItem(selector),
        },
      }
      return encodeWalletSignature(walletSignature)
    } catch {
      throw new Error('Function or target is not allowed in session key')
    }
  }
}

export const getTargetFromCall = (callData: Hex): Hex => {
  return decodeCalldata(callData).target
}
export const getSelectorFromCall = (callData: Hex): Hex => {
  const out = decodeCalldata(callData).calldata.slice(0, SELECTOR_LENGTH) as Hex
  return out === '0x' ? ETH_TRANSFER_SELECTOR : out
}

export const decodeCalldata = (callData: Hex): WalletCallData => {
  const execFromEntryPointFeeSelector = getSigHash(
    WALLET_ABI,
    'execFromEntryPointWithFee',
  )
  const execFromEntryPointSelector = getSigHash(
    WALLET_ABI,
    'execFromEntryPoint',
  )
  if (callData.includes(execFromEntryPointFeeSelector)) {
    return _decodeExecWithFee(callData)
  }
  if (callData.includes(execFromEntryPointSelector)) {
    return _decodeExec(callData)
  }
  throw new Error(
    'invalid call data. must be execFromEntryPoint or execFromEntryPointWithFee',
  )
}

const _decodeExecWithFee = (callData: Hex): WalletCallData => {
  const walletcalldata: Hex = `0x${callData.slice(SELECTOR_LENGTH)}`
  const [target, value, calldata] = decodeAbiParameters(
    [{ type: 'address' }, { type: 'uint256' }, { type: 'bytes' }],
    walletcalldata,
  )
  return {
    target,
    value,
    calldata,
  }
}
const _decodeExec = (callData: Hex): WalletCallData => {
  const walletcalldata: Hex = `0x${callData.slice(SELECTOR_LENGTH)}`
  const [target, value, calldata] = decodeAbiParameters(
    [{ type: 'address' }, { type: 'uint256' }, { type: 'bytes' }],
    walletcalldata,
  )
  return {
    target,
    value,
    calldata,
  }
}
