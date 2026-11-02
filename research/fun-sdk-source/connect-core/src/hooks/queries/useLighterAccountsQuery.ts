import { type LighterChainId, getLighterApiBaseUrl } from '@funkit/chains'
import { isAddressEquivalent } from '@funkit/utils'
import { useQuery } from '@tanstack/react-query'
import { type Address, zeroAddress } from 'viem'

/**
 * Addresses that are not a user's wallet: `0x` is the unset placeholder, and
 * the zero address only looks resolvable — Lighter maps it to its own system
 * accounts, index 0 of which holds four figures of collateral. Querying it
 * yields a working-looking rail pointed at protocol funds, so it must be
 * refused rather than passed through.
 */
const NON_WALLET_ADDRESSES: string[] = ['0x', zeroAddress]

/** Whether Lighter can be asked to resolve this address to a user account. */
export function isResolvableLighterL1Address(
  address: Address | '' | undefined,
): address is Address {
  if (!address) {
    return false
  }
  return !NON_WALLET_ADDRESSES.some((nonWallet) =>
    isAddressEquivalent({ firstAddress: nonWallet, secondAddress: address }),
  )
}

/**
 * Lighter addresses accounts by a numeric index, so anything else means the
 * lookup returned something unusable. Refused here rather than at each caller:
 * the value is read back as a deposit recipient and as a withdrawal account,
 * where a malformed one routes funds nowhere recoverable.
 */
function toLighterAccountIndex(index: number | undefined): string | undefined {
  const asString = index?.toString()
  if (!asString || !/^\d+$/.test(asString)) {
    return undefined
  }
  return asString
}

/** Lighter `account_type`: main account (deposit/withdraw target) is 0, sub-accounts are 1. */
const LIGHTER_MAIN_ACCOUNT_TYPE = 0

/** Lighter `account_trading_mode`: 0 = simple (separate spot/perps balances), 1 = Unified Trading (one USDC balance). */
export const LIGHTER_TRADING_MODE = {
  SIMPLE: 0,
  UNIFIED: 1,
} as const

export type LighterSubAccount = {
  code: number
  account_type: number
  index: number
  l1_address: Address
  cancel_all_time: number
  total_order_count: number
  total_isolated_order_count: number
  pending_order_count: number
  available_balance: string
  status: number
  collateral: string
  transaction_time: number
  account_trading_mode: number
}

export type LighterAccountsByL1AddressResponse = {
  code: number
  l1_address: Address
  sub_accounts: LighterSubAccount[]
}

export async function getLighterAccountsByL1Address(
  address: Address,
  chainId: LighterChainId,
): Promise<LighterAccountsByL1AddressResponse> {
  const response = await fetch(
    `${getLighterApiBaseUrl(chainId)}/api/v1/accountsByL1Address?l1_address=${address}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch lighter accounts: ${response.statusText}`)
  }
  const data = await response.json()
  return data
}

/**
 * Resolves an L1 wallet address to its Lighter L2 main-account index (Lighter
 * EOA generation targets the L2 account, not the L1 address) and trading
 * mode. Params-shaped and provider-free — shared by web and React Native.
 * `chainId` picks the Lighter instance (account indexes differ per instance);
 * undefined skips the lookup rather than defaulting to one.
 */
export function useLighterAccountsQuery({
  address,
  chainId,
}: {
  address: Address | '' | undefined
  chainId: LighterChainId | undefined
}) {
  const enabled = isResolvableLighterL1Address(address) && chainId !== undefined
  const query = useQuery({
    queryKey: ['lighterAccounts', chainId, address],
    queryFn: () => {
      if (chainId === undefined) {
        throw new Error('Lighter accounts query ran without a Lighter chain id')
      }
      return getLighterAccountsByL1Address(address as Address, chainId)
    },
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
    refetchOnMount: 'always',
  })
  // account_type has no guaranteed array order — select by type, not [0],
  // or deposits can misroute to a sub-account.
  const subAccounts = query.data?.sub_accounts
  const mainAccount = subAccounts?.find(
    (account) => account.account_type === LIGHTER_MAIN_ACCOUNT_TYPE,
  )
  return {
    ...query,
    mainAccountIndex: toLighterAccountIndex(mainAccount?.index),
    isUnifiedTradingMode:
      mainAccount?.account_trading_mode === LIGHTER_TRADING_MODE.UNIFIED,
    subAccounts,
  }
}
