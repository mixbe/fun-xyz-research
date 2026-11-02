import { type Hex, padHex } from 'viem'

import APPROVE_AND_EXEC_CONTRACT from '../abis/ApproveAndExec.json' assert {
  type: 'json',
}
import APPROVE_AND_SWAP_CONTRACT from '../abis/ApproveAndSwap.json' assert {
  type: 'json',
}
import CHECKOUT_PAYMASTER_CONTRACT from '../abis/CheckoutPaymaster.json' assert {
  type: 'json',
}
import ERC20_CONTRACT from '../abis/ERC20.json' assert { type: 'json' }
import ERC_721_CONTRACT from '../abis/ERC721.json' assert { type: 'json' }
import ENTRYPOINT_CONTRACT from '../abis/EntryPoint.json' assert {
  type: 'json',
}
import ESTIMATION_PAYMASTER_CONTRACT from '../abis/EstimationPaymaster.json' assert {
  type: 'json',
}
import FEE_PERCENT_ORACLE_CONTRACT from '../abis/FeePercentOracle.json' assert {
  type: 'json',
}
import FUN_WALLET_CONTRACT from '../abis/FunWallet.json' assert { type: 'json' }
import FACTORY_CONTRACT from '../abis/FunWalletFactory.json' assert {
  type: 'json',
}
import GASLESS_PAYMASTER_CONTRACT from '../abis/GaslessPaymaster.json' assert {
  type: 'json',
}
import WITHDRAW_QUEUE_CONTRACT from '../abis/LidoWithdrawQueue.json' assert {
  type: 'json',
}
import ROLE_BASED_ACCESS_CONTROL_CONTRACT from '../abis/RoleBasedAccessControl.json' assert {
  type: 'json',
}
import TEST_NFT_CONTRACT from '../abis/TestNFT.json' assert { type: 'json' }
import TOKEN_PAYMASTER_CONTRACT from '../abis/TokenPaymaster.json' assert {
  type: 'json',
}
import TOKEN_PRICE_ORACLE_CONTRACT from '../abis/TokenPriceOracle.json' assert {
  type: 'json',
}
import USDT_CONTRACT from '../abis/USDT.json' assert { type: 'json' }
import USER_AUTHENTICATION_CONTRACT from '../abis/UserAuthentication.json' assert {
  type: 'json',
}
import { ContractInterface } from '../viem/ContractInterface'

