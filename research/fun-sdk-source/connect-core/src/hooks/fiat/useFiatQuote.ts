import type { FiatClientCapability } from '@funkit/api-base'
import type { RoutingTableProviderInputs } from '~/domains/fiat/routingTable'
import type {
  RoutingProvider,
  RoutingTableInterval,
} from '@fun-xyz/fiat-contract/routing'
import type {
  DestinationAsset as FiatDestinationAsset,
  FiatProvider,
  FiatStepResponse,
  PreparedPayment,
  Quote,
  QuoteLimits,
} from '@fun-xyz/fiat-contract/types'
import { getResponseErrorBody } from '@funkit/api-base'
import {
  type Query,
  type QueryClient,
  hashKey,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { sendAuthedFiatTransition } from '~/domains/fiat/authedTransport'
import type { EntryCta } from '~/domains/fiat/entryCta'
import {
  enteredStep,
  selectEntryCta,
  submittableTransition,
} from '~/domains/fiat/entryCta'
import { fiatLogRedactor } from '~/domains/fiat/fiatLogRedactor'
import type { FiatQuoteNoRoute } from '~/domains/fiat/quoteNoRoute'
import { quoteNoRouteFromError } from '~/domains/fiat/quoteNoRoute'
import type {
  FiatQuoteMaximum,
  FiatQuoteMinimum,
  FiatRoutingOverrides,
  QuoteGeo,
  QuoteRequest,
} from '~/domains/fiat/quoteRequest'
import {
  QUOTE_ENDPOINT,
  isQuotableAmount,
  isQuotableGeo,
  isSupportedQuoteChainId,
  isUnpriceableUsGeo,
  quoteMaximumFromError,
  quoteMinimumFromError,
  routingOverridesKey,
  toQuoteAmount,
} from '~/domains/fiat/quoteRequest'
import {
  type RouteIdentity,
  type RouteMinimum,
  readRouteLimits,
  readRouteMinimum,
  recordRouteLimits,
  recordRouteMinimum,
  routeLimitsKey,
} from '~/domains/fiat/routeLimits'
import type { IdentityAssertionProvider } from '~/domains/fiat/identityAssertion'
import {
  type AmountRoute,
  NO_PROVIDER_SELECTION,
  type OpaqueLimitRead,
  type ProviderDisposition,
  type ProviderRoute,
  type ProviderSelection,
  ROUTING_QUOTE_ENDPOINT,
  type RoutingMode,
  type RoutingQuoteRequest,
  checkoutFeeSubsidyKey,
  excludedProvidersOf,
  isFallThroughRefusal,
  limitReadOf,
  practicalMaximumOf,
  quoteThroughProviders,
  routeAmount,
  routingModeFor,
  statusOf,
  unroutedMethodRefusal,
} from '~/domains/fiat/routingTable'
import { preparedPaymentOf } from '~/domains/fiat/preparedPayment'
import type {
  FiatQuoteIntent,
  FiatQuoteRequest,
} from '~/domains/fiat/quoteIntent'
import { quoteIntent, quoteRequestCause } from '~/domains/fiat/quoteIntent'
import { PaymentMethod } from '~/domains/paymentMethods'
import type { FunLogger } from '~/utils/funLogger'
import { randomUuid } from '~/utils/randomUuid'
import { useDebouncedValue } from '../useDebouncedValue'
import { useLogOnce } from '../useLogOnce'
import { useFiatRoutingTable } from './useFiatRoutingTable'
import type { FiatFlow } from './useFiatTransitions'

const DEFAULT_DEBOUNCE_MS = 400
const QUOTE_QUERY_SCOPE = ['fiat', 'quote'] as const
const NO_PROVIDERS: readonly FiatProvider[] = []
/** Largest head start for a replacement to land before the old quote dies. */
const QUOTE_REFRESH_BUFFER_MS = 5_000
/** A quote request that never answers would spin the pay button forever; as long as the table waits. */
const QUOTE_TIMEOUT_MS = 10_000

export interface UseFiatQuoteParams {
  apiKey: string
  userId?: string
  logger: FunLogger
  flow: Pick<
    FiatFlow,
    | 'submit'
    | 'submitWithOutcome'
    | 'receive'
    | 'isInFlight'
    | 'identityAssertionProvider'
    | 'clientCapabilities'
    | 'destinationAsset'
    | 'clientRecipient'
  >
  amount: string
  /**
   * ISO 4217 the buyer pays in, resolved from their region. Undefined while
   * that lookup is in flight; the request requires it, so no quote is sent
   * until it lands.
   */
  currency: string | undefined
  paymentMethod: string
  cryptoCurrencyCode: string
  chainId: string
  /**
   * Where the buyer is, in the geo lookup's own field names. Optional only
   * because that lookup is async — the request requires it, so no quote is
   * sent until it resolves.
   */
  geo?: QuoteGeo
  /**
   * Test tooling; see {@link FiatRoutingOverrides}. Prefixed so a host does
   * not reach it by tab-completion: production backends refuse the quote.
   */
  unstable_routingOverrides?: FiatRoutingOverrides
  /** Let capable providers preopen an auth surface while the buyer reviews the quote. */
  prepareSessionAuth?: boolean
  /** Providers whose own flow the caller can run; see {@link QuoteRequest.handoffs}. */
  handoffs?: readonly FiatProvider[]
  /** Providers whose own checkout exited and must be skipped for this visit. */
  providerFlowExclusions?: readonly FiatProvider[]
  /**
   * Ask a routed Coinbase Apple Pay quote to carry its payment surface as
   * `preparedPayment`, so the app needs no `POST /fiat/payment-session`.
   */
  preparePaymentSession?: boolean
  /**
   * One sheet open, which holds the routing table. Quotes go through
   * `POST /fiat/routing/table` and `POST /fiat/routing/quote`; routing overrides
   * keep `POST /fiat/quote`, which preserves the allowlist through KYC rerouting.
   */
  routingTableSessionId: string
  /** Read client-held credentials at request time; never stored in the query cache. */
  getRoutingProviderInputs?: () => RoutingTableProviderInputs | undefined
  /** Which table providers may quote this buyer, and in what order. */
  providerSelection?: ProviderSelection
  /**
   * The price the screen asks for; a new intent quotes again. Without one, each
   * mount is its own.
   */
  intent?: FiatQuoteIntent
  enabled?: boolean
  debounceMs?: number
}

/** What the buyer chose, for a provider flow the routing table named first. */
export interface FiatHandoffCheckout {
  amount: { currency: string; amount: string }
  /** `network` is the chain id, as a quote's `crypto.network` is. */
  destination: { asset: string; network: string }
  paymentMethod: string
}

/**
 * A provider's own flow takes over: from `/fiat/quote`'s `handoff`, or from the routing table.
 * `destinationAsset` is the one the quote or table request carried, for the provider's own
 * requests to carry too; absent where that request carried none.
 */
export type FiatQuoteHandoff = (
  | { provider: FiatProvider; response: FiatStepResponse }
  | { provider: FiatProvider; checkout: FiatHandoffCheckout }
) & { destinationAsset?: FiatDestinationAsset }

export interface UseFiatQuoteResult {
  /** Provider selected by the fresh response, absent while repricing. */
  provider?: FiatStepResponse['provider']
  /** The response handed off to a provider's own flow, held while the same request refetches. */
  handoff?: FiatQuoteHandoff
  /** The last quote remains available while its replacement loads. */
  quote?: Quote
  /** What the buyer may deposit at their current tier; absent until quoted. */
  limits?: QuoteLimits
  /** Only a fresh quote for the current inputs can be submitted. */
  isQuoteFresh: boolean
  isQuoting: boolean
  entryCta: EntryCta
  submitQuote: () => Promise<boolean | undefined>
  retryQuote: () => void
  /**
   * Forgets the price being shown, so the next ask fetches one. A quoteRef the
   * server has lost is still cached here, and still inside its stated
   * lifetime, so nothing else would go and get a live one.
   */
  dropQuote: () => void
  quoteError?: unknown
  /** Actionable lower bound returned when every applicable provider refuses the amount. */
  minimum?: FiatQuoteMinimum
  routeMinimum?: FiatQuoteMinimum
  /** The ceiling a refusal reported; this buyer's own, not the corridor's. */
  maximum?: FiatQuoteMaximum
  /** Why no provider would price these inputs, when the backend said. */
  noRoute?: FiatQuoteNoRoute
  /**
   * The routing table's first provider under `providerSelection`, for the
   * typed amount; known before any quote. None without a usable table.
   */
  tableProvider?: RoutingProvider
  /** The payment surface the fresh quote carries, when the backend prepared one. */
  preparedPayment?: PreparedPayment
  /**
   * The most this buyer can deposit now without another auth or KYC step, from the last routing
   * table fetched (`currentLimit` per provider), which may be past its deadline. Absent when no
   * provider states one.
   */
  lastKnownPracticalMaximum?: FiatQuoteMaximum
  /** The silent provider sign-in the fresh quote carries; only a session's first quote has one. */
  providerAuthToken?: FiatStepResponse['providerAuthToken']
  /**
   * The routing table predicts this buyer's next order has its fee reimbursed. Read
   * off the last table fetched, so it holds through sign-in and KYC; a priced
   * quote's own subsidy decides once one arrives. Absent means no.
   */
  feeSubsidized?: true
}

function toQuoteMinimum(
  known: RouteMinimum | undefined,
): FiatQuoteMinimum | undefined {
  if (known === undefined) {
    return undefined
  }
  return { amount: known.min, currency: known.currency }
}

/** Fetches and submits the quote shown on the amount screen. */
export function useFiatQuote({
  apiKey,
  userId = '',
  logger,
  flow,
  amount,
  currency,
  paymentMethod,
  cryptoCurrencyCode,
  chainId,
  geo,
  unstable_routingOverrides: routingOverrides,
  prepareSessionAuth = false,
  handoffs = NO_PROVIDERS,
  providerFlowExclusions = NO_PROVIDERS,
  preparePaymentSession = false,
  routingTableSessionId,
  getRoutingProviderInputs,
  providerSelection = NO_PROVIDER_SELECTION,
  intent,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseFiatQuoteParams): UseFiatQuoteResult {
  const queryClient = useQueryClient()
  // The flow's purchase, so every quote names the asset its order will, and the recipient too.
  const { destinationAsset, clientRecipient } = flow
  const tableSessionId =
    routingOverrides === undefined ? routingTableSessionId : undefined
  const routingTable = useFiatRoutingTable({
    apiKey,
    userId,
    logger,
    clientCapabilities: flow.clientCapabilities,
    identityAssertionProvider: flow.identityAssertionProvider,
    sessionId: tableSessionId,
    getRoutingProviderInputs,
    enabled,
    currency,
    paymentMethod,
    cryptoCurrencyCode,
    chainId,
    geo,
    destinationAsset,
    depositAddress: clientRecipient,
  })
  const routingMode = routingModeFor({
    isEnabled: tableSessionId !== undefined,
    tableError: routingTable.error,
    table: routingTable.table,
    paymentMethod,
  })
  const isRouted = routingMode.kind !== 'LEGACY'
  // A quoteRef is transaction state, so it cannot cross a visible flow boundary.
  const [mountIntent] = useState(() => quoteIntent('amount_changed'))
  const { scope, reason } = intent ?? mountIntent
  const { debounced: settledAmount, isSettled } = useDebouncedValue(
    amount,
    debounceMs,
  )
  const quoteAmount = toQuoteAmount(settledAmount)
  const hasSupportedChain = isSupportedQuoteChainId(chainId)
  const routeSelection = withFlowExclusions(
    providerSelection,
    providerFlowExclusions,
  )
  const providerRoute: ProviderRoute | undefined =
    routingMode.kind === 'TABLE'
      ? { intervals: routingMode.method.intervals, selection: routeSelection }
      : undefined
  const settledRoute = routeFor(providerRoute, quoteAmount)
  const routedInterval =
    settledRoute?.placement.kind === 'INSIDE'
      ? settledRoute.placement.interval
      : undefined
  const routedProviders =
    routedInterval === undefined ? undefined : settledRoute?.providers
  // Every provider of the interval is excluded: nothing is left to quote.
  const isIntervalExhausted = routedProviders?.length === 0
  // Exhaustion refreshes are once per route, so a changed region or asset refreshes again.
  const routeParts = [
    currency,
    paymentMethod,
    cryptoCurrencyCode,
    chainId,
    geo?.alpha2,
    geo?.region,
  ]
  const routedIntervalKey = JSON.stringify([
    ...routeParts,
    routedInterval?.min,
    routedInterval?.max,
    routedProviders,
  ])

  const queryKey = [
    ...QUOTE_QUERY_SCOPE,
    scope,
    apiKey,
    userId,
    quoteAmount ?? '',
    currency ?? '',
    paymentMethod,
    cryptoCurrencyCode,
    chainId,
    // Keyed as well as gated, so a location that lands after the amount was
    // typed re-quotes rather than leaving the first answer standing.
    geo?.alpha2 ?? '',
    geo?.region ?? '',
    prepareSessionAuth,
    preparePaymentSession,
    // A different provider set is a different price, so it re-quotes.
    routingOverridesKey(routingOverrides),
    // The same list in another order is the same request.
    [...handoffs].sort().join(','),
    [...providerFlowExclusions].sort().join(','),
    isRouted ? `routed:${routedProviders?.join(',') ?? ''}` : '',
    // A new table with a different read re-quotes, so the server gets the read it holds now.
    limitReadsKey(routedInterval, routedProviders),
    destinationAsset === undefined ? '' : JSON.stringify(destinationAsset),
    // Another wallet can price differently (conversions, fee subsidies), so it re-quotes.
    clientRecipient ?? '',
  ] as const
  // The key is rebuilt every render; its hash is the same while its parts are.
  const queryHash = hashKey(queryKey)
  // ENG-6302. A maximum belongs to the route, not to the amount, so once this
  // session has been told one there is nothing to ask about an amount over it:
  // the answer is already known and the screen can name it now rather than
  // after a round trip. The record only ever narrows within a session and is
  // dropped whenever something could have widened it, so this cannot hold a
  // buyer under a ceiling the server has since raised.
  const route: RouteIdentity = {
    apiKey,
    userId,
    currency,
    paymentMethod,
    cryptoCurrencyCode,
    chainId,
    geo,
    routingOverrides,
  }
  const knownLimits = readRouteLimits(queryClient, route)
  const isKnownAboveMaximum =
    knownLimits !== undefined &&
    knownLimits.currency === currency &&
    Number(settledAmount) > Number(knownLimits.max)
  const storedMinimum = readRouteMinimum(queryClient, route)
  const knownMinimum =
    storedMinimum !== undefined && storedMinimum.currency === currency
      ? storedMinimum
      : undefined
  const isKnownBelowMinimum =
    knownMinimum !== undefined &&
    Number(settledAmount) < Number(knownMinimum.min)
  // Read off the typed amount, unlike the fetch gate: the settled one trails a
  // tap on "Deposit Min" by the debounce, and would name a bound already met.
  const isEnteredBelowMinimum =
    knownMinimum !== undefined && Number(amount) < Number(knownMinimum.min)

  const exhaustedAmounts = useRef(new Set<string>())
  const exhaustedIntervals = useRef(new Set<string>())
  const unrouted = routingMode.kind === 'UNROUTED' ? routingMode : undefined
  const unavailableReason =
    unrouted?.reason === 'METHOD_UNAVAILABLE'
      ? getResponseErrorBody(unrouted.error)?.reason
      : undefined
  useLogOnce(
    typeof unavailableReason === 'string'
      ? `${unavailableReason}:${paymentMethod}`
      : undefined,
    () => {
      logger.info('connect-core:fiat:routing_method_unavailable', {
        reason: unavailableReason,
        paymentMethod,
      })
    },
  )

  // Everything but the amount's bounds that a quote request needs.
  const canQuote =
    enabled &&
    !flow.isInFlight &&
    isSettled &&
    quoteAmount !== undefined &&
    hasSupportedChain &&
    isQuotableGeo(geo) &&
    currency !== undefined
  // A single pinned provider needs no routing decision. Its registered checkout
  // owns /fiat/next, just as when the routing table selects it first.
  const pinnedProvider =
    routingOverrides?.providers?.length === 1
      ? routingOverrides.providers[0]
      : undefined
  // A routed quote that fell through to a provider whose own flow this client
  // runs hands off to it, as the table does when it names that provider first.
  const routedAmountKey = JSON.stringify([routedIntervalKey, quoteAmount])
  const [fellThroughTo, setFellThroughTo] = useState<{
    key: string
    provider: FiatProvider
  }>()
  const fallThroughHandoff =
    fellThroughTo?.key === routedAmountKey ? fellThroughTo.provider : undefined
  const firstRouted =
    fallThroughHandoff ?? routedProviders?.[0] ?? pinnedProvider
  const tableHandoffProvider =
    enabled &&
    firstRouted !== undefined &&
    handoffs.includes(firstRouted) &&
    statusOf(providerSelection, firstRouted) !== 'EXCLUDED' &&
    !providerFlowExclusions.includes(firstRouted) &&
    quoteAmount !== undefined &&
    !isKnownAboveMaximum &&
    !isKnownBelowMinimum &&
    hasSupportedChain &&
    isQuotableGeo(geo) &&
    currency !== undefined
      ? firstRouted
      : undefined
  const handoffSource =
    fallThroughHandoff !== undefined
      ? 'fallthrough_handoff'
      : routedProviders === undefined
        ? 'pinned_handoff'
        : 'table_handoff'
  const handoffSelection =
    tableHandoffProvider !== undefined && isSettled
      ? JSON.stringify([
          tableHandoffProvider,
          handoffSource,
          quoteAmount,
          currency,
          paymentMethod,
          cryptoCurrencyCode,
          chainId,
          geo,
        ])
      : undefined
  useLogOnce(handoffSelection, () => {
    logger.info('connect-core:fiat:routing_provider_chosen', {
      provider: tableHandoffProvider,
      source: handoffSource,
      amount: quoteAmount,
      currency,
      paymentMethod,
      cryptoCurrencyCode,
      chainId,
      geo,
    })
  })
  const tableHandoff = useMemo<FiatQuoteHandoff | undefined>(
    () =>
      tableHandoffProvider === undefined ||
      currency === undefined ||
      quoteAmount === undefined
        ? undefined
        : {
            provider: tableHandoffProvider,
            checkout: {
              amount: { currency, amount: quoteAmount },
              destination: { asset: cryptoCurrencyCode, network: chainId },
              paymentMethod,
            },
            ...(destinationAsset === undefined ? {} : { destinationAsset }),
          },
    [
      tableHandoffProvider,
      currency,
      quoteAmount,
      cryptoCurrencyCode,
      chainId,
      paymentMethod,
      destinationAsset,
    ],
  )
  const canFetch =
    canQuote &&
    tableHandoff === undefined &&
    (isRouted
      ? routedProviders !== undefined && !isIntervalExhausted
      : !isKnownAboveMaximum && !isKnownBelowMinimum)

  // The request goes out and the server refuses it — the buyer at least gets
  // an answer — but no geo provider naming a state for a US buyer is a gap in
  // the lookup, not something the buyer did.
  const isStatelessUs = isUnpriceableUsGeo(geo)
  useEffect(() => {
    if (!isStatelessUs) {
      return
    }
    logger.warn('connect-core:fiat:quote_geo_without_state', {
      alpha2: 'US',
    })
  }, [logger, isStatelessUs])

  // Written by each table that decides it, never fetched: `skipToken` needs react-query 5.25.
  const checkoutFeeSubsidyQueryKey = checkoutFeeSubsidyKey(
    routingTableSessionId,
  )
  const { data: checkoutFeeSubsidized } = useQuery({
    queryKey: checkoutFeeSubsidyQueryKey,
    queryFn: () =>
      queryClient.getQueryData<boolean>(checkoutFeeSubsidyQueryKey) ?? false,
    enabled: false,
  })

  const query = useQuery({
    queryKey,
    meta: { quoteAmount: quoteAmount ?? '' },
    queryFn: async ({ signal }) => {
      const request = { scope, amount: quoteAmount ?? '', hash: queryHash }
      logger.info('connect-core:fiat:quote_requested', {
        cause: quoteRequestCause(
          lastRequestOf(queryClient, scope),
          request,
          reason,
        ),
        paymentMethod,
      })
      try {
        if (quoteAmount === undefined) {
          throw new Error('Quote request has an invalid amount')
        }
        if (!isSupportedQuoteChainId(chainId)) {
          throw new Error('Quote request has an unsupported chain ID')
        }
        if (geo === undefined || !isQuotableGeo(geo)) {
          throw new Error('Quote request has no usable geo')
        }
        if (currency === undefined) {
          throw new Error('Quote request has no currency')
        }
        if (routedProviders !== undefined) {
          // Reads only from the table this interval came from, while it is still current: an
          // invalidated, expired or replaced table sends none. Asked per provider, as a fall-through can outlast it.
          const interval = routedInterval
          const capturedTable = routingTable.table
          return await quoteRouted({
            queryClient,
            providers: routedProviders,
            limitReadFor: (provider) =>
              interval === undefined ||
              capturedTable === undefined ||
              routingTable.currentTable() !== capturedTable
                ? undefined
                : limitReadOf(interval, provider),
            request: {
              fiatCurrency: currency,
              fiatAmount: quoteAmount,
              cryptoCurrencyCode,
              chainId,
              paymentMethodId: paymentMethod,
              geo: {
                alpha2: geo.alpha2,
                ...(geo.region === undefined ? {} : { region: geo.region }),
              },
              ...(prepareSessionAuth
                ? { prepareSessionAuth: true as const }
                : {}),
              ...(destinationAsset === undefined ? {} : { destinationAsset }),
              ...(clientRecipient === undefined
                ? {}
                : { depositAddress: clientRecipient }),
            },
            preparePaymentSession,
            apiKey,
            logger,
            signal,
            clientCapabilities: flow.clientCapabilities,
            identityAssertionProvider: flow.identityAssertionProvider,
            handoffs,
            onHandoff: (provider) =>
              setFellThroughTo({ key: routedAmountKey, provider }),
            // Every provider refusing suggests a stale table: refetch it once per amount
            // and once per interval as the table names it, since a table naming it again
            // would be refused again. A changed interval re-keys this query and re-quotes.
            onExhausted: async () => {
              const amountKey = JSON.stringify([...routeParts, quoteAmount])
              const isRefetched =
                exhaustedAmounts.current.has(amountKey) ||
                exhaustedIntervals.current.has(routedIntervalKey)
              exhaustedAmounts.current.add(amountKey)
              if (isRefetched) {
                logger.info('connect-core:fiat:routing_refresh_skipped', {
                  paymentMethod,
                })
                return
              }
              exhaustedIntervals.current.add(routedIntervalKey)
              await routingTable.refresh()
            },
          })
        }
        if (routingOverrides !== undefined) {
          // A provider decision made ahead of the backend's own; without this
          // a trace cannot tell a pinned run from ordinary routing.
          logger.info('connect-core:fiat:quote_routing_overridden', {
            providers: routingOverrides.providers,
          })
        }
        if (providerFlowExclusions.length > 0) {
          // A provider whose own flow left the route; without this a trace
          // cannot tell why it is missing from the requote.
          logger.info('connect-core:fiat:provider_flow_excluded', {
            providers: providerFlowExclusions,
          })
        }
        const response = await sendAuthedFiatTransition<FiatStepResponse>(
          {
            apiKey,
            logger,
            clientCapabilities: flow.clientCapabilities,
            signal,
            timeoutMs: QUOTE_TIMEOUT_MS,
            redactBodyForLog: fiatLogRedactor(logger),
            params: {
              endpoint: QUOTE_ENDPOINT,
              body: {
                fiatCurrency: currency,
                fiatAmount: quoteAmount,
                cryptoCurrencyCode,
                chainId,
                paymentMethodId: paymentMethod,
                geo: {
                  alpha2: geo.alpha2,
                  ...(geo.region === undefined ? {} : { region: geo.region }),
                },
                ...(routingOverrides === undefined ? {} : { routingOverrides }),
                ...(prepareSessionAuth
                  ? { prepareSessionAuth: true as const }
                  : {}),
                ...(destinationAsset === undefined ? {} : { destinationAsset }),
                ...(clientRecipient === undefined
                  ? {}
                  : { depositAddress: clientRecipient }),
                ...(handoffs.length === 0 ? {} : { handoffs }),
                ...(providerFlowExclusions.length === 0
                  ? {}
                  : { excludeProviders: providerFlowExclusions }),
              } satisfies QuoteRequest,
              idempotencyKey: randomUuid(),
            },
          },
          flow.identityAssertionProvider,
        )
        assertUsableStep(response, {
          currency,
          paymentMethod,
          cryptoCurrencyCode,
        })
        return response
      } catch (caught) {
        if (!signal.aborted && !(caught instanceof RoutedHandoff)) {
          const refusal = getResponseErrorBody(caught)
          logger.warn('connect-core:fiat:quote_failed', {
            paymentMethod,
            ...(routingOverrides === undefined
              ? {}
              : { providers: routingOverrides.providers }),
            cause: caught instanceof Error ? caught.message : String(caught),
            errorCode: refusal?.errorCode,
            reason:
              typeof refusal?.reason === 'string' ? refusal.reason : undefined,
          })
        }
        throw caught
      }
    },
    enabled: canFetch,
    placeholderData: keepPreviousData,
    retry: false,
    // Expiry stated in TanStack's own vocabulary: a quote is "stale" exactly
    // when it has run out, and the interval replaces it a buffer early.
    // Both are load-bearing. `staleTime` never fetches on its own — it only
    // gates the refetch triggers below. `refetchInterval` fetches but cannot
    // rescue a cached quote that is already expired when the screen mounts,
    // because an interval of `0` disables the timer outright.
    staleTime: (cached) => entryStaleTime(cached.state.data),
    refetchInterval: (cached) => {
      const remaining = remainingLifetime(cached.state.data)
      if (remaining === undefined) {
        return false
      }
      return remaining > 0 ? remaining : false
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
    // A backgrounded RN app never reports a focus change (`focusManager`
    // is not wired to `AppState`), so this would only ever fire on web.
    refetchOnWindowFocus: false,
  })

  // Every query option decides whether a fetch *starts*; none stop one that
  // is already running. Disabling does not unsubscribe the observer either,
  // so TanStack's cancel-on-last-unsubscribe never fires here. When the flow
  // takes over or the chain goes unsupported the key does not change at all,
  // so without this a request nobody wants runs to completion against the
  // payment API.
  useEffect(() => {
    if (canFetch) {
      return
    }
    void queryClient.cancelQueries({ queryKey, exact: true })
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [canFetch, queryClient, queryHash])

  const queryResponse = query.data

  // `isStale` rather than a `Date.now()` read: TanStack owns a timer for it
  // (`timeUntilStale`) and re-renders when it flips, so freshness is a value
  // this render is subscribed to instead of one it peeks at. Because
  // `staleTime` is the quote's remaining lifetime, stale means spent.
  // A round is usable the moment it lands and has nothing to expire, so
  // staleness — which here means "the quote has run out" — cannot judge it.
  const freshQueryResponse =
    isSettled &&
    !query.isFetching &&
    !query.isPlaceholderData &&
    (!query.isStale || isRound(queryResponse)) &&
    queryResponse !== undefined
      ? queryResponse
      : undefined
  const currentResponse = freshQueryResponse
  const displayedResponse = currentResponse ?? queryResponse
  const quote =
    displayedResponse?.state.kind === 'QUOTE'
      ? displayedResponse.state.quote
      : undefined
  const limits =
    displayedResponse?.state.kind === 'QUOTE'
      ? displayedResponse.state.limits
      : undefined
  const isQuoteFresh = enabled && currentResponse !== undefined
  const entryCta = selectEntryCta(currentResponse)
  const preparedPayment = preparedPaymentOf(currentResponse)
  // Held through a refetch or expiry of the same request: the provider's own
  // quote is the executable one, and dropping this unmounts its checkout.
  const handoffResponse =
    currentResponse ?? (query.isPlaceholderData ? undefined : queryResponse)
  // The query is keyed on `destinationAsset`, so the response's request carried the current one.
  const responseHandoff = useMemo(
    () => handoffOf(handoffResponse, destinationAsset),
    [handoffResponse, destinationAsset],
  )
  const handoff = tableHandoff ?? responseHandoff
  const providerAuthToken = currentResponse?.providerAuthToken

  // The whole reason UNRECOGNIZED is its own branch: a step this build does
  // not know still renders, so without this the backend moving ahead of us is
  // invisible until someone files a ticket. Keyed on the CTA's fields, since
  // `entryCta` is a new object every render.
  const unrecognizedCta =
    entryCta.kind === 'UNRECOGNIZED' ? entryCta.control.cta : undefined
  const unrecognizedId = unrecognizedCta?.id
  const unrecognizedEndpoint = unrecognizedCta?.endpoint
  useEffect(() => {
    if (unrecognizedId === undefined) {
      return
    }
    logger.warn('connect-core:fiat:unrecognized_entry_cta', {
      id: unrecognizedId,
      endpoint: unrecognizedEndpoint,
      paymentMethod,
    })
  }, [unrecognizedId, unrecognizedEndpoint, logger, paymentMethod])

  const submitQuote = useCallback(async () => {
    if (!isQuoteFresh || flow.isInFlight || currentResponse === undefined) {
      return
    }
    // The round is already in hand: entering it is handing it over, and there
    // is no request to send.
    const step = enteredStep(entryCta)
    if (step !== undefined) {
      logger.info('connect-core:fiat:entry_round_entered', {
        state: step.state.kind,
        paymentMethod,
      })
      flow.receive(step)
      return
    }
    // Only a price can go stale, and a session round carries none — read
    // strictly, `expiryTime` calls it expired and the button does nothing.
    if ('quote' in currentResponse.state && isExpired(currentResponse)) {
      return
    }
    const transition = submittableTransition(entryCta)
    if (transition === undefined) {
      return
    }
    logger.info('connect-core:fiat:entry_cta_fired', {
      kind: entryCta.kind,
      endpoint: transition.endpoint,
      paymentMethod,
    })
    return await flow.submitWithOutcome(transition)
  }, [currentResponse, entryCta, flow, isQuoteFresh, logger, paymentMethod])

  const dropQuote = useCallback(() => {
    queryClient.removeQueries({ queryKey, exact: true })
    // The key is what identifies the price to forget.
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [queryClient, queryHash])

  const unroutedReason = unrouted?.reason
  const retryQuote = useCallback(() => {
    // With no interval to quote, a retry asks the table again.
    if (unroutedReason === 'TABLE_FAILED') {
      routingTable.retry()
      return
    }
    if (unroutedReason === 'METHOD_UNAVAILABLE') {
      void routingTable.refresh()
      return
    }
    if (!canFetch) {
      return
    }
    void query.refetch()
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [
    canFetch,
    query.refetch,
    unroutedReason,
    routingTable.retry,
    routingTable.refresh,
  ])

  // Try again on an unrouted method refetches the table; it shows as quoting meanwhile.
  const isRefetchingUnrouted = unrouted !== undefined && routingTable.isFetching
  const isQuoting =
    enabled &&
    hasSupportedChain &&
    isQuotableAmount(amount) &&
    (!isSettled ||
      query.isFetching ||
      routingTable.isLoading ||
      isRefetchingUnrouted)
  // Shown where the quote's own refusal would be, once a quote would have been asked for.
  let quoteError: unknown
  if (unrouted !== undefined && canQuote) {
    quoteError = isRefetchingUnrouted ? undefined : unrouted.error
  } else if (isIntervalExhausted && canQuote) {
    quoteError = unroutedMethodRefusal(undefined)
  } else if (isSettled && !(query.error instanceof RoutedHandoff)) {
    quoteError = query.error ?? undefined
  }
  const refusedMinimum = quoteMinimumFromError(quoteError)
  // Read off the typed amount, as `isEnteredBelowMinimum` is.
  const typedRoute = routeFor(providerRoute, toQuoteAmount(amount))
  const tableBound = tableBoundFor(typedRoute, currency)
  const tableProvider = typedRoute?.providers[0]
  // The table's edge applies only below it, so it is already "entered below".
  const knownQuoteMinimum = isRouted
    ? tableBound.minimum
    : toQuoteMinimum(knownMinimum)
  const minimum =
    refusedMinimum ??
    (isRouted || isEnteredBelowMinimum ? knownQuoteMinimum : undefined)
  const routeMinimum =
    refusedMinimum?.currency === currency ? refusedMinimum : knownQuoteMinimum

  // A routed refusal is one provider's bound, not the route's.
  useEffect(() => {
    if (refusedMinimum === undefined || isRouted) {
      return
    }
    logger.info('connect-core:fiat:route_minimum_learned', {
      min: refusedMinimum.amount,
      currency: refusedMinimum.currency,
      requested: settledAmount,
      paymentMethod,
    })
    recordRouteMinimum(queryClient, route, {
      min: refusedMinimum.amount,
      currency: refusedMinimum.currency,
    })
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [
    queryClient,
    isRouted,
    refusedMinimum?.amount,
    refusedMinimum?.currency,
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
    ...routeLimitsKey(route),
  ])
  const refusedMaximum = quoteMaximumFromError(quoteError)
  const noRoute = quoteNoRouteFromError(quoteError)
  // The answer is the same whether the server just gave it or gave it earlier
  // in this session: this amount is over the route's maximum, and here is the
  // maximum. Without this the skipped request would take the bound notice and
  // the way back with it, which is the dead end the skip is meant to avoid.
  const maximum =
    refusedMaximum ??
    (isRouted ? tableBound.maximum : undefined) ??
    (!isRouted && isKnownAboveMaximum && knownLimits !== undefined
      ? { amount: knownLimits.max, currency: knownLimits.currency }
      : undefined)

  // Learned only from a refusal. A refusal's maximum is computed across every
  // candidate the route still had, so it describes the route. A priced quote's
  // `limits` is the committed provider's own range — `quoteLimitsFor` returns
  // that provider's ceiling, or the baseline, for the amount that selected it —
  // and the engine filters candidates by the requested amount before pricing.
  // Recording it here would let a provider chosen for a small amount suppress a
  // larger one another provider would have served.
  useEffect(() => {
    if (refusedMaximum === undefined || isRouted) {
      return
    }
    recordRouteLimits(queryClient, route, {
      max: refusedMaximum.amount,
      currency: refusedMaximum.currency,
    })
    // `route` is rebuilt every render; its own fields are the identity.
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
  }, [
    queryClient,
    isRouted,
    refusedMaximum?.amount,
    refusedMaximum?.currency,
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- TODO(review): suppressed when the rule was turned on
    ...routeLimitsKey(route),
  ])

  // Past the excluded providers: one the host turned off cannot serve the figure it states.
  const practicalMaximum = practicalMaximumOf(
    routingTable.lastFetchedTable,
    paymentMethod,
    excludedProvidersOf(routeSelection),
  )
  const lastKnownPracticalMaximum: FiatQuoteMaximum | undefined =
    isRouted && currency !== undefined && practicalMaximum !== undefined
      ? { amount: practicalMaximum, currency }
      : undefined

  return {
    provider: currentResponse?.provider,
    ...(handoff === undefined ? {} : { handoff }),
    ...(quote === undefined ? {} : { quote }),
    ...(limits === undefined ? {} : { limits }),
    isQuoteFresh,
    isQuoting,
    entryCta,
    submitQuote,
    retryQuote,
    dropQuote,
    ...(quoteError === undefined ? {} : { quoteError }),
    ...(minimum === undefined ? {} : { minimum }),
    ...(routeMinimum === undefined ? {} : { routeMinimum }),
    ...(maximum === undefined ? {} : { maximum }),
    ...(noRoute === undefined ? {} : { noRoute }),
    ...(tableProvider === undefined ? {} : { tableProvider }),
    ...(preparedPayment === undefined ? {} : { preparedPayment }),
    ...(lastKnownPracticalMaximum === undefined
      ? {}
      : { lastKnownPracticalMaximum }),
    ...(providerAuthToken === undefined ? {} : { providerAuthToken }),
    ...(checkoutFeeSubsidized === true ? { feeSubsidized: true as const } : {}),
  }
}

function limitReadsKey(
  interval: RoutingTableInterval | undefined,
  providers: readonly RoutingProvider[] | undefined,
): string {
  if (interval === undefined || providers === undefined) {
    return ''
  }
  return JSON.stringify(
    providers.map((provider) => limitReadOf(interval, provider) ?? null),
  )
}

/** Fields a routing quote sends only when it has them, and which a server older than them refuses. */
type OptionalQuoteFields = Pick<
  RoutingQuoteRequest,
  'providerInputs' | 'preparePaymentSession'
>
type OptionalQuoteField = keyof OptionalQuoteFields

/** A scope's last answered request, read off its cached quotes: a remount keeps it, eviction drops it. */
function lastRequestOf(
  queryClient: QueryClient,
  scope: string,
): FiatQuoteRequest | undefined {
  const answeredAt = (query: Query) =>
    Math.max(query.state.dataUpdatedAt, query.state.errorUpdatedAt)
  const [last] = queryClient
    .getQueryCache()
    .findAll({ queryKey: [...QUOTE_QUERY_SCOPE, scope] })
    .filter((query) => answeredAt(query) > 0)
    .sort((a, b) => answeredAt(b) - answeredAt(a))
  return last === undefined
    ? undefined
    : { scope, amount: String(last.meta?.quoteAmount), hash: last.queryHash }
}

/** How long a server's refusal of a field stops sending it, so an upgraded backend is picked up. */
const FIELD_REFUSAL_MS = 10 * 60_000

/** When each query client's server last refused each field; later quotes skip it until that lapses. */
const fieldsRefusedAt = new WeakMap<
  QueryClient,
  Map<OptionalQuoteField, number>
>()

function isFieldRefused(
  queryClient: QueryClient,
  field: OptionalQuoteField,
): boolean {
  const refusedAt = fieldsRefusedAt.get(queryClient)?.get(field)
  return refusedAt !== undefined && Date.now() - refusedAt < FIELD_REFUSAL_MS
}

function keepFields(
  fields: OptionalQuoteFields,
  keep: (field: OptionalQuoteField) => boolean,
): OptionalQuoteFields {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([field, value]) =>
        value !== undefined && keep(field as OptionalQuoteField),
    ),
  )
}

/**
 * The sent fields a strict contract parse named as unknown keys, as a server older than them does
 * (`Unrecognized key(s) in object: 'providerInputs'`). Empty for any other refusal.
 */
function refusedFieldsOf(
  error: unknown,
  sent: readonly OptionalQuoteField[],
): OptionalQuoteField[] {
  const body = getResponseErrorBody(error)
  if (
    body?.errorCode !== 'InvalidParameterError' ||
    !body.errorMsg.startsWith('Unrecognized key')
  ) {
    return []
  }
  const named = new Set(
    Array.from(body.errorMsg.matchAll(/['"]([^'"]+)['"]/g), ([, key]) => key),
  )
  return sent.filter((field) => named.has(field))
}

/**
 * Sends a routing quote with whichever of `fields` its server has not refused lately. A refusal
 * naming some of them resends once without just those, as can happen mid-deploy or after a rollback.
 */
async function sendWithOptionalFields({
  queryClient,
  fields,
  send,
  signal,
  logger,
  provider,
}: {
  queryClient: QueryClient
  fields: OptionalQuoteFields
  send: (fields: OptionalQuoteFields) => Promise<FiatStepResponse>
  signal: AbortSignal
  logger: FunLogger
  provider: RoutingProvider
}): Promise<FiatStepResponse> {
  const sent = keepFields(
    fields,
    (field) => !isFieldRefused(queryClient, field),
  )
  try {
    return await send(sent)
  } catch (error) {
    const refused = signal.aborted
      ? []
      : refusedFieldsOf(error, Object.keys(sent) as OptionalQuoteField[])
    if (refused.length === 0) {
      throw error
    }
    const refusedAt = fieldsRefusedAt.get(queryClient) ?? new Map()
    for (const field of refused) {
      refusedAt.set(field, Date.now())
    }
    fieldsRefusedAt.set(queryClient, refusedAt)
    logger.warn('connect-core:fiat:routing_quote_fields_refused', {
      provider,
      fields: refused,
    })
    return send(keepFields(sent, (field) => !refused.includes(field)))
  }
}

function handoffOf(
  response: FiatStepResponse | undefined,
  destinationAsset: FiatDestinationAsset | undefined,
): FiatQuoteHandoff | undefined {
  if (response === undefined || !('handoff' in response)) {
    return undefined
  }
  return response.handoff === undefined
    ? undefined
    : {
        provider: response.handoff.provider,
        response,
        ...(destinationAsset === undefined ? {} : { destinationAsset }),
      }
}

/** A provider whose own checkout exited is out of the route like any other exclusion. */
function withFlowExclusions(
  selection: ProviderSelection,
  exclusions: readonly FiatProvider[],
): ProviderSelection {
  if (exclusions.length === 0) {
    return selection
  }
  const merged: Partial<Record<FiatProvider, ProviderDisposition>> = {
    ...selection,
  }
  for (const provider of exclusions) {
    merged[provider] = { status: 'EXCLUDED', reason: 'provider_flow' }
  }
  return merged
}

/** The routed quote stopped at a provider the caller hands off to; the hook's handoff replaces it. */
class RoutedHandoff extends Error {
  constructor(readonly provider: FiatProvider) {
    super(`Routed quote handed off to ${provider}`)
  }
}

/**
 * TEMPORARY with {@link quoteThroughProviders}: the routed half of the quote,
 * failing over across the interval's providers until the backend does.
 */
async function quoteRouted({
  queryClient,
  providers,
  limitReadFor,
  request,
  preparePaymentSession,
  apiKey,
  logger,
  signal,
  clientCapabilities,
  identityAssertionProvider,
  handoffs,
  onHandoff,
  onExhausted,
}: {
  queryClient: QueryClient
  providers: readonly RoutingProvider[]
  limitReadFor: (provider: RoutingProvider) => OpaqueLimitRead | undefined
  request: Omit<RoutingQuoteRequest, 'provider' | OptionalQuoteField>
  preparePaymentSession: boolean
  apiKey: string
  logger: FunLogger
  signal: AbortSignal
  clientCapabilities: readonly FiatClientCapability[]
  identityAssertionProvider: IdentityAssertionProvider | undefined
  /** Providers whose own flow the caller runs: one reached by falling through is handed off, not quoted. */
  handoffs: readonly FiatProvider[]
  onHandoff: (provider: FiatProvider) => void
  onExhausted: () => Promise<void>
}): Promise<FiatStepResponse> {
  const paymentMethod = request.paymentMethodId
  const quote = async (provider: RoutingProvider, attempt: number) => {
    const handoff = handoffs.find((candidate) => candidate === provider)
    if (attempt > 0 && handoff !== undefined) {
      onHandoff(handoff)
      throw new RoutedHandoff(handoff)
    }
    logger.info('connect-core:fiat:routing_provider_chosen', {
      provider,
      attempt,
      paymentMethod,
    })
    // The server refuses any other provider's inputs outright, not as an unknown key it can drop.
    const limitRead = provider === 'STRIPE' ? limitReadFor(provider) : undefined
    const response = await sendWithOptionalFields({
      queryClient,
      fields: {
        providerInputs:
          limitRead === undefined ? undefined : { STRIPE: { limitRead } },
        preparePaymentSession:
          preparePaymentSession &&
          preparesPaymentSession(provider, paymentMethod)
            ? true
            : undefined,
      },
      send: (fields) =>
        sendAuthedFiatTransition<FiatStepResponse>(
          {
            apiKey,
            logger,
            clientCapabilities,
            signal,
            timeoutMs: QUOTE_TIMEOUT_MS,
            redactBodyForLog: fiatLogRedactor(logger),
            params: {
              endpoint: ROUTING_QUOTE_ENDPOINT,
              body: {
                ...request,
                provider,
                ...fields,
              } satisfies RoutingQuoteRequest,
              idempotencyKey: randomUuid(),
            },
          },
          identityAssertionProvider,
        ),
      signal,
      logger,
      provider,
    })
    assertUsableStep(response, {
      currency: request.fiatCurrency,
      paymentMethod,
      cryptoCurrencyCode: request.cryptoCurrencyCode,
    })
    return response
  }
  try {
    return await quoteThroughProviders(
      providers,
      quote,
      (from, to, refused) => {
        const refusal = getResponseErrorBody(refused)
        logger.info('connect-core:fiat:routing_fall_through', {
          from,
          to,
          paymentMethod,
          errorCode: refusal?.errorCode,
          reason:
            typeof refusal?.reason === 'string' ? refusal.reason : undefined,
        })
      },
    )
  } catch (refused) {
    if (!signal.aborted && isFallThroughRefusal(refused)) {
      logger.info('connect-core:fiat:routing_interval_exhausted', {
        providers,
        paymentMethod,
      })
      await onExhausted()
    }
    throw refused
  }
}

/** Coinbase and Stripe on Apple Pay open a payment session the app prepares. */
function preparesPaymentSession(
  provider: RoutingProvider,
  paymentMethod: string,
): boolean {
  return (
    (provider === 'COINBASE' || provider === 'STRIPE') &&
    paymentMethod === PaymentMethod.APPLE_PAY
  )
}

function routeFor(
  route: ProviderRoute | undefined,
  amount: string | undefined,
): AmountRoute | undefined {
  if (route === undefined || amount === undefined) {
    return undefined
  }
  return routeAmount(route, amount)
}

/**
 * An amount outside the table's intervals shows the nearest edge, as a
 * refusal's bound would. In a gap between two intervals the way out is up: the
 * upper interval's minimum is the minimum, and the lower one's maximum is not
 * named. (`POST /fiat/quote` answers such an amount as below that minimum.)
 * An interval every exclusion has emptied is a gap too: without the next
 * served interval's minimum, a buyer moved off the only provider at their
 * amount would be left on "not available" with no way on.
 */
function tableBoundFor(
  route: AmountRoute | undefined,
  currency: string | undefined,
): { minimum?: FiatQuoteMinimum; maximum?: FiatQuoteMaximum } {
  if (currency === undefined || route === undefined) {
    return {}
  }
  const { placement } = route
  if (placement.kind === 'INSIDE') {
    return route.nextMinimum === undefined
      ? {}
      : { minimum: { amount: route.nextMinimum, currency } }
  }
  if (placement.kind === 'BELOW') {
    return { minimum: { amount: placement.min, currency } }
  }
  if (placement.kind === 'ABOVE') {
    return { maximum: { amount: placement.max, currency } }
  }
  return { minimum: { amount: placement.min, currency } }
}

/**
 * A round the endpoint answers with in place of a price — Banxa holds the
 * deposit on identity before it will quote at all. It is the flow's from here
 * on, so the request checks below do not apply to it — but the quote it
 * carries expires like any other, which is why `expiryTime` still reads one.
 */
function isRound(response: FiatStepResponse | undefined): boolean {
  return response !== undefined && response.state.kind !== 'QUOTE'
}

/** A quote-less round has no price to expire while its inputs are collected. */
function entryStaleTime(response: FiatStepResponse | undefined): number {
  return remainingLifetime(response) ?? (isRound(response) ? Infinity : 0)
}

/**
 * A quote has to answer the request that asked for it. A round answers no
 * request and is checked by nothing here — the flow owns it from here on.
 */
function assertUsableStep(
  response: FiatStepResponse,
  request: {
    currency: string
    paymentMethod: string
    cryptoCurrencyCode: string
  },
): void {
  if (response.state.kind !== 'QUOTE') {
    return
  }
  const { quote } = response.state
  if (
    quote.fiat.currency !== request.currency ||
    quote.paymentMethod !== request.paymentMethod ||
    quote.crypto.currency !== request.cryptoCurrencyCode
  ) {
    throw new Error('Quote response does not match the request')
  }
  if (isExpired(response)) {
    throw new Error('Quote response is already expired')
  }
}

/**
 * How long a response stays usable, less the head start. `undefined` when it
 * carries no usable expiry at all, which each caller reads differently.
 */
function remainingLifetime(
  response: FiatStepResponse | undefined,
): number | undefined {
  if (response === undefined) {
    return undefined
  }
  const expiresAt = expiryTime(response)
  if (expiresAt === undefined) {
    return undefined
  }
  const lifetime = expiresAt - Date.now()
  if (lifetime <= 0) {
    return 0
  }
  // A head start longer than the quote itself would pin this to zero, which
  // disables the refetch timer outright — so short-lived quotes get a
  // proportional one and still refresh ahead of expiry.
  const headStart = Math.min(QUOTE_REFRESH_BUFFER_MS, lifetime / 2)
  return lifetime - headStart
}

/**
 * Reads the clock, so it belongs only at a decision point — submitting, or
 * accepting a fetched response. Renders subscribe to `isStale` instead; a
 * subscription cannot help a tap landing in the same tick as expiry, which
 * is the gap this closes.
 */
function isExpired(response: FiatStepResponse): boolean {
  const expiresAt = expiryTime(response)
  return expiresAt === undefined || expiresAt <= Date.now()
}

function expiryTime(response: FiatStepResponse): number | undefined {
  // A KYC state may be returned before a provider can produce a quote. When
  // it does carry one, the round expires with the price behind it.
  const state = response.state
  const quoteExpiryValue = 'quote' in state ? state.quote?.expiresAt : undefined
  if (quoteExpiryValue === undefined) {
    return undefined
  }
  const quoteExpiry = Date.parse(quoteExpiryValue)
  if (!Number.isFinite(quoteExpiry)) {
    return undefined
  }
  const surfaceExpiryValue =
    'surface' in state ? state.surface?.expiresAt : undefined
  if (surfaceExpiryValue === undefined) {
    return quoteExpiry
  }
  const surfaceExpiry = Date.parse(surfaceExpiryValue)
  return Number.isFinite(surfaceExpiry)
    ? Math.min(quoteExpiry, surfaceExpiry)
    : undefined
}
