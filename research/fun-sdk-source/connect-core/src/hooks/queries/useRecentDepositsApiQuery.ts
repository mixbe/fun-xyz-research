import {
  type DirectExecution,
  getDirectExecutionsByUserId,
} from '@funkit/api-base'
import { type UseQueryResult, useQuery } from '@tanstack/react-query'

import type { FunLogger } from '~/utils/funLogger'

export interface RecentDepositsApiQueryParams {
  isVisible: boolean
  fetchSize?: number
  apiKey: string
  userId: string
  refreshIntervalMs: number
  logger: FunLogger
}

/**
 * Params-shaped recent-deposits fetch shared by web and React Native: pulls the
 * current user's direct executions via `@funkit/api-base`. No provider context
 * — identity, refresh interval, the feature gate, and the logger are injected.
 *
 * @returns raw direct executions (no filtering or transforms applied)
 */
export function useRecentDepositsApiQuery({
  isVisible,
  fetchSize = 5,
  userId,
  refreshIntervalMs,
  apiKey,
  logger,
}: RecentDepositsApiQueryParams): UseQueryResult<DirectExecution[]> {
  return useQuery({
    queryKey: ['useRecentDepositsApi', userId, fetchSize],
    queryFn: async () => {
      const directExecutions = await getDirectExecutionsByUserId({
        userId,
        limit: fetchSize,
        apiKey,
        logger,
      })
      return directExecutions
    },
    refetchInterval: refreshIntervalMs,
    enabled: isVisible && !!userId,
  })
}