export const BASE_WRAP_TOKEN_ADDR = {
  '1': {
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  '5': {
    weth: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  },
  '10': {
    weth: '0x4200000000000000000000000000000000000006',
  },
  '56': {
    wbnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  '137': {
    wmatic: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    wpol: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  },
  '5000': {
    weth: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
  },
  '8453': {
    weth: '0x4200000000000000000000000000000000000006',
  },
  '36865': {
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  '42161': {
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  '421614': {
    weth: '0x980b62da83eff3d4576c647993b0c1d7faf17c73',
  },
  '43113': {
    weth: '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3',
  },
  '534352': {
    weth: '0x5300000000000000000000000000000000000004',
  },
  '74747': {
    weth: '0xEE7D8BCFb72bC1880D0Cf19822eB0A2e6577aB62',
  },
} satisfies {
  [id: string]: { weth?: Hex; wmatic?: Hex; wpol?: Hex; wbnb?: Hex }
}

// When update this, also remember to update the address in api service
export const FUN_GASLESS_SPONSOR_ADDRESS =
  '0xCB5D0b4569A39C217c243a436AC3feEe5dFeb9Ad'
export const FUN_TOKEN_SPONSOR_ADDRESS =
  '0x40C0cCa76088D45106c2D74D0B4B6405865f22De'

export const TOKEN_SPONSOR_SUPPORT_CHAINS = [
  '1',
  '5',
  '10',
  '137',
  '8453',
  '42161',
  '421614',
  // No Mantle Support (5000)
  // No Scroll Support (534352)
]
export const GASLESS_SPONSOR_SUPPORT_CHAINS = ['5']
const CHECKOUT_PAYMASTER_ADDRESS_BY_CHAIN = {
  '1': '0xAEb04Eb8574CB29E2D7F94fC24fEAfb5469fDaBF',
  '5': '0x30809b742D0D51B8d5AEb630406cF299cb548E57',
  '137': '0xD649aC385EfE8CE69EcE9D2E61aE602e2893C586',
  '5000': '0x036E9F3e187A074405fA54eD2f58473AC465Bf4c',
  '8453': '0xA86096145c4ee02d08aEB434e3125d0D1b442495',
  '42161': '0x784DEeD2F7182E0e92438879bF1Cc3CD6542F8f7',
  '421614': '0x0B471a8fF3D038DED6d515741C447976d25E2976',
}
export const CHECKOUT_SPONSOR_SUPPORT_CHAINS = Object.keys(
  CHECKOUT_PAYMASTER_ADDRESS_BY_CHAIN,
)

export const AddressZero = padHex('0x', { size: 20 })
export const HashZero = padHex('0x', { size: 32 })

// abis
export const APPROVE_AND_EXEC_ABI = APPROVE_AND_EXEC_CONTRACT.abi
export const APPROVE_AND_SWAP_ABI = APPROVE_AND_SWAP_CONTRACT.abi
export const ENTRYPOINT_ABI = ENTRYPOINT_CONTRACT.abi
export const ERC20_ABI = ERC20_CONTRACT.abi
export const USDT_ABI = USDT_CONTRACT.abi
export const WALLET_ABI = FUN_WALLET_CONTRACT.abi
export const FACTORY_ABI = FACTORY_CONTRACT.abi
export const GASLESS_PAYMASTER_ABI = GASLESS_PAYMASTER_CONTRACT.abi
export const TOKEN_PAYMASTER_ABI = TOKEN_PAYMASTER_CONTRACT.abi
export const CHECKOUT_PAYMASTER_ABI = CHECKOUT_PAYMASTER_CONTRACT.abi
export const WITHDRAW_QUEUE_ABI = WITHDRAW_QUEUE_CONTRACT.abi
export const ERC_721_ABI = ERC_721_CONTRACT.abi
export const ROLE_BASED_ACCESS_CONTROL_ABI =
  ROLE_BASED_ACCESS_CONTROL_CONTRACT.abi
export const USER_AUTHENTICATION_ABI = USER_AUTHENTICATION_CONTRACT.abi
export const ESTIMATION_PAYMASTER_ABI = ESTIMATION_PAYMASTER_CONTRACT.abi

// contract interface
export const ENTRYPOINT_CONTRACT_INTERFACE = new ContractInterface(
  ENTRYPOINT_ABI,
)
export const ERC721_CONTRACT_INTERFACE = new ContractInterface(ERC_721_ABI)
export const ERC20_CONTRACT_INTERFACE = new ContractInterface(ERC20_ABI)
export const USDT_CONTRACT_INTERFACE = new ContractInterface(USDT_ABI)
export const FACTORY_CONTRACT_INTERFACE = new ContractInterface(FACTORY_ABI)
export const GASLESS_PAYMASTER_CONTRACT_INTERFACE = new ContractInterface(
  GASLESS_PAYMASTER_ABI,
)
export const TOKEN_PAYMASTER_CONTRACT_INTERFACE = new ContractInterface(
  TOKEN_PAYMASTER_ABI,
)
export const CHECKOUT_PAYMASTER_CONTRACT_INTERFACE = new ContractInterface(
  CHECKOUT_PAYMASTER_ABI,
)
export const WALLET_CONTRACT_INTERFACE = new ContractInterface(WALLET_ABI)
export const APPROVE_AND_EXEC_CONTRACT_INTERFACE = new ContractInterface(
  APPROVE_AND_EXEC_ABI,
)
export const RBAC_CONTRACT_INTERFACE = new ContractInterface(
  ROLE_BASED_ACCESS_CONTROL_ABI,
)
export const USER_AUTHENTICATION_CONTRACT_INTERFACE = new ContractInterface(
  USER_AUTHENTICATION_ABI,
)

export const CONTRACT_ADDRESSES = {
  approveAndExecAddress: APPROVE_AND_EXEC_CONTRACT.addresses,
  tokenSwapAddress: APPROVE_AND_SWAP_CONTRACT.addresses,
  entryPointAddress: ENTRYPOINT_CONTRACT.addresses,
  factoryAddress: FACTORY_CONTRACT.addresses,
  gaslessPaymasterAddress: GASLESS_PAYMASTER_CONTRACT.addresses,
  checkoutPaymasterAddress: CHECKOUT_PAYMASTER_ADDRESS_BY_CHAIN,
  estimationPaymasterAddress: ESTIMATION_PAYMASTER_CONTRACT.addresses,
  tokenPaymasterAddress: TOKEN_PAYMASTER_CONTRACT.addresses,
  oracle: TOKEN_PRICE_ORACLE_CONTRACT.addresses,
  userAuthAddress: USER_AUTHENTICATION_CONTRACT.addresses,
  rbacAddress: ROLE_BASED_ACCESS_CONTROL_CONTRACT.addresses,
  feeOracle: FEE_PERCENT_ORACLE_CONTRACT.addresses,
  TestNFT: TEST_NFT_CONTRACT.addresses,
  funGaslessSponsorAddress: { '5': FUN_GASLESS_SPONSOR_ADDRESS },
  funTokenSponsorAddress: {
    '1': FUN_TOKEN_SPONSOR_ADDRESS,
    '5': FUN_TOKEN_SPONSOR_ADDRESS,
    '10': FUN_TOKEN_SPONSOR_ADDRESS,
    '137': FUN_TOKEN_SPONSOR_ADDRESS,
    '8453': FUN_TOKEN_SPONSOR_ADDRESS,
    '42161': FUN_TOKEN_SPONSOR_ADDRESS,
    '421614': FUN_TOKEN_SPONSOR_ADDRESS,
    // No Mantle Support (5000)
    // No Scroll Support (534352)
  },
}

export const gasSpecificChain = {
  '137': {
    gasStationUrl: 'https://gasstation.polygon.technology/v2',
    backupPriorityFee: '1000', // 1000 gwei
    backupFee: '200', // 200 gwei
  },
}

export const FUN_FAUCET_URL = 'https://api.fun.xyz/demo-faucet'

export const ETH_TRANSFER_SELECTOR = '0x00000000'

export const VALID_PRIVATE_KEY_LENGTH = 64
export const BYTES32_LENGTH = 66
// Use the paymasterAndData from pimlico for gas estimation
export const BASE_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION =
  '0xa880eae8900eb59bf7dad9bdb741a086238adca900000000000000000000000000000000000000000000000000000101010101010000000000000000000000000000000000000000000000000000000000000000cd91f19f0f19ce862d7bec7b7d9b95457145afc6f639c28fd0360f488937bfa41e6eedcd3a46054fd95fcd0e3ef6b0bc0a615c4d975eef55c8a3517257904d5b1c'
export const OPTIMISM_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION =
  '0x4Df91e173A6CdC74EfeF6fC72bb5Df1E8A8d758200000000000000000000000000000000000000000000000000000101010101010000000000000000000000000000000000000000000000000000000000000000cd91f19f0f19ce862d7bec7b7d9b95457145afc6f639c28fd0360f488937bfa41e6eedcd3a46054fd95fcd0e3ef6b0bc0a615c4d975eef55c8a3517257904d5b1c'
export const ETHEREUM_PIMLICO_PAYMASTER_AND_DATA_ESTIMATION =
  '0x67F21bE69A16c314a0b7Da537309b2f3ADdDE03100000000000000000000000000000000000000000000000000000101010101010000000000000000000000000000000000000000000000000000000000000000cd91f19f0f19ce862d7bec7b7d9b95457145afc6f639c28fd0360f488937bfa41e6eedcd3a46054fd95fcd0e3ef6b0bc0a615c4d975eef55c8a3517257904d5b1c'

/**
 * List of stablecoin symbols
 * There are a lot more stablecoins but these are good to start
 */
export const STABLECOIN_SYMBOLS = ['USDC', 'USDC.e', 'USDT', 'DAI', 'USDe']

export const DEFAULT_USEROP_GAS_LIMIT = 15e5
