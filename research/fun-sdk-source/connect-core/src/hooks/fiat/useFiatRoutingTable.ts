import type { FiatClientCapability } from '@funkit/api-base'
import type { FiatRoutingTableResponse } from '@fun-xyz/fiat-contract/routing'
import type { DestinationAsset as FiatDestinationAsset } from '@fun-xyz/fiat-contract/types'
import {
  getResponseErrorBody,
  isFiatAuthenticationError,
} from '@funkit/api-base'
import { ThrottlingError, isRecord } from '@funkit/utils'
import { hashKey, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { sendAuthedFiatTransition } from '~/domains/fiat/authedTransport'
import { redactFiatBodyForLog } from '~/domains/fiat/fiatLogRedactor'
import {
  type IdentityAssertionProvider,
  isIdentityMintFailure,
} from '~/domains/fiat/identityAssertion'
import {
  type QuoteGeo,
  isQuotableGeo,
  isSupportedQuoteChainId,
} from '~/domains/fiat/quoteRequest'
import {
  ROUTING_TABLE_ENDPOINT,
  ROUTING_TABLE_SCOPE,
  type RoutingTableProviderInputs,
  checkoutFeeSubsidyKey,
  feeSubsidyDecisionOf,
  parseRoutingTable,
  routingTableRequest,
} from '~/domains/fiat/routingTable'
import type { FunLogger } from '~/utils/funLogger'
import { randomUuid } from '~/utils/randomUuid'

/**
 * The scheduled refresh comes no sooner than this after a table arrives, so a server TTL
 * that is short, or already past on a fast phone clock, cannot refetch back to back.
 */
const MIN_SCHEDULED_REFRESH_MS = 12_000
/** A hung table would hold every quote, so each request gives up after this. */
const TABLE_TIMEOUT_MS = 10_000
/** The replacement is asked for this early, so Continue stays live across it, as the quote's is. */
const TABLE_REFRESH_BUFFER_MS = 5_000
/**
 * - The floor keeps a table usable until its scheduled replacement can land
 * - The cap is the server's own TTL, which a slow phone clock would stretch
 */
const MIN_TABLE_LIFETIME_MS = MIN_SCHEDULED_REFRESH_MS + TABLE_REFRESH_BUFFER_MS
const MAX_TABLE_LIFETIME_MS = 60_000
/** The server's budget is per 60 s, so a 429 retried sooner is usually refused again. */
const THROTTLED_RETRY_MS = 12_000

interface HeldRoutingTable {
  table: FiatRoutingTableResponse
  /** When `table` arrived. */
  fetchedAt: number
  /**
   * Local clock time the table stops being used. The response carries no server time, so
   * `expiresAt` is read once, relative to arrival: a phone clock off by a minute still routes.
   */
  deadline: number
}

export interface UseFiatRoutingTableParams {
  apiKey: string
  userId: string
  logger: FunLogger
  /** The server ranks routes by them, so a table is fetched per set. */
  clientCapabilities: readonly FiatClientCapability[]
  identityAssertionProvider: IdentityAssertionProvider | undefined
  /** One sheet open, which holds the table. Undefined turns the table off. */
  sessionId: string | undefined
  enabled: boolean
  currency: string | undefined
  paymentMethod: string
  cryptoCurrencyCode: string
  chainId: string
  geo: QuoteGeo | undefined
  getRoutingProviderInputs?: () => RoutingTableProviderInputs | undefined
  /** The asset the buyer ends up with, which the table's routes deliver into. */
  destinationAsset: FiatDestinationAsset | undefined
  /** Mode 2 only: the recipient; a different wallet can get different routes, so it keys the table. */
  depositAddress?: string
}

export interface UseFiatRoutingTableResult {
  table: FiatRoutingTableResponse | undefined
  /** Fetching with no usable table, including a retry after a failure. */
  isLoading: boolean
  /** Any table request in flight, including a refresh. */
  isFetching: boolean
  /**
   * Read at call time: the held table, or undefined once it is invalidated (`refreshRoutingTable`)
   * or past its deadline. Such a table may still route until its replacement lands, but its limit reads are not sent.
   */
  currentTable: () => FiatRoutingTableResponse | undefined
  /**
   * The last table request's error, retried once already; undefined once one succeeds,
   * and while a held table is still within its deadline.
   */
  error: unknown
  /** Fetches at once, joining a request in flight; resolves `true` when a new table arrived. */
  refresh: () => Promise<boolean>
  /** Clears a failure and fetches the table again at once. */
  retry: () => void
  /**
   * The last table fetched, read past its deadline (unlike `table`): a KYC verdict holds the flow,
   * which turns the table off, so it is not refetched while the buyer reads the verdict. Only for
   * figures that tapping re-quotes, so one that has moved since costs a refusal, not a wrong order.
   */
  lastFetchedTable: FiatRoutingTableResponse | undefined
}

/** Debug logs keep the table; the request's provider credentials never log. */
function routingTableLogRedactor(
  logger: Pick<FunLogger, 'isDebug'>,
): (value: unknown) => unknown {
  return logger.isDebug
    ? (value) => (isRecord(value) ? { ...value, providers: undefined } : value)
    : redactFiatBodyForLog
}

/** The transport's errors carry the request body, which the query cache would keep. */
function withoutProviderInputs(error: unknown): unknown {
  if (
    !(error instanceof Error) ||
    !('paramsUsed' in error) ||
    !isRecord(error.paramsUsed) ||
    !isRecord(error.paramsUsed.body)
  ) {
    return error
  }
  const body = { ...error.paramsUsed.body }
  delete body.providers
  error.paramsUsed = { ...error.paramsUsed, body }
  return error
}

function heldTable(
  table: FiatRoutingTableResponse,
  fetchedAt: number,
): HeldRoutingTable {
  const lifetime = Math.min(
    Math.max(Date.parse(table.expiresAt) - fetchedAt, MIN_TABLE_LIFETIME_MS),
    MAX_TABLE_LIFETIME_MS,
  )
  return { table, fetchedAt, deadline: fetchedAt + lifetime }
}

function remainingLifetime(held: HeldRoutingTable | undefined): number {
  if (held === undefined) {
    return 0
  }
  return Math.max(held.deadline - Date.now(), 0)
}

/** When the replacement is asked for; never sooner than {@link MIN_SCHEDULED_REFRESH_MS}. */
function refreshAt(held: HeldRoutingTable): number {
  return held.deadline - TABLE_REFRESH_BUFFER_MS
}

/** `POST /fiat/routing/table` for one payment method, held until the table expires. */
export function useFiatRoutingTable({
  apiKey,
  userId,
  logger,
  clientCapabilities,
  identityAssertionProvider,
  sessionId,
  enabled,
  currency,
  paymentMethod,
  cryptoCurrencyCode,
  chainId,
  geo,
  getRoutingProviderInputs,
  destinationAsset,
  depositAddress,
}: UseFiatRoutingTableParams): UseFiatRoutingTableResult {
  const queryClient = useQueryClient()
  // Read at request time, so a retry or refresh uses the latest SDK credentials.
  const providerInputsReader = useRef(getRoutingProviderInputs)
  providerInputsReader.current = getRoutingProviderInputs
  const [expiryVersion, setExpiryVersion] = useState(0)
  const queryKey = [
    ...ROUTING_TABLE_SCOPE,
    sessionId ?? '',
    apiKey,
    userId,
    currency ?? '',
    paymentMethod,
    cryptoCurrencyCode,
    chainId,
    geo?.alpha2 ?? '',
    geo?.region ?? '',
    destinationAsset === undefined ? '' : JSON.stringify(destinationAsset),
    clientCapabilities.join(','),
    depositAddress ?? '',
  ] as const
  // The key is rebuilt every render; its hash is the same while its parts are.
  const queryHash = hashKey(queryKey)

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }): Promise<HeldRoutingTable> => {
      if (currency === undefined || geo === undefined) {
        throw new Error('Routing table request has no currency or geo')
      }
      const send = (
        params: Parameters<typeof sendAuthedFiatTransition>[0]['params'],
      ) =>
        sendAuthedFiatTransition<unknown>(
          {
            apiKey,
            logger,
            clientCapabilities,
            signal,
            timeoutMs: TABLE_TIMEOUT_MS,
            redactBodyForLog: routingTableLogRedactor(logger),
            // The query's own retry is the one retry.
            maxAttempts: 1,
            params,
          },
          identityAssertionProvider,
        )
      const corridor = {
        currency,
        cryptoCurrencyCode,
        chainId,
        geo,
        paymentMethod,
      }
      let providers: RoutingTableProviderInputs | undefined
      try {
        providers = providerInputsReader.current?.()
      } catch (error) {
        logger.warn('connect-core:fiat:routing_inputs_unavailable', {
          error: error instanceof Error ? error.name : typeof error,
        })
      }
      const response = await send({
        endpoint: ROUTING_TABLE_ENDPOINT,
        idempotencyKey: randomUuid(),
        body: routingTableRequest({
          ...corridor,
          providers,
          destinationAsset,
          depositAddress,
        }),
      }).catch((error: unknown) => {
        throw withoutProviderInputs(error)
      })
      const table = parseRoutingTable(response)
      const subsidized = feeSubsidyDecisionOf(table)
      if (sessionId !== undefined && subsidized !== undefined) {
        queryClient.setQueryData(checkoutFeeSubsidyKey(sessionId), subsidized)
      }
      logger.info('connect-core:fiat:routing_table_fetched', {
        intervals: Object.fromEntries(
          table.methods.map((entry) => [entry.method, entry.intervals.length]),
        ),
        unavailable: Object.fromEntries(
          table.methods.map((entry) => [entry.method, entry.unavailableReason]),
        ),
      })
      return heldTable(table, Date.now())
    },
    enabled:
      sessionId !== undefined &&
      enabled &&
      currency !== undefined &&
      isQuotableGeo(geo) &&
      isSupportedQuoteChainId(chainId),
    // A rejected assertion was already retried once, by `sendAuthedFiatTransition`,
    // and a failed mint by the host's minter wrapper.
    retry: (failureCount, error) =>
      failureCount < 1 &&
      !isFiatAuthenticationError(error) &&
      !isIdentityMintFailure(error),
    retryDelay: (_, error) =>
      error instanceof ThrottlingError ? THROTTLED_RETRY_MS : 1_000,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: (cached) => remainingLifetime(cached.state.data),
  })

  // The table waits on the region currency, so mint its assertion meanwhile, once per session.
  // A failed mint is reported by the minter; the table request surfaces it as usual.
  const warmedSession = useRef<string>(undefined)
  useEffect(() => {
    if (
      !enabled ||
      sessionId === undefined ||
      identityAssertionProvider === undefined ||
      warmedSession.current === sessionId
    ) {
      return
    }
    warmedSession.current = sessionId
    identityAssertionProvider.get().catch(() => {})
  }, [enabled, sessionId, identityAssertionProvider])

  // A failed refresh leaves the held table routing until its deadline.
  const held = query.data
  const isFailedWithTable = query.isError && remainingLifetime(held) > 0
  const isFailed = query.isError && !isFailedWithTable

  // Asks for the replacement at `refreshAt`, then re-renders at the deadline so an
  // unreplaced table stops routing even when nothing else renders. After a failed
  // refresh the deadline only re-renders: Try again asks for the next table.
  useEffect(() => {
    if (!enabled || sessionId === undefined || held === undefined || isFailed) {
      return
    }
    const now = Date.now()
    const next =
      now < refreshAt(held) && !query.isError ? refreshAt(held) : held.deadline
    if (next <= now) {
      return
    }
    const timer = setTimeout(
      () => {
        setExpiryVersion((version) => version + 1)
        if (!query.isError) {
          void query.refetch({ cancelRefetch: false })
        }
      },
      Math.min(next - now, 2_147_483_647),
    )
    return () => clearTimeout(timer)
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [
    enabled,
    sessionId,
    held,
    isFailed,
    query.isError,
    query.refetch,
    expiryVersion,
  ])

  useEffect(() => {
    if (!enabled || sessionId === undefined) {
      void queryClient.cancelQueries({ queryKey, exact: true })
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [enabled, sessionId, queryClient, queryHash])

  const failure =
    sessionId !== undefined && query.status === 'error'
      ? query.error
      : undefined
  const error = isFailedWithTable ? undefined : failure
  const failedAt = failure === undefined ? undefined : query.errorUpdatedAt
  const failedErrorCode = getResponseErrorBody(failure)?.errorCode
  const failedCause =
    failure instanceof Error ? failure.message : String(failure)
  useEffect(() => {
    if (failedAt === undefined) {
      return
    }
    logger.warn('connect-core:fiat:routing_table_failed', {
      paymentMethod,
      errorCode: failedErrorCode,
      cause: failedCause,
    })
  }, [failedAt, logger, paymentMethod, failedErrorCode, failedCause])

  const refresh = useCallback(async () => {
    const before = queryClient.getQueryData<HeldRoutingTable>(queryKey)
    await queryClient.refetchQueries(
      { queryKey, exact: true },
      { cancelRefetch: false },
    )
    const after = queryClient.getQueryData<HeldRoutingTable>(queryKey)
    return after !== undefined && after.fetchedAt !== before?.fetchedAt
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [queryClient, queryHash])

  const currentTable = useCallback(() => {
    const state = queryClient.getQueryState<HeldRoutingTable>(queryKey)
    return state === undefined ||
      state.isInvalidated ||
      remainingLifetime(state.data) === 0
      ? undefined
      : state.data?.table
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [queryClient, queryHash])

  const retry = useCallback(() => {
    void queryClient.resetQueries({ queryKey, exact: true })
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [queryClient, queryHash])

  const table =
    error === undefined && remainingLifetime(query.data) > 0
      ? query.data?.table
      : undefined
  return {
    table,
    isLoading: table === undefined && query.isFetching,
    isFetching: query.isFetching,
    currentTable,
    error,
    refresh,
    retry,
    lastFetchedTable: query.data?.table,
  }
}
