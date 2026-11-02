import {
  BITCOIN_MAINNET_CHAIN_ID,
  ETHEREAL_CHAIN_ID,
  HYPERCORE_CHAIN_ID,
  HYPER_EVM_CHAIN_ID,
  LIGHTER_CHAIN_ID,
  LIGHTER_RH_CHAIN_ID,
  LIGHTNING_MAINNET_CHAIN_ID,
  MONAD_CHAIN_ID,
  ROBINHOOD_MAINNET_CHAIN_ID,
  SOLANA_MAINNET_CHAIN_ID,
  TRON_MAINNET_CHAIN_ID,
} from './chainId'

// Helper function to filter out null/undefined values
function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null
}

// Sourced from https://github.com/tmm/wagmi/blob/main/packages/core/src/constants/chains.ts
// This is just so we can clearly see which of wagmi's first-class chains we provide metadata for
type ChainName =
  | 'abstract'
  | 'arbitrum'
  | 'arbitrumGoerli'
  | 'arbitrumSepolia'
  | 'avalanche'
  | 'avalancheFuji'
  | 'cronos'
  | 'cronosTestnet'
  | 'base'
  | 'baseGoerli'
  | 'baseSepolia'
  | 'bitcoin'
  | 'blast'
  | 'blastSepolia'
  | 'bsc'
  | 'bscTestnet'
  | 'ethereal'
  | 'goerli'
  | 'hardhat'
  | 'hyperCore'
  | 'hyperEvm'
  | 'holesky'
  | 'ink'
  | 'klaytn'
  | 'klaytnBaobab'
  | 'kovan'
  | 'lighter'
  | 'lighterRh'
  | 'lightning'
  | 'mainnet'
  | 'manta'
  | 'mantaSepolia'
  | 'mantaTestnet'
  | 'mantle'
  | 'mantleTestnet'
  | 'monad'
  | 'optimism'
  | 'optimismKovan'
  | 'optimismGoerli'
  | 'optimismSepolia'
  | 'polygon'
  | 'polygonMumbai'
  | 'rinkeby'
  | 'robinhood'
  | 'ropsten'
  | 'ronin'
  | 'sepolia'
  | 'scroll'
  | 'solanaMainnet'
  | 'tron'
  | 'xdc'
  | 'xdcTestnet'
  | 'zetachain'
  | 'zetachainAthensTestnet'
  | 'zkSync'
  | 'zkSyncTestnet'
  | 'zora'
  | 'zoraSepolia'

type IconMetadata = {
  iconUrl: string
  iconBackground: string
}

type ChainMetadata = {
  chainId: number
  name?: string
} & IconMetadata

const abstractIcon: IconMetadata = {
  iconBackground: '#96bedc',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/abstract.svg',
}

const arbitrumIcon: IconMetadata = {
  iconBackground: '#96bedc',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/arbitrum.svg',
}

const avalancheIcon: IconMetadata = {
  iconBackground: '#e84141',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/avalanche.svg',
}

const baseIcon: IconMetadata = {
  iconBackground: '#0052ff',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/base.svg',
}

const bitcoinIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/bitcoin.svg',
}

const lightningIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/lightning.svg',
}

const blastIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/blast.svg',
}

const bscIcon: IconMetadata = {
  iconBackground: '#ebac0e',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/bsc.svg',
}

const cronosIcon: IconMetadata = {
  iconBackground: '#002D74',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/cronos.svg',
}

const solanaIcon: IconMetadata = {
  iconBackground: '#2C2C3D',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/solana.svg',
}

const ethereumIcon: IconMetadata = {
  iconBackground: '#484c50',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/ethereum.svg',
}

const etherealIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/ethereal.svg',
}

const hardhatIcon: IconMetadata = {
  iconBackground: '#f9f7ec',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/hardhat.svg',
}

const klaytnIcon: IconMetadata = {
  iconBackground: 'transparent',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/klaytn.svg',
}

const optimismIcon: IconMetadata = {
  iconBackground: '#ff5a57',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/optimism.svg',
}

