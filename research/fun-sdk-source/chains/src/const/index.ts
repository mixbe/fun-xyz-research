import {
  type Chain,
  abstract,
  arbitrum,
  arbitrumSepolia,
  base,
  bsc,
  goerli,
  ink,
  mainnet,
  mantle,
  optimism,
  polygon,
  scroll,
  zksync,
} from 'viem/chains'
import {
  BITCOIN_MAINNET_CHAIN_ID,
  ETHEREAL_CHAIN_ID,
  HYPERCORE_CHAIN_ID,
  HYPER_EVM_CHAIN_ID,
  LIGHTER_API_BASE_URL_BY_CHAIN_ID,
  LIGHTER_CHAIN_ID,
  LIGHTER_RH_CHAIN_ID,
  LIGHTNING_MAINNET_CHAIN_ID,
  MONAD_CHAIN_ID,
  NON_EVM_CHAIN_IDS,
  ROBINHOOD_MAINNET_CHAIN_ID,
  SOLANA_MAINNET_CHAIN_ID,
  TRON_MAINNET_CHAIN_ID,
} from './chainId'
export * from './chainId'

export const hyperEvmChain = {
  id: HYPER_EVM_CHAIN_ID as typeof HYPER_EVM_CHAIN_ID,
  name: 'HyperEVM',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.hyperliquid.xyz/evm',
        'https://rpc.hypurrscan.io',
        'https://hyperliquid-json-rpc.stakely.io',
        'https://hyperliquid.drpc.org',
        'https://rpc.hyperlend.finance',
      ],
      wss: ['wss://hyperliquid.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVMScan',
      url: 'https://hyperevmscan.io',
      apiUrl: '',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x' as `0x${string}`,
    },
    ensUniversalResolver: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: -1,
    },
  },
}

export const etherealChain = {
  id: ETHEREAL_CHAIN_ID as typeof ETHEREAL_CHAIN_ID,
  name: 'Ethereal',
  nativeCurrency: {
    name: 'USDe',
    symbol: 'USDe',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ethereal.trade'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ethereal Explorer',
      url: 'https://explorer.ethereal.trade',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x' as `0x${string}`,
    },
    ensUniversalResolver: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: 36197,
    },
  },
}

// Define lighter chain in pseudo-evm / wagmi compliant format
export const lighterChain = {
  id: LIGHTER_CHAIN_ID as typeof LIGHTER_CHAIN_ID,
  name: 'Lighter',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [LIGHTER_API_BASE_URL_BY_CHAIN_ID[LIGHTER_CHAIN_ID]],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lighter Explorer',
      url: 'https://app.lighter.xyz/explorer',
      path: {
        tx: 'logs',
        address: 'accounts',
        block: 'blocks',
        transfer: '',
      },
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x' as `0x${string}`,
    },
    ensUniversalResolver: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
    multicall3: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
  },
}

export const lighterRhChain = {
  ...lighterChain,
  id: LIGHTER_RH_CHAIN_ID as typeof LIGHTER_RH_CHAIN_ID,
  name: 'Robinhood Lighter',
  nativeCurrency: {
    name: 'USDG',
    symbol: 'USDG',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [LIGHTER_API_BASE_URL_BY_CHAIN_ID[LIGHTER_RH_CHAIN_ID]],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lighter Explorer (Robinhood)',
      url: 'https://robinhoodchain.lighter.xyz/explorer',
      path: {
        tx: 'logs',
        address: 'accounts',
        block: 'blocks',
        transfer: '',
      },
    },
  },
}

export const monadChain = {
  id: MONAD_CHAIN_ID as typeof MONAD_CHAIN_ID,
  name: 'Monad',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.monad.xyz',
        'https://rpc1.monad.xyz',
        'https://rpc2.monad.xyz',
        'https://rpc3.monad.xyz',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://monadscan.com',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x' as `0x${string}`,
    },
    ensUniversalResolver: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: -1,
    },
  },
}

