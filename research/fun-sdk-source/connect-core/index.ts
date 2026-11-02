// @funkit/connect-core
//
// Headless, platform-agnostic business logic shared by @funkit/connect (web)
// and @funkit/connect-rn (React Native): domains, utils, hooks, Statsig
// wrappers, theme factories, and the FunLogger class.
//
// INVARIANT: no DOM, vanilla-extract, or wagmi imports anywhere under src/**.
// See ../connect-rn/README.md for the core/web/RN architecture.
//
// PUBLIC API: this is an explicit, curated export list (not `export *`) — the
// package's consumers are its sibling packages @funkit/connect and
// @funkit/connect-rn, and this surface is exactly what they import. Adding a
// symbol here is a deliberate, reviewable widening of the public API; a new
// `export` inside a module no longer leaks out automatically.

export { default as defaultDynamicConfigs } from './src/__generated__/default_configs'
export { default as defaultFeatureGates } from './src/__generated__/default_feature_gates'
export {
  DEFAULT_NOTIF_CUTOFF,
  depositStatus,
  getUpdatedCheckouts,
  getUpdatedDirectExecutions,
  isBitcoinLightningDirectExecution,
  isTokenTransferDirectExecution,
  isWithdrawalDirectExecution,
  mergeMultiStepDirectExecutions,
  processRecentDepositsForNotifications,
} from './src/domains/checkoutNotifications'
export type {
  DepositStatus,
  MergedMultiStepDirectExecution,
  NotificationVariant,
} from './src/domains/checkoutNotifications'
export {
  MAX_BTC_LIGHTNING_AMOUNT_USD,
  MELD_MIN_LIMIT_BUFFER,
  convertUsdAmount,
  getCheckoutAmountLimitsUsd,
  getConfiguredMinDepositUsd,
  getMeldMinDepositInCurrency,
  getMinTransferValueEur,
  getMinTransferValueUsd,
  validateWithdrawalAmount,
} from './src/domains/amountLimits'
export type {
  CheckoutAmountLimitsUsd,
  MinDepositTarget,
  WithdrawalAmountValidation,
} from './src/domains/amountLimits'
export {
  effectiveDepositTarget,
  getCheckoutTokenTransferParams,
  getMinTransferValueForChain,
} from './src/domains/checkoutTransfer'
export type {
  CheckoutTokenTransferConfig,
  DepositTarget,
  MinTransferConfig,
  UDAConfig,
} from './src/domains/checkoutTransfer'
export {
  assetChains,
  assetId,
  depositAddressesEqual,
  depositAssets,
  depositChainsForToken,
  depositTokenOnChain,
  pickerChainForToken,
  pickerChainsForToken,
  resolveDefaultTransferSelection,
  resolveDepositSelection,
  selectDepositToken,
  tokenOnChain,
} from './src/domains/depositSelection'
export type {
  DefaultTransferSelection,
  DefaultTransferSelectionSource,
  DepositAsset,
  DepositAssetExclusion,
  DepositChain,
  DepositSourceToken,
  PickerToken,
  ResolvedDepositSelection,
  SupportedDepositToken,
} from './src/domains/depositSelection'
export type {
  AssetClass,
  DynamicTargetAssetCandidate,
  TokenInfo,
} from './src/domains/dynamicTargetAsset'
export {
  CryptoWithdrawalError,
  createWithdrawalSubmissionId,
  processCryptoWithdrawalOrder,
} from './src/domains/cryptoWithdrawal'
export type {
  CryptoWithdrawalErrorCode,
  CryptoWithdrawalOrder,
  CryptoWithdrawalSourceToken,
  CryptoWithdrawalToken,
  ProcessCryptoWithdrawalOrderParams,
} from './src/domains/cryptoWithdrawal'
export { PaymentMethod } from './src/domains/paymentMethods'
export {
  extractRelayFeeInfo,
  extractRelayReceiveAmount,
  fetchExactInQuote,
  toClientMetadataQuote,
} from './src/domains/quote'
export type { ExactInQuoteParams } from './src/domains/quote'
export type {
  FailureReason,
  DestinationAsset as FiatDestinationAsset,
  FiatProvider,
  FiatSession,
  FiatStepResponse,
  FlowState,
  FunAuthErrorCode,
  FormDescriptor,
  FormField,
  JsonValue,
  KYCProvider,
  KycFieldId,
  KycSdkResultReport,
  OrderStatus,
  PreparedPayment,
  Quote,
  SelectOption,
  Surface,
  Transition,
} from '@fun-xyz/fiat-contract/types'
export type {
  TermsDocument,
  TermsDocumentAcceptance,
  TermsStage,
} from '@fun-xyz/fiat-contract/terms'
export {
  NO_CLIENT_CAPABILITIES,
  sendAuthedFiatTransition,
} from './src/domains/fiat/authedTransport'
export {
  createIdentityAssertionProvider,
  decodeJwtClaims,
} from './src/domains/fiat/identityAssertion'
export type {
  GetIdentityAssertion,
  IdentityAssertionProvider,
} from './src/domains/fiat/identityAssertion'
export {
  enteredStep,
  isEntryOwnedState,
  rendersOwnControl,
  selectEntryCta,
  shouldRenderCta,
  submittableTransition,
  surfaceControl,
} from './src/domains/fiat/entryCta'
export type {
  EnterControl,
  EntryControl,
  EntryCta,
  SubmitControl,
  SurfaceControl,
} from './src/domains/fiat/entryCta'
export {
  FUN_AUTH_REFRESH_ENDPOINT,
  FUN_AUTH_REVOKE_ENDPOINT,
  FUN_AUTH_START_ENDPOINT,
  FUN_AUTH_START_ID,
  FUN_AUTH_VERIFY_ENDPOINT,
  isFunAuthState,
  sessionOf,
} from './src/domains/fiat/funAuth'
export type { FunAuthState } from './src/domains/fiat/funAuth'
export {
  createFunSessionStore,
  funSessionStorageKey,
} from './src/domains/fiat/funSession'
export type {
  CreateFunSessionStoreParams,
  FunSessionClearReason,
  FunSessionEvent,
  FunSessionStorage,
  FunSessionStore,
} from './src/domains/fiat/funSession'
export { selectKycOutcome } from './src/domains/fiat/kycOutcome'
export type { KycOutcome, KycResolution } from './src/domains/fiat/kycOutcome'
export {
  KYC_SDK_TOKEN_ENDPOINT,
  renewCaptureSurface,
} from './src/domains/fiat/kycSdkToken'
export type { RenewCaptureSurfaceParams } from './src/domains/fiat/kycSdkToken'
export {
  TERMS_ACCEPTANCE_ENDPOINT,
  recordTermsAcceptance,
} from './src/domains/fiat/recordTermsAcceptance'
export type { RecordTermsAcceptanceParams } from './src/domains/fiat/recordTermsAcceptance'
export {
  KYC_SDK_USER_CANCELLED,
  kycSdkCompleted,
  kycSdkFailed,
} from './src/domains/fiat/kycSdkResult'
export { recordKycSdkFailure } from './src/domains/fiat/recordKycSdkFailure'
export type { RecordKycSdkFailureParams } from './src/domains/fiat/recordKycSdkFailure'
export { requestCheckoutClientSecret } from './src/domains/fiat/stripeCheckout'
export type { CheckoutClientSecretParams } from './src/domains/fiat/stripeCheckout'
export {
  canSubmitForm,
  formValuesInput,
  isValueField,
  requiresUnanswerableField,
  validateForm,
} from './src/domains/fiat/formValues'
export type { FormFieldIssue, FormValues } from './src/domains/fiat/formValues'
export { resolveFiatRegionSupport } from './src/domains/fiat/regionPolicy'
export type {
  FiatRegionGeo,
  FiatRegionPolicy,
  FiatRegionVerdict,
} from './src/domains/fiat/regionPolicy'
export {
  fiatDeliveryKindOf,
  fiatDestinationAssetOf,
  isDirectFiatDelivery,
} from './src/domains/fiat/directDelivery'
export type { FiatAssetRef } from './src/domains/fiat/directDelivery'
export { offersDeliveryTransition } from './src/domains/fiat/deliveryTransition'
export {
  isQuotableAmount,
  isStaleQuoteFailure,
  PAYMENT_SESSION_ENDPOINT,
  QUOTE_ENDPOINT,
  sameAmount,
} from './src/domains/fiat/quoteRequest'
export type {
  FiatQuoteMaximum,
  FiatQuoteMinimum,
  FiatRoutingOverrides,
  QuoteGeo,
  QuoteRequest,
} from './src/domains/fiat/quoteRequest'
export { quoteNoRouteFromError } from './src/domains/fiat/quoteNoRoute'
export type {
  FiatQuoteNoRoute,
  FiatQuoteNoRouteKind,
} from './src/domains/fiat/quoteNoRoute'
export {
  forgetRouteLimits,
  recordRouteLimits,
  ROUTE_LIMITS_SCOPE,
  routeLimitsKey,
} from './src/domains/fiat/routeLimits'
export type { RouteIdentity, RouteLimits } from './src/domains/fiat/routeLimits'
export { preparedPaymentOf } from './src/domains/fiat/preparedPayment'
export {
  forgetRoutingTable,
  refreshRoutingTable,
} from './src/domains/fiat/routingTable'
export type {
  ProviderDisposition,
  ProviderSelection,
  ProviderStatus,
  RoutingTableProviderInputs,
} from './src/domains/fiat/routingTable'
export { statusOf, toCents } from './src/domains/fiat/routingTable'
export {
  acceptedTerms,
  termsToAccept,
} from './src/domains/fiat/termsAcceptance'
export type { TermsToAccept } from './src/domains/fiat/termsAcceptance'
export {
  MOONPAY_SHARING_CONSENT_VERSION,
  sharingConsentOf,
} from './src/domains/fiat/sharingConsent'
export type { SharingConsent } from './src/domains/fiat/sharingConsent'
export type {
  SessionTape,
  TapeEnding,
  TapeResponse,
} from './src/domains/fiat/sessionTape'
export type {
  AwaitTransition,
  SubmitTransition,
  SurfaceTransition,
} from './src/domains/fiat/selectTransitions'
export type {
  CollectedInputs,
  SurfaceResult,
} from './src/domains/fiat/submitBody'
export {
  FiatRouteError,
  parseRouteFault,
  sendFiatRoute,
} from './src/domains/fiat/fiatRoute'
export type {
  FiatRouteContext,
  FiatRouteFault,
  FiatRouteRecovery,
} from './src/domains/fiat/fiatRoute'
export { localizedTerms, termsAcceptances } from './src/domains/fiat/terms'
export {
  MOONPAY_NEXT_EVENT,
  moonPayFault,
  sendMoonPayNext,
} from './src/domains/fiat/providers/moonpay/api'
export type {
  MoonPayNextRequestOf,
  MoonPayRequestAction,
} from './src/domains/fiat/providers/moonpay/api'
export {
  consentShown,
  isKnownMoonPayNext,
  MOONPAY_MAX_ORDER_POLLS,
  MOONPAY_ORDER_POLL_MS,
  moonPayCheckoutReducer,
  moonPayCheckoutStart,
  moonPayObserveCall,
  moonPayReadsOrderAgain,
  moonPayStage,
  reaskReason,
  wantedQuoteInput,
} from './src/domains/fiat/providers/moonpay/checkout'
export type {
  MoonPayAnswer,
  MoonPayCall,
  MoonPayChargedOrder,
  MoonPayCheckoutEvent,
  MoonPayCheckoutExit,
  MoonPayCheckoutState,
  MoonPayConsentKind,
  MoonPayRecipientTerms,
  MoonPayStage,
} from './src/domains/fiat/providers/moonpay/checkout'
export {
  revealGate,
  sameQuoteInput,
} from './src/domains/fiat/providers/moonpay/revealGate'
export type {
  MoonPayDeviceQuote,
  PricedDeviceQuote,
} from './src/domains/fiat/providers/moonpay/revealGate'
export type {
  MoonPayCaptureNextAction,
  MoonPayCheckout,
  MoonPayErrorBody,
  MoonPayFaultReason,
  MoonPayFieldError,
  MoonPayKycNextAction,
  MoonPayNextRequest,
  MoonPayOrderNextAction,
  MoonPayOrderRefusal,
  MoonPayQuoteInput,
  MoonPayReask,
  MoonPayReaskReason,
  MoonPayReaskRequirement,
  MoonPaySdkCredentials,
  MoonPayStepRefusal,
  MoonPayStepResponse,
} from '@fun-xyz/fiat-contract/moonpay'
export {
  COINBASE_NEXT_EVENT,
  coinbaseFault,
  sendCoinbaseNext,
} from './src/domains/fiat/providers/coinbase/api'
export type {
  CoinbaseNextRequestOf,
  CoinbaseRequestAction,
} from './src/domains/fiat/providers/coinbase/api'
export {
  COINBASE_MAX_ORDER_POLLS,
  coinbaseCheckoutReducer,
  coinbaseCheckoutStart,
  coinbaseOrderReadDelayMs,
  coinbaseConsentShown,
  coinbasePaysAgainOnTap,
  coinbaseReadsOrderAgain,
  coinbaseStage,
  isKnownCoinbaseNext,
} from './src/domains/fiat/providers/coinbase/checkout'
export type {
  CoinbaseAnswer,
  CoinbaseCall,
  CoinbaseCheckoutEvent,
  CoinbaseCheckoutExit,
  CoinbaseCheckoutState,
  CoinbaseConsentKind,
  CoinbaseStage,
} from './src/domains/fiat/providers/coinbase/checkout'
export type {
  CoinbaseCheckout,
  CoinbaseErrorBody,
  CoinbaseFaultReason,
  CoinbaseKycNextAction,
  CoinbaseNextRequest,
  CoinbaseOtpNextAction,
  CoinbasePayNextAction,
  CoinbasePrice,
  CoinbaseStepRefusal,
  CoinbaseStepResponse,
} from '@fun-xyz/fiat-contract/coinbase'
export type {
  FiatTermsErrorBody,
  FiatTermsRequest,
  FunKycConsentLocale,
} from '@fun-xyz/fiat-contract/terms'
export {
  FUN_KYC_CONSENT_DOCUMENTS,
  PROVIDER_CHECKOUT_DOCUMENTS,
  PROVIDER_KYC_DOCUMENTS,
} from '@fun-xyz/fiat-contract/terms'
export { quoteIntent } from './src/domains/fiat/quoteIntent'
export type {
  FiatQuoteIntent,
  FiatQuoteReason,
} from './src/domains/fiat/quoteIntent'
export { useFiatQuote } from './src/hooks/fiat/useFiatQuote'
export type {
  FiatHandoffCheckout,
  FiatQuoteHandoff,
  UseFiatQuoteParams,
  UseFiatQuoteResult,
} from './src/hooks/fiat/useFiatQuote'
export { useFiatTransitions } from './src/hooks/fiat/useFiatTransitions'
export { useFunSessionBearer } from './src/hooks/fiat/useFunSessionBearer'
export type {
  FiatFlow,
  FiatIdentityAssertion,
  UseFiatTransitionsParams,
} from './src/hooks/fiat/useFiatTransitions'
// Named in this package's own signatures (the quote a withdrawal executes), so
// consumers can hold one without depending on @funkit/utils directly.
export type { CheckoutQuoteResponse } from '@funkit/utils'
export {
  FOPS_STALE_TIME,
  buildSwappedThirdPartyPaymentConfigs,
  getFopsLimit,
  getSwappedBuyingCrypto,
  getSwappedDefaultInputAmount,
  toSwappedBuyingCryptoTicker,
  getWithdrawalFopsDisclaimerLimit,
  roundFopsLimit,
  sortFops,
} from './src/domains/swapped'
export type {
  SwappedDefaultInputAmountConfig,
  SwappedThirdPartyPaymentConfigsParams,
} from './src/domains/swapped'
export {
  FiatWithdrawalError,
  SWAPPED_MIN_SELL_EUR,
  buildSwappedSellLimits,
  findSwappedSourceOverride,
  getSwappedCashMinUsd,
  getSwappedSellCapEur,
  isValidOrderData,
  processFiatWithdrawalOrder,
  resolveSwappedWithdrawalLegs,
  toFiatWithdrawalOrder,
  toWithdrawalAmountBaseUnit,
} from './src/domains/swappedWithdrawal'
export type {
  FiatWithdrawalErrorCode,
  FiatWithdrawalOrder,
  ProcessFiatWithdrawalOrderParams,
  SwappedSellLimits,
  SwappedSourceRouteOverride,
  SwappedWithdrawalLegs,
  SwappedWithdrawalSourceToken,
  SwappedWithdrawalTargetToken,
} from './src/domains/swappedWithdrawal'
export { BLOCKED_RISK_LEVELS, screenAddressesForRisk } from './src/domains/risk'
export type { AddressRiskScreening } from './src/domains/risk'
export {
  isBlacklistedWithdrawalAddress,
  isWithdrawalRisky,
} from './src/domains/withdrawalRisk'
export {
  createSyntheticFop,
  getFopKey,
  isSwappedFop,
  isSyntheticFop,
} from './src/domains/syntheticFop'
export {
  ensureOnSourceChain,
  ensureRelayClientInitialized,
  toRelayWallet,
} from './src/domains/withdrawal'
export {
  type WalletExecutionErrorCode,
  toWalletExecutionErrorCode,
} from './src/domains/walletError'
export type {
  ListFormOfPayment,
  SyntheticFormOfPayment,
} from './src/domains/syntheticFop'
export {
  isAssetDisabled,
  isChainDisabled,
  resolveTokenTransferConfig,
} from './src/domains/tokenTransferConfig'
export type {
  DisabledChainsAndAssets,
  ResolvedAssetInfo,
  TokenTransferAssetConfig,
  TokenTransferChainConfig,
  TokenTransferConfigResult,
} from './src/domains/tokenTransferConfig'
export {
  getLighterAccount,
  useInvalidateLighterAccount,
  useLighterAccountQuery,
} from './src/hooks/queries/useLighterAccountQuery'
export type {
  LighterAccount,
  LighterAccountLookup,
  LighterAccountSelector,
  LighterAccountResponse,
  LighterAsset,
  LighterPoolInfo,
  LighterShare,
} from './src/hooks/queries/useLighterAccountQuery'
export {
  LIGHTER_TRADING_MODE,
  getLighterAccountsByL1Address,
  useLighterAccountsQuery,
} from './src/hooks/queries/useLighterAccountsQuery'
export type {
  LighterAccountsByL1AddressResponse,
  LighterSubAccount,
} from './src/hooks/queries/useLighterAccountsQuery'
export { useDirectExecutionForDepositAddress } from './src/hooks/queries/useDirectExecutionForDepositAddress'
export type {
  DepositAddressArrival,
  DirectExecutionForDepositAddressParams,
} from './src/hooks/queries/useDirectExecutionForDepositAddress'
export { useRecentCheckoutsQuery } from './src/hooks/queries/useRecentCheckoutsQuery'
export { useRecentDepositsApiQuery } from './src/hooks/queries/useRecentDepositsApiQuery'
export type { RecentDepositsApiQueryParams } from './src/hooks/queries/useRecentDepositsApiQuery'
export {
  DEFAULT_FIAT_CURRENCY,
  useSwappedDefaultCurrencyQuery,
} from './src/hooks/queries/useSwappedDefaultCurrencyQuery'
export {
  useDynamicConfig,
  useExperiment,
  useExperimentV2,
  useFeatureGate,
} from './src/hooks/statsig'
export type { DynamicConfigName, DynamicConfigValue } from './src/hooks/statsig'
export {
  FunWhnStatsigContext,
  useFunWhnStatsigClientValue,
  useFunWhnStatsigContext,
} from './src/contexts/FunWhnStatsigContext'
export type { FunWhnStatsigContextValue } from './src/contexts/FunWhnStatsigContext'
export { useDebouncedValue } from './src/hooks/useDebouncedValue'
export { useEffectEvent } from './src/hooks/useEffectEvent'
export { useLogOnce } from './src/hooks/useLogOnce'
export { useSwappedSession } from './src/hooks/useSwappedSession'
export { useUserIpInfo } from './src/hooks/useUserIpInfo'
export type {
  FunkitUserIpInfo,
  UseUserIpInfoParams,
  UseUserIpInfoResult,
} from './src/hooks/useUserIpInfo'
export type {
  FiatDeliveryKind,
  LogContext,
  LogRecord,
  LogTransport,
  TrackingConsent,
} from './src/interfaces/logTransport'
export type {
  SwappedInboundMessage,
  SwappedOutboundMessage,
  SwappedSellOrderData,
  SwappedTransport,
} from './src/interfaces/swappedTransport'
export type {
  WithdrawalClient,
  WithdrawalTransaction,
  WithdrawalTypedData,
} from './src/interfaces/withdrawalClient'
export {
  getWalletLabel,
  isAddressCompatibleWithChain,
  isEvmChainId,
  isWithdrawalAddressSupported,
  normalizeRecipientAddress,
  toValidatedSolanaAddress,
} from './src/utils/address'
export { getAssetPriceInfoWithFallback } from './src/utils/assetPrice'
export {
  SDK_CDN_IMAGES_URL,
  getChainIconUrl,
  toChainCdnKey,
} from './src/utils/chainIconUrl'
export {
  isCheckoutHistoryDirectExecution,
  isCheckoutValid,
  toMergedCheckoutHistoryItem,
} from './src/utils/checkout'
export type { MergedCheckoutHistoryItem } from './src/utils/checkout'
export {
  disableAtomicBatchIfSupported,
  findDirectExecutionForDepositAddress,
  getCompletionTxInfo,
  resolveOnChainCompletionTxHash,
  getDirectExecutionCreatedTimeMs,
  getDirectExecutionNotificationKey,
  getDirectExecutionRunTimeSeconds,
  getDirectExecutionUpdatedTimeMs,
  isDirectExecutionNotFound,
} from './src/utils/directExecution'
export { FunLogger } from './src/utils/funLogger'
export { HostTimeoutError, withHostTimeout } from './src/utils/hostTimeout'
export { STATSIG_NETWORK_TIMEOUT_MS } from './src/utils/statsig'
export {
  buildDatadogProxyUrl,
  createDatadogRouter,
  DATADOG_PROXY_SITE,
} from './src/utils/datadogRouting'
export type {
  DatadogRouteDecision,
  DatadogRouter,
} from './src/utils/datadogRouting'
export { getExchangeRate } from './src/utils/getExchangeRate'
export { getPublicClientFor } from './src/utils/publicClient'
export { purifyCheckoutHistoryItem } from './src/utils/purifyCheckoutHistoryItem'
export { randomUuid } from './src/utils/randomUuid'
export type { PurifiedCheckoutHistoryItem } from './src/utils/purifyCheckoutHistoryItem'
export {
  isTerminalRelayStatus,
  mapRelayExecutionStatusToCheckoutState,
} from './src/utils/relayStatus'
export { parseBigInt } from './src/utils/parseBigInt'
export { safeBigInt } from './src/utils/safeBigInt'
export { isSwitchChainError, isUserRejectedError } from './src/utils/signature'
export { toStatsigMetadata } from './src/utils/statsig/analytics'
// Re-exported so connect-rn need not depend on @funkit/utils directly.
export { isAddressEquivalent, isTokenEquivalent } from '@funkit/utils'
export {
  SWAPPED_CARD_BRANDS,
  getFormOfPaymentDisplayName,
  getSavedFormOfPaymentDisplayName,
  getSavedFormOfPaymentIcon,
  getSwappedIcon,
  getSwappedOrigin,
  isSavedFormOfPaymentType,
  isSwappedOrigin,
} from './src/utils/swapped'
export type {
  SwappedBuyingCrypto,
  SwappedPillAmounts,
  SwappedTheme,
  SwappedV2Theme,
} from './src/utils/swapped'
export {
  getDepositAddressForChain,
  getTransferTokenQrCodeUri,
  isTransferChainEnabled,
  transferChainFamily,
} from './src/utils/transfer'
export type {
  QRCodeUri,
  TransferChainFamily,
  TransferTokenQrCodeType,
} from './src/utils/transfer'
export {
  USD_DECIMALS,
  deductFlatFee,
  percentOfAmount,
  resolveWithdrawalSourceTokenBalance,
  tokenAmountToUsd,
  usdToTokenAmount,
} from './src/utils/withdrawal'
