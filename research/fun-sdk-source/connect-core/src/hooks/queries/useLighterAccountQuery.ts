import type { LighterAccountIndex } from '@funkit/api-base'
import { type LighterChainId, getLighterApiBaseUrl } from '@funkit/chains'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { Address } from 'viem'
import { isResolvableLighterL1Address } from './useLighterAccountsQuery'

export type LighterAsset = {
  symbol: string
  asset_id: number
  balance: string
  locked_balance: string
}

/**
 * A user's stake in a Lighter public pool. Entry state only: current value is
 * `shares_amount` × the pool's share price, which needs the pool account too.
 */
export type LighterShare = {
  public_pool_index: number
  shares_amount: number
  entry_usdc: string
  principal_amount: string
  entry_timestamp: number
}

/**
 * Public-pool accounting, present only on pool accounts (`account_type: 4`).
 * Share price is `<pool asset balance> / total_shares`.
 */
export type LighterPoolInfo = {
  total_shares: number
  operator_shares: number
}

export type LighterAccount = {
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
  account_index: number
  name: string
  description: string
  can_invite: boolean
  referral_points_percentage: string
  can_rfq: boolean
  created_at: number
  positions: unknown[]
  assets: LighterAsset[]
  total_asset_value: string
  cross_asset_value: string
  shares: LighterShare[]
  pending_unlocks: unknown[]
  /** Pool accounts only — absent on user accounts. */
  pool_info?: LighterPoolInfo
}

export type LighterAccountResponse = {
  code: number
  total: number
  accounts: LighterAccount[]
}

/** Which account to read; {@link LighterAccountLookup} adds the instance. */
export type LighterAccountSelector =
  | { by: 'index'; value: LighterAccountIndex }
  | { by: 'l1_address'; value: Address }

export type LighterAccountLookup = LighterAccountSelector & {
  /** Lighter instance the account lives on; indexes collide across instances. */
  chainId: LighterChainId
}

export async function getLighterAccount(
  lookup: LighterAccountLookup,
  activeOnly?: boolean,
): Promise<LighterAccountResponse> {
  const params = new URLSearchParams({
    by: lookup.by,
    value: String(lookup.value),
    ...(activeOnly !== undefined && { active_only: String(activeOnly) }),
  })
  const response = await fetch(
    `${getLighterApiBaseUrl(lookup.chainId)}/api/v1/account?${params}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch lighter account: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Ungated Lighter account query. For callers whose module is Lighter-specific
 * by construction — `clients/lighter` is a separate bundle entry with its own copy
 * of the config context, so `useFunkitConfig()` there yields no api key and a
 * customer check would disable the query forever.
 */
export function useLighterAccountQuery(
  lookup: LighterAccountLookup | null,
  options?: { activeOnly?: boolean },
) {
  const enabled =
    lookup !== null &&
    (lookup.by === 'index' ? true : isResolvableLighterL1Address(lookup.value))
  const query = useQuery({
    queryKey: [
      'lighterAccount',
      lookup?.chainId,
      lookup?.by,
      lookup?.value,
      options?.activeOnly,
    ],
    queryFn: () => {
      if (!lookup) {
        throw new Error('Lighter account query ran without a lookup')
      }
      return getLighterAccount(lookup, options?.activeOnly)
    },
    enabled,
    // Refetch on every (re)mount so reopening the withdraw widget shows a fresh
    // balance after a spot→perps transfer; 10s stale window keeps it current.
    staleTime: 10_000,
    refetchOnMount: 'always',
    retry: false,
  })
  return {
    ...query,
    account: query.data?.accounts?.[0],
  }
}

/**
 * Returns a callback that invalidates the cached Lighter account queries so the
 * balance refetches eagerly (e.g. right after a withdrawal). No-op for
 * non-Lighter customers.
 */
export function useInvalidateLighterAccount() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    // Prefix match — covers both query families and all key variants.
    queryClient.invalidateQueries({ queryKey: ['lighterAccount'] })
    queryClient.invalidateQueries({ queryKey: ['lighterAccounts'] })
  }, [queryClient])
}