const mantaIcon: IconMetadata = {
  iconBackground: '#ffffff',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/manta.svg',
}

const mantleIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/mantle.svg',
}

const monadIcon: IconMetadata = {
  iconBackground: '#ffffff',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/monad.svg',
}

const polygonIcon: IconMetadata = {
  iconBackground: '#9f71ec',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/polygon.svg',
}

const scrollIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/scroll.svg',
}

const xdcIcon: IconMetadata = {
  iconBackground: '#f9f7ec',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/xdc.svg',
}

const zetachainIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/zetachain.svg',
}

const zkSyncIcon: IconMetadata = {
  iconBackground: '#f9f7ec',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/zkSync.svg',
}

const zoraIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/zora.svg',
}

const roninIcon: IconMetadata = {
  iconBackground: '#1273EA',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/ronin.svg',
}

const hyperEvmIcon: IconMetadata = {
  iconBackground: '#FFFFFF',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/hyperevm.svg',
}

const hyperCoreIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/hypercore.svg',
}

const inkIcon: IconMetadata = {
  iconBackground: '#7132F5',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/ink.svg',
}

const lighterIcon: IconMetadata = {
  iconBackground: '#000000',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/lighter.svg',
}

const tronIcon: IconMetadata = {
  iconBackground: '#FF080B',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/tron.svg',
}

const robinhoodIcon: IconMetadata = {
  iconBackground: '#00C805',
  iconUrl: 'https://sdk-cdn.fun.xyz/images/robinhood.svg',
}

