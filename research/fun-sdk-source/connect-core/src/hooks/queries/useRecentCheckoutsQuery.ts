import {
  type CheckoutHistoryItem,
  getCheckoutsByUserId,
} from '@funkit/api-base'
import { type UseQueryResult, useQuery } from '@tanstack/react-query'

import { DEFAULT_NOTIF_CUTOFF } from '~/domains/checkoutNotifications'
import { PaymentMethod } from '~/domains/paymentMethods'
import { isCheckoutValid } from '~/utils/checkout'
import type { FunLogger } from '~/utils/funLogger'

const hasCorrectPaymentMethod = (
  checkout: CheckoutHistoryItem,
  paymentMethod?: PaymentMethod,
) =>
  !paymentMethod ||
  checkout.clientMetadata.selectedPaymentMethodInfo?.paymentMethod ===
    paymentMethod

const isRecent = (checkout: CheckoutHistoryItem, timestampCutoff: number) =>
  checkout.createdTimeMs > timestampCutoff

export interface RecentCheckoutsQueryParams {
  isVisible: boolean
  paymentMethod?: PaymentMethod
  apiKey: string
  userId: string
  isUserLoggedIn: boolean
  refreshIntervalMs: number
  logger: FunLogger
}

/**
 * Params-shaped recent-checkouts fetch shared by web and React Native: pulls the
 * user's checkouts via `@funkit/api-base` and keeps the valid, recent ones for
 * the requested payment method, newest first. No provider context — identity,
 * refresh interval, and the logger are injected.
 *
 * @returns recent checkouts tied to a recipient address used in the token transfer flow
 */
export function useRecentCheckoutsQuery({
  paymentMethod = PaymentMethod.TOKEN_TRANSFER,
  isVisible,
  apiKey,
  userId,
  isUserLoggedIn,
  refreshIntervalMs,
  logger,
}: RecentCheckoutsQueryParams): UseQueryResult<CheckoutHistoryItem[]> {
  return useQuery({
    // paymentMethod is part of the key: it's a client-side filter, so two
    // callers with the same userId but different methods must not share a
    // cache entry.
    queryKey: ['checkouts', userId, paymentMethod],
    queryFn: async () => {
      const checkouts = await getCheckoutsByUserId({
        userId,
        limit: 5,
        apiKey,
        logger,
      })
      const defaultTimestampCutoff = Date.now() - DEFAULT_NOTIF_CUTOFF

      //TODO: would prefer an endpoint for this filtering
      return checkouts
        .filter(
          (checkout) =>
            isCheckoutValid(checkout) &&
            isRecent(checkout, defaultTimestampCutoff) &&
            hasCorrectPaymentMethod(checkout, paymentMethod),
        )
        .sort((a, b) => b.createdTimeMs - a.createdTimeMs)
    },
    refetchInterval: refreshIntervalMs,
    enabled: isUserLoggedIn && isVisible && !!userId,
  })
}
