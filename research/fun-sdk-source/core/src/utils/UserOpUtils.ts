import {
  type ByteArray,
  type Hex,
  encodeAbiParameters,
  keccak256,
  toBytes,
  toHex,
} from 'viem'

import type { UserOperation } from '@funkit/api-base'
import { ENTRYPOINT_CONTRACT_INTERFACE } from '../common'
import type { EnvOption } from '../config'
import type { Chain } from '../data'

export const calcPreVerificationGas = (userOp: UserOperation): bigint => {
  const ov = DefaultGasOverheads
  const p = Object.assign(
    {
      preVerificationGas: 28000,
      signature: toHex(Buffer.alloc(ov.sigSize, 1)),
    },
    userOp,
  )
  const packed = toBytes(packUserOp(p, false))
  const callDataCost = packed
    .map((x) => (x === 0 ? ov.zeroByte : ov.nonZeroByte))
    .reduce((sum, x) => sum + x)
  const ret = Math.round(
    callDataCost +
      ov.fixed / ov.bundleSize +
      ov.perUserOp +
      ov.perUserOpWord * packed.length,
  )
  return BigInt(ret)
}

function encode(
  typevalues: {
    type: string
    val: unknown
  }[],
  forSignature: boolean,
) {
  const types = typevalues.map((typevalue) =>
    typevalue.type === 'bytes' && forSignature ? 'bytes32' : typevalue.type,
  )
  const values = typevalues.map((typevalue) =>
    typevalue.type === 'bytes' && forSignature
      ? keccak256(typevalue.val as ByteArray | `0x${string}`)
      : typevalue.val,
  )

  return encodeAbiParameters(types, values as never)
}

function packUserOp(op: UserOperation, forSignature = true): Hex {
  if (forSignature) {
    const encoded = encodeAbiParameters(
      [userOpTypeSig],
      [{ ...op, signature: '0x' }],
    )
    return `0x${encoded.slice(66, encoded.length - 64)}`
  }

  const typevalues = UserOpType.components.map((c) => ({
    type: c.type,
    val: op[c.name],
  }))
  return encode(typevalues, forSignature)
}

// Constants

const DefaultGasOverheads = {
  fixed: 28000,
  perUserOp: 18300,
  perUserOpWord: 4,
  zeroByte: 4,
  nonZeroByte: 16,
  bundleSize: 1,
  sigSize: 65,
}

const UserOpType = {
  components: [
    { internalType: 'address', name: 'sender', type: 'address' },
    { internalType: 'uint256', name: 'nonce', type: 'uint256' },
    { internalType: 'bytes', name: 'initCode', type: 'bytes' },
    { internalType: 'bytes', name: 'callData', type: 'bytes' },
    { internalType: 'uint256', name: 'callGasLimit', type: 'uint256' },
    {
      internalType: 'uint256',
      name: 'verificationGasLimit',
      type: 'uint256',
    },
    {
      internalType: 'uint256',
      name: 'preVerificationGas',
      type: 'uint256',
    },
    { internalType: 'uint256', name: 'maxFeePerGas', type: 'uint256' },
    {
      internalType: 'uint256',
      name: 'maxPriorityFeePerGas',
      type: 'uint256',
    },
    { internalType: 'bytes', name: 'paymasterAndData', type: 'bytes' },
    { internalType: 'bytes', name: 'signature', type: 'bytes' },
  ],
  internalType: 'struct UserOperation',
  name: 'userOp',
  type: 'tuple',
}

const userOpTypeSig = {
  components: [
    {
      type: 'address',
      name: 'sender',
    },
    {
      type: 'uint256',
      name: 'nonce',
    },
    {
      type: 'bytes',
      name: 'initCode',
    },
    {
      type: 'bytes',
      name: 'callData',
    },
    {
      type: 'uint256',
      name: 'callGasLimit',
    },
    {
      type: 'uint256',
      name: 'verificationGasLimit',
    },
    {
      type: 'uint256',
      name: 'preVerificationGas',
    },
    {
      type: 'uint256',
      name: 'maxFeePerGas',
    },
    {
      type: 'uint256',
      name: 'maxPriorityFeePerGas',
    },
    {
      type: 'bytes',
      name: 'paymasterAndData',
    },
    {
      type: 'bytes',
      name: 'signature',
    },
  ],
  name: 'userOp',
  type: 'tuple',
}

export async function getOpHash(
  chain: Chain,
  userOp: UserOperation,
  options?: EnvOption,
): Promise<Hex> {
  const entryPointAddress = await chain.getAddress('entryPointAddress', options)
  return await ENTRYPOINT_CONTRACT_INTERFACE.readFromChain(
    entryPointAddress,
    'getUserOpHash',
    [userOp],
    chain,
    options,
  )
}