const chainMetadataByName: Record<ChainName, ChainMetadata | null> = {
  abstract: { chainId: 2741, name: 'Abstract', ...abstractIcon },
  arbitrum: { chainId: 42_161, name: 'Arbitrum', ...arbitrumIcon },
  arbitrumGoerli: {
    chainId: 421_613,
    name: 'Arbitrum Goerli',
    ...arbitrumIcon,
  },
  arbitrumSepolia: {
    chainId: 421_614,
    name: 'Arbitrum Sepolia',
    ...arbitrumIcon,
  },
  avalanche: { chainId: 43_114, name: 'Avalanche', ...avalancheIcon },
  avalancheFuji: { chainId: 43_113, name: 'Avalanche Fuji', ...avalancheIcon },
  base: { chainId: 8453, name: 'Base', ...baseIcon },
  baseGoerli: { chainId: 84531, name: 'Base Goerli', ...baseIcon },
  baseSepolia: { chainId: 84532, name: 'Base Sepolia', ...baseIcon },
  blast: { chainId: 81457, name: 'Blast', ...blastIcon },
  blastSepolia: { chainId: 168_587_773, name: 'Blast Sepolia', ...blastIcon },
  bsc: { chainId: 56, name: 'BSC', ...bscIcon },
  bscTestnet: { chainId: 97, name: 'BSC Testnet', ...bscIcon },
  cronos: { chainId: 25, name: 'Cronos', ...cronosIcon },
  cronosTestnet: { chainId: 338, name: 'Cronos Testnet', ...cronosIcon },
  ethereal: { chainId: ETHEREAL_CHAIN_ID, name: 'Ethereal', ...etherealIcon },
  goerli: { chainId: 5, name: 'Goerli', ...ethereumIcon },
  hardhat: { chainId: 31_337, name: 'Hardhat', ...hardhatIcon },
  holesky: { chainId: 17000, name: 'Holesky', ...ethereumIcon },
  hyperEvm: { chainId: HYPER_EVM_CHAIN_ID, name: 'HyperEVM', ...hyperEvmIcon },
  ink: { chainId: 57073, name: 'Ink', ...inkIcon },
  kovan: { chainId: 42, name: 'Kovan', ...ethereumIcon },
  klaytn: { chainId: 8_217, name: 'Klaytn', ...klaytnIcon },
  klaytnBaobab: { chainId: 1_001, name: 'Klaytn Baobab', ...klaytnIcon },
  lighter: { chainId: LIGHTER_CHAIN_ID, name: 'Lighter', ...lighterIcon },
  lighterRh: {
    chainId: LIGHTER_RH_CHAIN_ID,
    name: 'Robinhood Lighter',
    ...lighterIcon,
  },
  mainnet: { chainId: 1, name: 'Ethereum', ...ethereumIcon },
  manta: { chainId: 169, name: 'Manta', ...mantaIcon },
  mantaSepolia: { chainId: 3_441_006, name: 'Manta Sepolia', ...mantaIcon },
  mantaTestnet: { chainId: 3_441_005, name: 'Manta Testnet', ...mantaIcon },
  mantle: { chainId: 5000, name: 'Mantle', ...mantleIcon },
  mantleTestnet: { chainId: 5001, name: 'Mantle Testnet', ...mantleIcon },
  monad: { chainId: MONAD_CHAIN_ID, name: 'Monad', ...monadIcon },
  optimism: { chainId: 10, name: 'Optimism', ...optimismIcon },
  optimismGoerli: { chainId: 420, name: 'Optimism Goerli', ...optimismIcon },
  optimismKovan: { chainId: 69, name: 'Optimism Kovan', ...optimismIcon },
  optimismSepolia: {
    chainId: 11155420,
    name: 'Optimism Sepolia',
    ...optimismIcon,
  },
  polygon: { chainId: 137, name: 'Polygon', ...polygonIcon },
  polygonMumbai: { chainId: 80_001, name: 'Polygon Mumbai', ...polygonIcon },
  rinkeby: { chainId: 4, name: 'Rinkeby', ...ethereumIcon },
  robinhood: {
    chainId: ROBINHOOD_MAINNET_CHAIN_ID,
    name: 'Robinhood',
    ...robinhoodIcon,
  },
  ropsten: { chainId: 3, name: 'Ropsten', ...ethereumIcon },
  ronin: { chainId: 2020, name: 'Ronin', ...roninIcon },
  scroll: { chainId: 534352, name: 'Scroll', ...scrollIcon },
  sepolia: { chainId: 11_155_111, name: 'Sepolia', ...ethereumIcon },
  // Non-evm -- Funkit solana support
  solanaMainnet: {
    chainId: SOLANA_MAINNET_CHAIN_ID,
    name: 'Solana',
    ...solanaIcon,
  },
  // Non-evm -- Funkit Tron support
  tron: {
    chainId: Number(TRON_MAINNET_CHAIN_ID),
    name: 'Tron',
    ...tronIcon,
  },
  // Non-evm -- Funkit HyperCore support
  hyperCore: {
    chainId: HYPERCORE_CHAIN_ID,
    name: 'HyperCore',
    ...hyperCoreIcon,
  },
  // Non-evm -- Funkit Bitcoin support
  bitcoin: {
    chainId: BITCOIN_MAINNET_CHAIN_ID,
    name: 'Bitcoin',
    ...bitcoinIcon,
  },
  // Non-evm -- Funkit Bitcoin Lightning support
  lightning: {
    chainId: LIGHTNING_MAINNET_CHAIN_ID,
    name: 'Lightning',
    ...lightningIcon,
  },
  xdc: { chainId: 50, name: 'XinFin', ...xdcIcon },
  xdcTestnet: { chainId: 51, name: 'XinFin Testnet', ...xdcIcon },
  zetachain: { chainId: 7000, name: 'ZetaChain', ...zetachainIcon },
  zetachainAthensTestnet: {
    chainId: 7001,
    name: 'Zeta Athens',
    ...zetachainIcon,
  },
  zkSync: { chainId: 324, name: 'zkSync', ...zkSyncIcon },
  zkSyncTestnet: { chainId: 280, name: 'zkSync Testnet', ...zkSyncIcon },
  zora: { chainId: 7777777, name: 'Zora', ...zoraIcon },
  zoraSepolia: { chainId: 999999999, name: 'Zora Sepolia', ...zoraIcon },
}

export const chainMetadataById = Object.fromEntries(
  Object.values(chainMetadataByName)
    .filter(isNotNullish)
    .map(({ chainId, ...metadata }) => [chainId, metadata]),
)
