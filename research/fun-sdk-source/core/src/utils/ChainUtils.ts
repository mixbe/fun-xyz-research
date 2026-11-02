import { getAssetFromFaucet, sendGetRequest } from '@funkit/api-base'
import {
  type Address,
  type Hex,
  type PublicClient,
  concat,
  decodeAbiParameters,
  encodeAbiParameters,
  isAddress as isAddressViem,
  keccak256,
  pad,
  parseEther,
  toBytes,
  toHex,
} from 'viem'

import { ErrorCode, InvalidParameterError } from '@funkit/utils'
import type { Auth } from '../auth'
import {
  type TransactionParams,
  WALLET_CONTRACT_INTERFACE,
  gasSpecificChain,
} from '../common'
import type { EnvOption } from '../config'
import { Chain } from '../data'
import type { FunWallet } from '../wallet'

export const isAddress = (address: string): boolean => {
  try {
    const [decodedAddr] = decodeAbiParameters(
      [{ type: 'address' }],
      pad(address as Hex, { size: 32 }),
    )
    return isAddressViem(decodedAddr as string)
  } catch (_err) {
    return false
  }
}

export const fundWallet = async (
  auth: Auth,
  wallet: Auth | FunWallet,
  value: number,
  txOptions: EnvOption = globalThis.globalEnvOption,
) => {
  const chain = await Chain.getChain(
    { chainIdentifier: txOptions.chain },
    txOptions,
  )
  const chainId = await chain.getChainId(txOptions)
  const to = await wallet.getAddress()

  let txData: TransactionParams & {
    maxFeePerGas?: bigint
    maxPriorityFeePerGas?: bigint
  }

  if (gasSpecificChain[chainId]) {
    const { backupFee, backupPriorityFee, gasStationUrl } =
      gasSpecificChain[chainId]

    let maxPriorityFee: number
    let maxFee: number
    try {
      const { standard } = await getGasStation(gasStationUrl, txOptions)
      maxPriorityFee = standard.maxPriorityFee
      maxFee = standard.maxFee
    } catch (_err) {
      maxPriorityFee = Number(backupPriorityFee)
      maxFee = Number(backupFee)
    }

    txData = {
      to,
      data: '0x',
      value: parseEther(`${value}`),
      maxFeePerGas: BigInt(Math.floor(maxPriorityFee * 1e9)),
      maxPriorityFeePerGas: BigInt(Math.floor(maxFee * 1e9)),
    }
  } else {
    txData = { to, data: '0x', value: parseEther(`${value}`) }
  }
  const receipt = await auth.sendTx({ ...txData })
  return receipt
}

export const isContract = async (
  address: Address,
  client: PublicClient,
): Promise<boolean> => {
  try {
    const code = await client.getBytecode({ address })
    return !!code
  } catch (_err) {
    return false
  }
}

export const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256)
  }

  return toHex(bytes)
}

export const getWalletPermitNonce = async (
  walletAddr: Address,
  chain: Chain,
  nonceKey = 0,
  options?: EnvOption,
): Promise<bigint> => {
  try {
    return await WALLET_CONTRACT_INTERFACE.readFromChain(
      walletAddr,
      'getNonce',
      [nonceKey],
      chain,
      options,
    )
  } catch (_err) {
    return 0n
  }
}

export const getPermitHash = (
  token: Address,
  to: Address,
  amount: bigint,
  nonce: bigint,
  walletAddr: Address,
  chainId: bigint,
) => {
  const salt = keccak256(toBytes('Create3Deployer.deployers()'))
  const EIP712_DOMAIN = keccak256(
    encodeAbiParameters(
      [{ type: 'string' }],
      [
        'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)',
      ],
    ),
  )
  const PERMIT_TYPEHASH =
    'PermitTransferStruct(address token, address to, uint256 amount, uint256 nonce)'
  const DOMAIN_SEPARATOR = keccak256(
    encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'address' },
        { type: 'bytes32' },
      ],
      [EIP712_DOMAIN, salt, keccak256(toBytes('1')), chainId, walletAddr, salt],
    ),
  )
  const PERMIT_HASH = keccak256(
    encodeAbiParameters(
      [
        { type: 'string' },
        { type: 'address' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'uint256' },
      ],
      [PERMIT_TYPEHASH, token, to, amount, nonce],
    ),
  )
  return keccak256(concat([DOMAIN_SEPARATOR, PERMIT_HASH]))
}

export const getGasStation = async (
  gasStationUrl: string,
  options?: EnvOption,
): Promise<{ standard: { maxPriorityFee: number; maxFee: number } }> => {
  return await sendGetRequest({
    uri: gasStationUrl,
    apiKey: globalThis.globalEnvOption.apiKey,
    signal: options?.signal,
  })
}

export const useFaucet = async (
  chainIdentifier: Chain | number | string,
  wallet: FunWallet,
  txOptions?: EnvOption,
) => {
  const chain = await Chain.getChain({ chainIdentifier }, txOptions)
  const chainName = await chain.getChainName(txOptions)
  if (chainName !== 'goerli') {
    throw new InvalidParameterError(
      ErrorCode.InvalidChainIdentifier,
      'Only Goerli is supported',
      'Only Goerli is supported',
      chainIdentifier,
      'Provide the goerli chain, 5, or goerli as the chain identifier',
      'https://docs.fun.xyz/',
    )
  }
  const walletAddress = await wallet.getAddress()
  const [ethRequest, usdcRequest, usdtRequest, daiRequest] = await Promise.all([
    getAssetFromFaucet({
      token: 'eth',
      chain: chainName,
      walletAddress,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: txOptions?.logger,
      signal: txOptions?.signal,
    }),
    getAssetFromFaucet({
      token: 'usdc',
      chain: chainName,
      walletAddress,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: txOptions?.logger,
      signal: txOptions?.signal,
    }),
    getAssetFromFaucet({
      token: 'usdt',
      chain: chainName,
      walletAddress,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: txOptions?.logger,
      signal: txOptions?.signal,
    }),
    getAssetFromFaucet({
      token: 'dai',
      chain: chainName,
      walletAddress,
      apiKey: globalThis.globalEnvOption.apiKey,
      logger: txOptions?.logger,
      signal: txOptions?.signal,
    }),
  ])
  return [ethRequest, usdcRequest, usdtRequest, daiRequest]
}