// Define solana mainnet chain in pseudo-evm / wagmi compliant format
export const solanaChain = {
  id: SOLANA_MAINNET_CHAIN_ID as typeof SOLANA_MAINNET_CHAIN_ID,
  name: 'Solana',
  nativeCurrency: {
    symbol: 'SOL',
    decimals: 9,
    name: 'Solana',
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet-beta.solana.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Orb',
      url: 'https://orbmarkets.io',
      apiUrl: '',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x' as `0x${string}`,
    },
    ensUniversalResolver: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
    multicall3: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
  },
}

// Define hypercore chain in pseudo-evm / wagmi compliant format
export const hyperCoreChain = {
  id: HYPERCORE_CHAIN_ID as typeof HYPERCORE_CHAIN_ID,
  name: 'Hyperliquid',
  nativeCurrency: {
    symbol: 'USDC', // USDC Spot is the native asset of HyperCore, not HYPE
    decimals: 8, // USDC Spot has 8 decimals on HyperCore, not 6!
    name: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HypurrScan',
      url: 'https://hypurrscan.io',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x' as `0x${string}`,
    },
    ensUniversalResolver: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
    multicall3: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
  },
}

export const bitcoinChain = {
  id: Number(BITCOIN_MAINNET_CHAIN_ID),
  name: 'Bitcoin',
  nativeCurrency: {
    symbol: 'BTC',
    decimals: 8,
    name: 'Bitcoin',
  },
  rpcUrls: {
    default: {
      http: ['https://blockstream.info/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mempool',
      url: 'https://mempool.space',
    },
  },
  contracts: {},
}

export const lightningChain = {
  id: Number(LIGHTNING_MAINNET_CHAIN_ID),
  name: 'Lightning',
  nativeCurrency: {
    symbol: 'BTC',
    decimals: 8,
    name: 'Bitcoin',
  },
  /**
   * No public JSON-RPC exists for Lightning. The URL is a
   * placeholder to satisfy viem's non-empty rpcUrls.default.http requirement
   * (same convention as bitcoinChain). Lightning is filtered out of wagmi
   * via isCheckoutSupported:false (see chainMetadata below), so this URL is
   * never actually called internally. In the rare case an external SDK
   * consumer imports this chain and passes it to wagmi directly, the
   * placeholder defers (not prevents) failure — they get a clearer
   * HttpRequestError at the first JSON-RPC call instead of UrlRequiredError
   * at config-build time.
   */
  rpcUrls: {
    default: {
      http: ['https://api.sparkscan.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sparkscan',
      url: 'https://sparkscan.io',
    },
  },
  contracts: {},
}

export const tronChain = {
  id: Number(TRON_MAINNET_CHAIN_ID),
  name: 'Tron',
  nativeCurrency: {
    symbol: 'TRX',
    decimals: 6,
    name: 'Tron',
  },
  rpcUrls: {
    default: {
      http: ['https://api.trongrid.io/jsonrpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'TronScan',
      url: 'https://tronscan.org',
      path: {
        tx: 'transaction',
        transfer: '/transfers',
      },
    },
  },
  contracts: {},
}

// https://docs.robinhood.com/chain/connecting
export const robinhoodChain = {
  id: ROBINHOOD_MAINNET_CHAIN_ID as typeof ROBINHOOD_MAINNET_CHAIN_ID,
  name: 'Robinhood Chain',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
      webSocket: ['wss://feed.mainnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Chain Explorer',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
  // TODO: get deployment address and block created once chain details are public
  contracts: {
    ensRegistry: {
      address: '0x' as `0x${string}`,
    },
    ensUniversalResolver: {
      address: '0x' as `0x${string}`,
      blockCreated: -1,
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: -1,
    },
  },
}

// list all supported chains id here for type safety
export const FUNKIT_CONNECT_SUPPORTED_CHAINS_ID_LIST = [
  /** MAINNETS **/
  mainnet.id,
  base.id,
  polygon.id,
  arbitrum.id,
  optimism.id,
  bsc.id,
  zksync.id,
  mantle.id,
  solanaChain.id,
  scroll.id,
  hyperEvmChain.id,
  hyperCoreChain.id,
  abstract.id,
  bitcoinChain.id,
  etherealChain.id,
  monadChain.id,
  lighterChain.id,
  lighterRhChain.id,
  tronChain.id,
  robinhoodChain.id,
  ink.id,
  /** TESTNETS **/
  goerli.id,
  arbitrumSepolia.id,
] as const

type FunKitConnectSupportedChainId =
  (typeof FUNKIT_CONNECT_SUPPORTED_CHAINS_ID_LIST)[number]

interface FunTokenInfo {
  symbol: string
  decimals: number
  name: string
}

export type ExplorerInfoUrlPath = {
  path?: {
    tx?: string
    address?: string
    block?: string
    transfer?: string
  }
}

export interface FunChainInfo {
  name: string
  nativeCurrency: FunTokenInfo
  coreToken?: FunTokenInfo
  chainInfo: Chain
  explorerInfo: NonNullable<NonNullable<Chain['blockExplorers']>['default']> &
    ExplorerInfoUrlPath
  isCheckoutSupported: boolean // Whether we support this on source for sdk wallet flows
  isMainnet: boolean
  pickPriority: number
  fallbackRpcUrls: string[]
}

/** this type is used to mock `noUncheckedIndexedAccess` */
type SupportedChainInfos = {
  [key in FunKitConnectSupportedChainId]: FunChainInfo
} & {
  [k: string]: FunChainInfo | undefined
}

/**
 * Info on the supported chains of FunkitConnect
 * Added into coresdk because it is used in here too.
 *
 * fallbackRpcUrl: see https://chainlist.org/ for more public RPC endpoints
 */
export const FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO: SupportedChainInfos = {
  /** MAINNETS **/
  [mainnet.id]: {
    name: mainnet.name,
    nativeCurrency: {
      symbol: mainnet.nativeCurrency.symbol,
      decimals: mainnet.nativeCurrency.decimals,
      name: mainnet.nativeCurrency.name,
    },
    chainInfo: mainnet,
    explorerInfo: mainnet.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: 4,
    fallbackRpcUrls: [
      'https://eth.llamarpc.com',
      'https://eth.drpc.org',
      'https://1rpc.io/eth',
      'https://mainnet.gateway.tenderly.co',
      'https://ethereum-rpc.publicnode.com',
      'https://eth.merkle.io',
    ],
  },
  [base.id]: {
    name: base.name,
    nativeCurrency: {
      symbol: base.nativeCurrency.symbol,
      decimals: base.nativeCurrency.decimals,
      name: base.nativeCurrency.name,
    },
    chainInfo: base,
    explorerInfo: base.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: 2,
    fallbackRpcUrls: [
      'https://base.llamarpc.com',
      'https://1rpc.io/base',
      'https://base.gateway.tenderly.co',
      'https://base-rpc.publicnode.com',
      'https://base.meowrpc.com',
    ],
  },
  [polygon.id]: {
    name: polygon.name,
    nativeCurrency: {
      symbol: polygon.nativeCurrency.symbol,
      decimals: polygon.nativeCurrency.decimals,
      name: polygon.nativeCurrency.name,
    },
    coreToken: {
      symbol: 'MATIC',
      decimals: 18,
      name: 'MATIC',
    },
    chainInfo: polygon,
    explorerInfo: polygon.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: 1,
    fallbackRpcUrls: [
      'https://polygon.drpc.org',
      'https://1rpc.io/matic',
      'https://polygon.gateway.tenderly.co',
      'https://polygon-bor-rpc.publicnode.com',
      'https://api.zan.top/polygon-mainnet',
    ],
  },
  [arbitrum.id]: {
    name: 'Arbitrum', // arbitrum.name returns 'Arbitrum One' which is too wordy for us.
    nativeCurrency: {
      symbol: arbitrum.nativeCurrency.symbol,
      decimals: arbitrum.nativeCurrency.decimals,
      name: arbitrum.nativeCurrency.name,
    },
    coreToken: {
      symbol: 'ARB',
      decimals: 18,
      name: 'Arbitrium',
    },
    chainInfo: arbitrum,
    explorerInfo: arbitrum.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: 3,
    fallbackRpcUrls: [
      'https://arbitrum.drpc.org',
      'https://arbitrum.gateway.tenderly.co',
      'https://1rpc.io/arb',
      'https://arbitrum-one-rpc.publicnode.com',
      'https://arbitrum.meowrpc.com',
    ],
  },
  [optimism.id]: {
    name: optimism.name,
    nativeCurrency: {
      symbol: optimism.nativeCurrency.symbol,
      decimals: optimism.nativeCurrency.decimals,
      name: optimism.nativeCurrency.name,
    },
    coreToken: {
      symbol: 'OP',
      decimals: 18,
      name: 'Optimism',
    },
    chainInfo: optimism,
    explorerInfo: optimism.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [
      'https://0xrpc.io/op',
      'https://optimism.drpc.org',
      'https://optimism.gateway.tenderly.co',
      'https://1rpc.io/op',
      'https://optimism-rpc.publicnode.com',
    ],
  },
  [bsc.id]: {
    name: bsc.name,
    nativeCurrency: {
      symbol: bsc.nativeCurrency.symbol,
      decimals: bsc.nativeCurrency.decimals,
      name: bsc.nativeCurrency.name,
    },
    chainInfo: bsc,
    explorerInfo: bsc.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [
      'https://binance.llamarpc.com',
      'https://1rpc.io/bnb',
      'https://bsc.drpc.org',
      'https://bsc-rpc.publicnode.com',
      'https://bsc.blockrazor.xyz',
      'https://bsc.meowrpc.com',
    ],
  },
  [zksync.id]: {
    name: 'zkSync',
    nativeCurrency: {
      symbol: zksync.nativeCurrency.symbol,
      decimals: zksync.nativeCurrency.decimals,
      name: zksync.nativeCurrency.name,
    },
    coreToken: {
      symbol: 'ZK',
      decimals: 18,
      name: 'zkSync',
    },
    chainInfo: zksync,
    explorerInfo: zksync.blockExplorers.default,
    isCheckoutSupported: false,
    isMainnet: true,
    pickPriority: 5,
    fallbackRpcUrls: [
      'https://1rpc.io/zksync2-era',
      'https://zksync.meowrpc.com',
    ],
  },
  [mantle.id]: {
    name: mantle.name,
    nativeCurrency: {
      symbol: mantle.nativeCurrency.symbol,
      decimals: mantle.nativeCurrency.decimals,
      name: mantle.nativeCurrency.name,
    },
    coreToken: {
      symbol: 'MNT',
      decimals: 18,
      name: 'Mantle',
    },
    chainInfo: mantle,
    explorerInfo: mantle.blockExplorers.default,
    isCheckoutSupported: false,
    isMainnet: true,
    pickPriority: 6,
    fallbackRpcUrls: [
      'https://mantle.drpc.org',
      'https://mantle-rpc.publicnode.com',
    ],
  },
  [solanaChain.id]: {
    name: solanaChain.name,
    nativeCurrency: {
      symbol: solanaChain.nativeCurrency.symbol,
      decimals: solanaChain.nativeCurrency.decimals,
      name: solanaChain.nativeCurrency.name,
    },
    chainInfo: solanaChain,
    explorerInfo: solanaChain.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [scroll.id]: {
    name: scroll.name,
    nativeCurrency: {
      symbol: scroll.nativeCurrency.symbol,
      decimals: scroll.nativeCurrency.decimals,
      name: scroll.nativeCurrency.name,
    },
    chainInfo: scroll,
    explorerInfo: scroll.blockExplorers.default,
    isCheckoutSupported: false,
    isMainnet: true,
    pickPriority: 7,
    fallbackRpcUrls: [
      'https://scroll-rpc.publicnode.com',
      'https://scroll-mainnet.public.blastapi.io',
    ],
  },
  [abstract.id]: {
    name: abstract.name,
    nativeCurrency: {
      symbol: abstract.nativeCurrency.symbol,
      decimals: abstract.nativeCurrency.decimals,
      name: abstract.nativeCurrency.name,
    },
    chainInfo: abstract,
    explorerInfo: abstract.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [hyperEvmChain.id]: {
    name: hyperEvmChain.name,
    nativeCurrency: {
      symbol: hyperEvmChain.nativeCurrency.symbol,
      decimals: hyperEvmChain.nativeCurrency.decimals,
      name: hyperEvmChain.nativeCurrency.name,
    },
    chainInfo: hyperEvmChain,
    explorerInfo: hyperEvmChain.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [
      'https://hyperliquid.drpc.org',
      'https://rpc.hypurrscan.io',
      'https://hyperliquid-json-rpc.stakely.io',
      'https://hyperliquid.rpc.blxrbdn.com',
    ],
  },
  [etherealChain.id]: {
    name: etherealChain.name,
    nativeCurrency: {
      symbol: etherealChain.nativeCurrency.symbol,
      decimals: etherealChain.nativeCurrency.decimals,
      name: etherealChain.nativeCurrency.name,
    },
    chainInfo: etherealChain,
    explorerInfo: etherealChain.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [monadChain.id]: {
    name: monadChain.name,
    nativeCurrency: {
      symbol: monadChain.nativeCurrency.symbol,
      decimals: monadChain.nativeCurrency.decimals,
      name: monadChain.nativeCurrency.name,
    },
    chainInfo: monadChain,
    explorerInfo: monadChain.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [hyperCoreChain.id]: {
    name: hyperCoreChain.name,
    nativeCurrency: {
      symbol: hyperCoreChain.nativeCurrency.symbol,
      decimals: hyperCoreChain.nativeCurrency.decimals,
      name: hyperCoreChain.nativeCurrency.name,
    },
    chainInfo: hyperCoreChain,
    explorerInfo: hyperCoreChain.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: ['https://rpc.hypurrscan.io'],
  },
  [lighterChain.id]: {
    name: lighterChain.name,
    nativeCurrency: {
      symbol: lighterChain.nativeCurrency.symbol,
      decimals: lighterChain.nativeCurrency.decimals,
      name: lighterChain.nativeCurrency.name,
    },
    chainInfo: lighterChain,
    explorerInfo: lighterChain.blockExplorers.default,
    // Lighter payment not enabled for regular checkout
    isCheckoutSupported: false,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [lighterRhChain.id]: {
    name: lighterRhChain.name,
    nativeCurrency: {
      symbol: lighterRhChain.nativeCurrency.symbol,
      decimals: lighterRhChain.nativeCurrency.decimals,
      name: lighterRhChain.nativeCurrency.name,
    },
    chainInfo: lighterRhChain,
    explorerInfo: lighterRhChain.blockExplorers.default,
    isCheckoutSupported: false,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [bitcoinChain.id]: {
    name: bitcoinChain.name,
    nativeCurrency: {
      symbol: bitcoinChain.nativeCurrency.symbol,
      decimals: bitcoinChain.nativeCurrency.decimals,
      name: bitcoinChain.nativeCurrency.name,
    },
    chainInfo: bitcoinChain,
    explorerInfo: bitcoinChain.blockExplorers.default,
    // Bitcoin payment not enabled for regular wallet checkout
    isCheckoutSupported: false,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [lightningChain.id]: {
    name: lightningChain.name,
    nativeCurrency: {
      symbol: lightningChain.nativeCurrency.symbol,
      decimals: lightningChain.nativeCurrency.decimals,
      name: lightningChain.nativeCurrency.name,
    },
    chainInfo: lightningChain,
    explorerInfo: lightningChain.blockExplorers.default,
    // Lightning payment not enabled for regular wallet checkout
    isCheckoutSupported: false,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [tronChain.id]: {
    name: tronChain.name,
    nativeCurrency: {
      symbol: tronChain.nativeCurrency.symbol,
      decimals: tronChain.nativeCurrency.decimals,
      name: tronChain.nativeCurrency.name,
    },
    chainInfo: tronChain,
    explorerInfo: tronChain.blockExplorers.default,
    // Tron payment not enabled for regular wallet checkout
    isCheckoutSupported: false,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  /** TESTNETS **/
  [goerli.id]: {
    name: goerli.name,
    nativeCurrency: {
      symbol: goerli.nativeCurrency.symbol,
      decimals: goerli.nativeCurrency.decimals,
      name: goerli.nativeCurrency.name,
    },
    chainInfo: goerli,
    explorerInfo: goerli.blockExplorers.default,
    isCheckoutSupported: true,
    // testnet has no fiat checkouts supported
    isMainnet: false,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [arbitrumSepolia.id]: {
    name: arbitrumSepolia.name,
    nativeCurrency: {
      symbol: arbitrumSepolia.nativeCurrency.symbol,
      decimals: arbitrumSepolia.nativeCurrency.decimals,
      name: arbitrumSepolia.nativeCurrency.name,
    },
    chainInfo: arbitrumSepolia,
    explorerInfo: {
      name: 'Arbiscan',
      url: 'https://sepolia.arbiscan.io',
    },
    isCheckoutSupported: true,
    // testnet has no fiat checkouts supported
    isMainnet: false,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [robinhoodChain.id]: {
    name: robinhoodChain.name,
    nativeCurrency: {
      symbol: robinhoodChain.nativeCurrency.symbol,
      decimals: robinhoodChain.nativeCurrency.decimals,
      name: robinhoodChain.nativeCurrency.name,
    },
    chainInfo: robinhoodChain,
    explorerInfo: robinhoodChain.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: [],
  },
  [ink.id]: {
    name: ink.name,
    nativeCurrency: {
      symbol: ink.nativeCurrency.symbol,
      decimals: ink.nativeCurrency.decimals,
      name: ink.nativeCurrency.name,
    },
    chainInfo: ink,
    explorerInfo: ink.blockExplorers.default,
    isCheckoutSupported: true,
    isMainnet: true,
    pickPriority: Number.MAX_SAFE_INTEGER,
    fallbackRpcUrls: ['https://ink.drpc.org', 'https://rpc-qnd.inkonchain.com'],
  },
} as const

export const FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO_LIST = Object.values(
  FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO,
).flatMap((item) => {
  if (!item) {
    return []
  }
  return [item.chainInfo]
}) as unknown as [Chain, ...Chain[]]

// checkout supported + mainnet
export const FUNKIT_CONNECT_SUPPORTED_CHECKOUT_CHAINS_INFO_LIST =
  FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO_LIST.filter(
    (chainInfo): chainInfo is Chain => {
      const chainId = chainInfo.id
      return !!(
        chainId &&
        FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[chainId]?.isCheckoutSupported &&
        FUNKIT_CONNECT_SUPPORTED_CHAINS_INFO[chainId]?.isMainnet
      )
    },
  ) as unknown as [Chain, ...Chain[]]

// The subset safe to hand to EVM-only tooling — wagmi's `chains`/transports,
// `eth_getTransactionReceipt`, and anything else that assumes a JSON-RPC chain.
export const FUNKIT_CONNECT_SUPPORTED_CHECKOUT_EVM_CHAINS_INFO_LIST =
  FUNKIT_CONNECT_SUPPORTED_CHECKOUT_CHAINS_INFO_LIST.filter(
    (chainInfo): chainInfo is Chain => !NON_EVM_CHAIN_IDS.has(chainInfo.id),
  ) as unknown as [Chain, ...Chain[]]

// The native currency pseudo-address used for checkout operations in funkitconnect — the 0xeeee… sentinel
// the backend quote APIs expect for native tokens. (Originally a Socket bridge requirement — see
// https://fun-xyz.slack.com/archives/C04Q5T1MQP3/p1701901749677069?thread_ts=1701829172.857709&cid=C04Q5T1MQP3 —
// Socket has since been removed from the backend, but the sentinel convention stays.)
export const FUNKIT_CONNECT_CHECKOUT_NATIVE_CURRENCY_ADDRESS =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export * from './chainMetadata'
