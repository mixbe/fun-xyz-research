"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BlockedReasonSchema: () => BlockedReasonSchema,
  BlockedStateSchema: () => BlockedStateSchema,
  COINBASE_ENDPOINTS: () => COINBASE_ENDPOINTS,
  COINBASE_TERMS: () => COINBASE_TERMS,
  COUNTRY_NAMES: () => COUNTRY_NAMES,
  COUNTRY_TO_CURRENCY: () => COUNTRY_TO_CURRENCY,
  ClientExecutedDeliverySchema: () => ClientExecutedDeliverySchema,
  CoinbaseCheckoutSchema: () => CoinbaseCheckoutSchema,
  CoinbaseConsentNextActionSchema: () => CoinbaseConsentNextActionSchema,
  CoinbaseConsentRequestSchema: () => CoinbaseConsentRequestSchema,
  CoinbaseDoneSchema: () => CoinbaseDoneSchema,
  CoinbaseErrorBodySchema: () => CoinbaseErrorBodySchema,
  CoinbaseFaultSchema: () => CoinbaseFaultSchema,
  CoinbaseKycNextActionSchema: () => CoinbaseKycNextActionSchema,
  CoinbaseKycRequestSchema: () => CoinbaseKycRequestSchema,
  CoinbaseNextActionSchema: () => CoinbaseNextActionSchema,
  CoinbaseNextRequestSchema: () => CoinbaseNextRequestSchema,
  CoinbaseObserveRequestSchema: () => CoinbaseObserveRequestSchema,
  CoinbaseOrderPendingNextActionSchema: () => CoinbaseOrderPendingNextActionSchema,
  CoinbaseOrderRequestSchema: () => CoinbaseOrderRequestSchema,
  CoinbaseOrderResponseSchema: () => CoinbaseOrderResponseSchema,
  CoinbaseOtpNextActionSchema: () => CoinbaseOtpNextActionSchema,
  CoinbaseOtpRequestSchema: () => CoinbaseOtpRequestSchema,
  CoinbasePayNextActionSchema: () => CoinbasePayNextActionSchema,
  CoinbasePlaceOrderNextActionSchema: () => CoinbasePlaceOrderNextActionSchema,
  CoinbasePlaceOrderRequestSchema: () => CoinbasePlaceOrderRequestSchema,
  CoinbasePriceSchema: () => CoinbasePriceSchema,
  CoinbaseReaskSchema: () => CoinbaseReaskSchema,
  CoinbaseRefusedSchema: () => CoinbaseRefusedSchema,
  CoinbaseRequestContextSchema: () => CoinbaseRequestContextSchema,
  CoinbaseRequestSchema: () => CoinbaseRequestSchema,
  CoinbaseResponseSchemaFor: () => CoinbaseResponseSchemaFor,
  CoinbaseSessionNextActionSchema: () => CoinbaseSessionNextActionSchema,
  CoinbaseSessionRequestSchema: () => CoinbaseSessionRequestSchema,
  CoinbaseStepResponseSchema: () => CoinbaseStepResponseSchema,
  CoinbaseWaitNextActionSchema: () => CoinbaseWaitNextActionSchema,
  ContractViolation: () => ContractViolation,
  CountryCode: () => CountryCode,
  CryptoAmountSchema: () => CryptoAmountSchema,
  DOCUMENTED_ENDPOINTS: () => DOCUMENTED_ENDPOINTS,
  DeliveryStateSchema: () => DeliveryStateSchema,
  DestinationAssetSchema: () => DestinationAssetSchema,
  ENDPOINT_PATTERN: () => ENDPOINT_PATTERN,
  FIAT_CURRENCY_NAMES: () => FIAT_CURRENCY_NAMES,
  FIAT_TERMS_ENDPOINT: () => FIAT_TERMS_ENDPOINT,
  FIELD_SPEC_TYPES: () => FIELD_SPEC_TYPES,
  FIXTURES: () => FIXTURES,
  FIXTURE_COVERAGE_GAPS: () => FIXTURE_COVERAGE_GAPS,
  FUN_AUTH_ERROR_CODES: () => FUN_AUTH_ERROR_CODES,
  FUN_KYC_CONSENT_DOCUMENTS: () => FUN_KYC_CONSENT_DOCUMENTS,
  FailureReasonSchema: () => FailureReasonSchema,
  FeeLineSchema: () => FeeLineSchema,
  FiatAmountSchema: () => FiatAmountSchema,
  FiatAuthRefreshRequestSchema: () => FiatAuthRefreshRequestSchema,
  FiatAuthRefreshResponseSchema: () => FiatAuthRefreshResponseSchema,
  FiatAuthRevokeRequestSchema: () => FiatAuthRevokeRequestSchema,
  FiatAuthStartRequestSchema: () => FiatAuthStartRequestSchema,
  FiatAuthVerifyRequestSchema: () => FiatAuthVerifyRequestSchema,
  FiatCurrencyCode: () => FiatCurrencyCode,
  FiatEndpointSchema: () => FiatEndpointSchema,
  FiatGeoSchema: () => FiatGeoSchema,
  FiatNextRequestSchema: () => FiatNextRequestSchema,
  FiatProviderSchema: () => FiatProviderSchema,
  FiatRoutingQuoteErrorBodySchema: () => FiatRoutingQuoteErrorBodySchema,
  FiatRoutingQuoteRequestSchema: () => FiatRoutingQuoteRequestSchema,
  FiatRoutingQuoteTermsSchema: () => FiatRoutingQuoteTermsSchema,
  FiatRoutingTableErrorBodySchema: () => FiatRoutingTableErrorBodySchema,
  FiatRoutingTableRequestSchema: () => FiatRoutingTableRequestSchema,
  FiatRoutingTableResponseSchema: () => FiatRoutingTableResponseSchema,
  FiatSessionSchema: () => FiatSessionSchema,
  FiatStepResponseSchema: () => FiatStepResponseSchema,
  FiatTermsErrorBodySchema: () => FiatTermsErrorBodySchema,
  FiatTermsRequestSchema: () => FiatTermsRequestSchema,
  FiatTermsResponseSchema: () => FiatTermsResponseSchema,
  FieldSpecSchema: () => FieldSpecSchema,
  FlowStateSchema: () => FlowStateSchema,
  FormDescriptorSchema: () => FormDescriptorSchema,
  FormFieldSchema: () => FormFieldSchema,
  FormFieldTypeSchema: () => FormFieldTypeSchema,
  FunAuthStateSchema: () => FunAuthStateSchema,
  HTTP_VERBS: () => HTTP_VERBS,
  InstructionFieldSchema: () => InstructionFieldSchema,
  InstructionsSchema: () => InstructionsSchema,
  InstrumentSchema: () => InstrumentSchema,
  JsonSchema: () => JsonSchema,
  KYCProviderSchema: () => KYCProviderSchema,
  KYC_ACKNOWLEDGEMENT_FIELD_IDS: () => KYC_ACKNOWLEDGEMENT_FIELD_IDS,
  KycCaptureStateSchema: () => KycCaptureStateSchema,
  KycFieldIdSchema: () => KycFieldIdSchema,
  KycInputRequiredStateSchema: () => KycInputRequiredStateSchema,
  KycNoActionRequiredStateSchema: () => KycNoActionRequiredStateSchema,
  KycReviewDurationSchema: () => KycReviewDurationSchema,
  KycSdkResultReportSchema: () => KycSdkResultReportSchema,
  MOONPAY_ENDPOINTS: () => MOONPAY_ENDPOINTS,
  MoonPayCaptureDocumentSchema: () => MoonPayCaptureDocumentSchema,
  MoonPayCaptureNextActionSchema: () => MoonPayCaptureNextActionSchema,
  MoonPayCaptureRequestSchema: () => MoonPayCaptureRequestSchema,
  MoonPayCheckoutSchema: () => MoonPayCheckoutSchema,
  MoonPayConnectNextActionSchema: () => MoonPayConnectNextActionSchema,
  MoonPayConnectRequestSchema: () => MoonPayConnectRequestSchema,
  MoonPayConsentNextActionSchema: () => MoonPayConsentNextActionSchema,
  MoonPayConsentRequestSchema: () => MoonPayConsentRequestSchema,
  MoonPayDeclineRequestSchema: () => MoonPayDeclineRequestSchema,
  MoonPayDoneSchema: () => MoonPayDoneSchema,
  MoonPayErrorBodySchema: () => MoonPayErrorBodySchema,
  MoonPayFaultSchema: () => MoonPayFaultSchema,
  MoonPayGuestConsentRequestSchema: () => MoonPayGuestConsentRequestSchema,
  MoonPayGuestDeclineReasonSchema: () => MoonPayGuestDeclineReasonSchema,
  MoonPayGuestDeclineRequestSchema: () => MoonPayGuestDeclineRequestSchema,
  MoonPayGuestNextRequestSchema: () => MoonPayGuestNextRequestSchema,
  MoonPayGuestObserveRequestSchema: () => MoonPayGuestObserveRequestSchema,
  MoonPayGuestOrderRequestSchema: () => MoonPayGuestOrderRequestSchema,
  MoonPayGuestPhoneCodeRequestSchema: () => MoonPayGuestPhoneCodeRequestSchema,
  MoonPayGuestPhoneNumberRequestSchema: () => MoonPayGuestPhoneNumberRequestSchema,
  MoonPayGuestPhoneRequestSchema: () => MoonPayGuestPhoneRequestSchema,
  MoonPayGuestPhoneResendRequestSchema: () => MoonPayGuestPhoneResendRequestSchema,
  MoonPayGuestRequestSchema: () => MoonPayGuestRequestSchema,
  MoonPayGuestResponseSchema: () => MoonPayGuestResponseSchema,
  MoonPayGuestSessionRequestSchema: () => MoonPayGuestSessionRequestSchema,
  MoonPayGuestStepResponseSchema: () => MoonPayGuestStepResponseSchema,
  MoonPayKycNextActionSchema: () => MoonPayKycNextActionSchema,
  MoonPayKycRequestSchema: () => MoonPayKycRequestSchema,
  MoonPayNextActionSchema: () => MoonPayNextActionSchema,
  MoonPayNextRequestSchema: () => MoonPayNextRequestSchema,
  MoonPayObserveRequestSchema: () => MoonPayObserveRequestSchema,
  MoonPayOrderNextActionSchema: () => MoonPayOrderNextActionSchema,
  MoonPayOrderPendingNextActionSchema: () => MoonPayOrderPendingNextActionSchema,
  MoonPayOrderRequestSchema: () => MoonPayOrderRequestSchema,
  MoonPayOrderResponseSchema: () => MoonPayOrderResponseSchema,
  MoonPayPayNextActionSchema: () => MoonPayPayNextActionSchema,
  MoonPayPhoneCodeNextActionSchema: () => MoonPayPhoneCodeNextActionSchema,
  MoonPayPhoneCodeRequestSchema: () => MoonPayPhoneCodeRequestSchema,
  MoonPayPhoneNextActionSchema: () => MoonPayPhoneNextActionSchema,
  MoonPayPhoneRequestSchema: () => MoonPayPhoneRequestSchema,
  MoonPayPrepareCaptureNextActionSchema: () => MoonPayPrepareCaptureNextActionSchema,
  MoonPayPrepareCaptureRequestSchema: () => MoonPayPrepareCaptureRequestSchema,
  MoonPayQuoteInputSchema: () => MoonPayQuoteInputSchema,
  MoonPayReaskReasonSchema: () => MoonPayReaskReasonSchema,
  MoonPayReaskRequirementSchema: () => MoonPayReaskRequirementSchema,
  MoonPayReaskSchema: () => MoonPayReaskSchema,
  MoonPayRequestContextSchema: () => MoonPayRequestContextSchema,
  MoonPayRequestSchema: () => MoonPayRequestSchema,
  MoonPayResponseSchemaFor: () => MoonPayResponseSchemaFor,
  MoonPaySdkCredentialsSchema: () => MoonPaySdkCredentialsSchema,
  MoonPaySessionNextActionSchema: () => MoonPaySessionNextActionSchema,
  MoonPaySessionRequestSchema: () => MoonPaySessionRequestSchema,
  MoonPayStepResponseSchema: () => MoonPayStepResponseSchema,
  MoonPayWaitNextActionSchema: () => MoonPayWaitNextActionSchema,
  OrderAwaitingConfirmationStateSchema: () => OrderAwaitingConfirmationStateSchema,
  OrderCreatedStateSchema: () => OrderCreatedStateSchema,
  OrderRefSchema: () => OrderRefSchema,
  OrderStatusSchema: () => OrderStatusSchema,
  OrderSummarySchema: () => OrderSummarySchema,
  PAYMENT_METHOD_CATEGORIES: () => PAYMENT_METHOD_CATEGORIES,
  PROVIDER_CHECKOUT_DOCUMENTS: () => PROVIDER_CHECKOUT_DOCUMENTS,
  PROVIDER_KYC_DOCUMENTS: () => PROVIDER_KYC_DOCUMENTS,
  PUBLISHED_TERMS_DOCUMENTS: () => PUBLISHED_TERMS_DOCUMENTS,
  PaymentCaptureStateSchema: () => PaymentCaptureStateSchema,
  PaymentInstructStateSchema: () => PaymentInstructStateSchema,
  PaymentSurfaceSchema: () => PaymentSurfaceSchema,
  PendingOrderStateSchema: () => PendingOrderStateSchema,
  PollSpecSchema: () => PollSpecSchema,
  PreferredIdentityDocumentSchema: () => PreferredIdentityDocumentSchema,
  PreparedPaymentSchema: () => PreparedPaymentSchema,
  QuoteLimitRangeSchema: () => QuoteLimitRangeSchema,
  QuoteLimitsSchema: () => QuoteLimitsSchema,
  QuoteSchema: () => QuoteSchema,
  QuoteStateSchema: () => QuoteStateSchema,
  ROUTING_ENDPOINTS: () => ROUTING_ENDPOINTS,
  RecoverySchema: () => RecoverySchema,
  RefundSchema: () => RefundSchema,
  ReportSpecSchema: () => ReportSpecSchema,
  STANDARD_KYC_FIELD_IDS: () => STANDARD_KYC_FIELD_IDS,
  STATE_KEYS: () => STATE_KEYS,
  STRIPE_ENDPOINTS: () => STRIPE_ENDPOINTS,
  SelectOptionSchema: () => SelectOptionSchema,
  SessionAuthStateSchema: () => SessionAuthStateSchema,
  StatusHistoryEntrySchema: () => StatusHistoryEntrySchema,
  StripeAuthorizeNextActionSchema: () => StripeAuthorizeNextActionSchema,
  StripeAuthorizeRequestSchema: () => StripeAuthorizeRequestSchema,
  StripeCheckoutRequestSchema: () => StripeCheckoutRequestSchema,
  StripeCheckoutResponseSchema: () => StripeCheckoutResponseSchema,
  StripeCheckoutSchema: () => StripeCheckoutSchema,
  StripeCheckoutSecretNextActionSchema: () => StripeCheckoutSecretNextActionSchema,
  StripeConsentNextActionSchema: () => StripeConsentNextActionSchema,
  StripeConsentRequestSchema: () => StripeConsentRequestSchema,
  StripeDoneSchema: () => StripeDoneSchema,
  StripeErrorBodySchema: () => StripeErrorBodySchema,
  StripeFaultSchema: () => StripeFaultSchema,
  StripeKycNextActionSchema: () => StripeKycNextActionSchema,
  StripeKycRequestSchema: () => StripeKycRequestSchema,
  StripeLinkAuthTokenSchema: () => StripeLinkAuthTokenSchema,
  StripeNextActionSchema: () => StripeNextActionSchema,
  StripeNextRequestSchema: () => StripeNextRequestSchema,
  StripeObserveRequestSchema: () => StripeObserveRequestSchema,
  StripeOrderPendingNextActionSchema: () => StripeOrderPendingNextActionSchema,
  StripeOrderRequestSchema: () => StripeOrderRequestSchema,
  StripeOrderResponseSchema: () => StripeOrderResponseSchema,
  StripePayNextActionSchema: () => StripePayNextActionSchema,
  StripePaySheetSchema: () => StripePaySheetSchema,
  StripePlaceOrderNextActionSchema: () => StripePlaceOrderNextActionSchema,
  StripePlaceOrderRequestSchema: () => StripePlaceOrderRequestSchema,
  StripePriceSchema: () => StripePriceSchema,
  StripeReaskSchema: () => StripeReaskSchema,
  StripeRefusedSchema: () => StripeRefusedSchema,
  StripeRequestContextSchema: () => StripeRequestContextSchema,
  StripeRequestSchema: () => StripeRequestSchema,
  StripeResponseSchemaFor: () => StripeResponseSchemaFor,
  StripeSessionNextActionSchema: () => StripeSessionNextActionSchema,
  StripeSessionRequestSchema: () => StripeSessionRequestSchema,
  StripeStepResponseSchema: () => StripeStepResponseSchema,
  StripeVerifyIdentityNextActionSchema: () => StripeVerifyIdentityNextActionSchema,
  StripeWaitNextActionSchema: () => StripeWaitNextActionSchema,
  SurfaceKindSchema: () => SurfaceKindSchema,
  SurfaceProviderSchema: () => SurfaceProviderSchema,
  SurfaceSchema: () => SurfaceSchema,
  TABLE_VERSION: () => TABLE_VERSION,
  TERMINAL_ORDER_STATUSES: () => TERMINAL_ORDER_STATUSES,
  TRANSITION_TABLE: () => TRANSITION_TABLE,
  TermsAcceptanceSchema: () => TermsAcceptanceSchema,
  TermsDocumentAcceptanceSchema: () => TermsDocumentAcceptanceSchema,
  TermsDocumentSchema: () => TermsDocumentSchema,
  TransitionInputsSchema: () => TransitionInputsSchema,
  TransitionParamsSchema: () => TransitionParamsSchema,
  TransitionSchema: () => TransitionSchema,
  TxSchema: () => TxSchema,
  UNOFFERED_ENDPOINTS: () => UNOFFERED_ENDPOINTS,
  UNREACHABLE_STATES: () => UNREACHABLE_STATES,
  US_STATE_CODES: () => US_STATE_CODES,
  UsStateCodeSchema: () => UsStateCodeSchema,
  assertAllFixtures: () => assertAllFixtures,
  assertFiatStepResponse: () => assertFiatStepResponse,
  assertFixture: () => assertFixture,
  assertLegalEmission: () => assertLegalEmission,
  assertLegalReturn: () => assertLegalReturn,
  checkLegalEmission: () => checkLegalEmission,
  endpointMatches: () => endpointMatches,
  fixtureMeta: () => fixtureMeta,
  isTerminal: () => isTerminal,
  loadFixture: () => loadFixture,
  loadFixtures: () => loadFixtures,
  looksLikeFieldSpec: () => looksLikeFieldSpec,
  stateKey: () => stateKey,
  tableEntry: () => tableEntry,
  unofferedEndpoints: () => unofferedEndpoints,
  unreachableStates: () => unreachableStates,
  walkTable: () => walkTable
});
module.exports = __toCommonJS(index_exports);

// src/codes.ts
var US_STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "AS",
  "GU",
  "MP",
  "PR",
  "VI"
];
var COUNTRY_CURRENCY_LIST = [
  { country: "AD", countryName: "Andorra", currency: "EUR", currencyName: "Euro" },
  { country: "AE", countryName: "United Arab Emirates", currency: "AED", currencyName: "UAE Dirham" },
  { country: "AF", countryName: "Afghanistan", currency: "AFN", currencyName: "Afghan Afghani" },
  { country: "AG", countryName: "Antigua and Barbuda", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "AI", countryName: "Anguilla", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "AL", countryName: "Albania", currency: "ALL", currencyName: "Albanian Lek" },
  { country: "AM", countryName: "Armenia", currency: "AMD", currencyName: "Armenian Dram" },
  { country: "AO", countryName: "Angola", currency: "AOA", currencyName: "Angolan Kwanza" },
  { country: "AQ", countryName: "Antarctica", currency: "USD", currencyName: "US Dollar" },
  { country: "AR", countryName: "Argentina", currency: "ARS", currencyName: "Argentine Peso" },
  { country: "AS", countryName: "American Samoa", currency: "USD", currencyName: "US Dollar" },
  { country: "AT", countryName: "Austria", currency: "EUR", currencyName: "Euro" },
  { country: "AU", countryName: "Australia", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "AW", countryName: "Aruba", currency: "AWG", currencyName: "Aruban Florin" },
  { country: "AX", countryName: "\xC5land Islands", currency: "EUR", currencyName: "Euro" },
  { country: "AZ", countryName: "Azerbaijan", currency: "AZN", currencyName: "Azerbaijani Manat" },
  { country: "BA", countryName: "Bosnia and Herzegovina", currency: "BAM", currencyName: "Bosnia-Herzegovina Convertible Mark" },
  { country: "BB", countryName: "Barbados", currency: "BBD", currencyName: "Barbadian Dollar" },
  { country: "BD", countryName: "Bangladesh", currency: "BDT", currencyName: "Bangladeshi Taka" },
  { country: "BE", countryName: "Belgium", currency: "EUR", currencyName: "Euro" },
  { country: "BF", countryName: "Burkina Faso", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "BG", countryName: "Bulgaria", currency: "BGN", currencyName: "Bulgarian Lev" },
  { country: "BH", countryName: "Bahrain", currency: "BHD", currencyName: "Bahraini Dinar" },
  { country: "BI", countryName: "Burundi", currency: "BIF", currencyName: "Burundian Franc" },
  { country: "BJ", countryName: "Benin", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "BL", countryName: "Saint Barth\xE9lemy", currency: "EUR", currencyName: "Euro" },
  { country: "BM", countryName: "Bermuda", currency: "BMD", currencyName: "Bermudan Dollar" },
  { country: "BN", countryName: "Brunei", currency: "BND", currencyName: "Brunei Dollar" },
  { country: "BO", countryName: "Bolivia", currency: "BOB", currencyName: "Bolivian Boliviano" },
  { country: "BQ", countryName: "Bonaire, Sint Eustatius and Saba", currency: "USD", currencyName: "US Dollar" },
  { country: "BR", countryName: "Brazil", currency: "BRL", currencyName: "Brazilian Real" },
  { country: "BS", countryName: "Bahamas", currency: "BSD", currencyName: "Bahamian Dollar" },
  { country: "BT", countryName: "Bhutan", currency: "BTN", currencyName: "Bhutanese Ngultrum" },
  { country: "BV", countryName: "Bouvet Island", currency: "NOK", currencyName: "Norwegian Krone" },
  { country: "BW", countryName: "Botswana", currency: "BWP", currencyName: "Botswanan Pula" },
  { country: "BY", countryName: "Belarus", currency: "BYN", currencyName: "Belarusian Ruble" },
  { country: "BZ", countryName: "Belize", currency: "BZD", currencyName: "Belize Dollar" },
  { country: "CA", countryName: "Canada", currency: "CAD", currencyName: "Canadian Dollar" },
  { country: "CC", countryName: "Cocos (Keeling) Islands", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "CD", countryName: "DR Congo", currency: "CDF", currencyName: "Congolese Franc" },
  { country: "CF", countryName: "Central African Republic", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "CG", countryName: "Congo", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "CH", countryName: "Switzerland", currency: "CHF", currencyName: "Swiss Franc" },
  { country: "CI", countryName: "C\xF4te d'Ivoire", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "CK", countryName: "Cook Islands", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "CL", countryName: "Chile", currency: "CLP", currencyName: "Chilean Peso" },
  { country: "CM", countryName: "Cameroon", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "CN", countryName: "China", currency: "CNY", currencyName: "Chinese Yuan" },
  { country: "CO", countryName: "Colombia", currency: "COP", currencyName: "Colombian Peso" },
  { country: "CR", countryName: "Costa Rica", currency: "CRC", currencyName: "Costa Rican Col\xF3n" },
  { country: "CU", countryName: "Cuba", currency: "CUP", currencyName: "Cuban Peso" },
  { country: "CV", countryName: "Cabo Verde", currency: "CVE", currencyName: "Cape Verdean Escudo" },
  { country: "CW", countryName: "Cura\xE7ao", currency: "ANG", currencyName: "Netherlands Antillean Guilder" },
  { country: "CX", countryName: "Christmas Island", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "CY", countryName: "Cyprus", currency: "EUR", currencyName: "Euro" },
  { country: "CZ", countryName: "Czechia", currency: "CZK", currencyName: "Czech Koruna" },
  { country: "DE", countryName: "Germany", currency: "EUR", currencyName: "Euro" },
  { country: "DJ", countryName: "Djibouti", currency: "DJF", currencyName: "Djiboutian Franc" },
  { country: "DK", countryName: "Denmark", currency: "DKK", currencyName: "Danish Krone" },
  { country: "DM", countryName: "Dominica", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "DO", countryName: "Dominican Republic", currency: "DOP", currencyName: "Dominican Peso" },
  { country: "DZ", countryName: "Algeria", currency: "DZD", currencyName: "Algerian Dinar" },
  { country: "EC", countryName: "Ecuador", currency: "USD", currencyName: "US Dollar" },
  { country: "EE", countryName: "Estonia", currency: "EUR", currencyName: "Euro" },
  { country: "EG", countryName: "Egypt", currency: "EGP", currencyName: "Egyptian Pound" },
  { country: "EH", countryName: "Western Sahara", currency: "MAD", currencyName: "Moroccan Dirham" },
  { country: "ER", countryName: "Eritrea", currency: "ERN", currencyName: "Eritrean Nakfa" },
  { country: "ES", countryName: "Spain", currency: "EUR", currencyName: "Euro" },
  { country: "ET", countryName: "Ethiopia", currency: "ETB", currencyName: "Ethiopian Birr" },
  { country: "FI", countryName: "Finland", currency: "EUR", currencyName: "Euro" },
  { country: "FJ", countryName: "Fiji", currency: "FJD", currencyName: "Fijian Dollar" },
  { country: "FK", countryName: "Falkland Islands", currency: "FKP", currencyName: "Falkland Islands Pound" },
  { country: "FM", countryName: "Micronesia", currency: "USD", currencyName: "US Dollar" },
  { country: "FO", countryName: "Faroe Islands", currency: "DKK", currencyName: "Danish Krone" },
  { country: "FR", countryName: "France", currency: "EUR", currencyName: "Euro" },
  { country: "GA", countryName: "Gabon", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "GB", countryName: "United Kingdom", currency: "GBP", currencyName: "British Pound" },
  { country: "GD", countryName: "Grenada", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "GE", countryName: "Georgia", currency: "GEL", currencyName: "Georgian Lari" },
  { country: "GF", countryName: "French Guiana", currency: "EUR", currencyName: "Euro" },
  { country: "GG", countryName: "Guernsey", currency: "GBP", currencyName: "British Pound" },
  { country: "GH", countryName: "Ghana", currency: "GHS", currencyName: "Ghanaian Cedi" },
  { country: "GI", countryName: "Gibraltar", currency: "GIP", currencyName: "Gibraltar Pound" },
  { country: "GL", countryName: "Greenland", currency: "DKK", currencyName: "Danish Krone" },
  { country: "GM", countryName: "Gambia", currency: "GMD", currencyName: "Gambian Dalasi" },
  { country: "GN", countryName: "Guinea", currency: "GNF", currencyName: "Guinean Franc" },
  { country: "GP", countryName: "Guadeloupe", currency: "EUR", currencyName: "Euro" },
  { country: "GQ", countryName: "Equatorial Guinea", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "GR", countryName: "Greece", currency: "EUR", currencyName: "Euro" },
  { country: "GS", countryName: "South Georgia and the South Sandwich Islands", currency: "GBP", currencyName: "British Pound" },
  { country: "GT", countryName: "Guatemala", currency: "GTQ", currencyName: "Guatemalan Quetzal" },
  { country: "GU", countryName: "Guam", currency: "USD", currencyName: "US Dollar" },
  { country: "GW", countryName: "Guinea-Bissau", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "GY", countryName: "Guyana", currency: "GYD", currencyName: "Guyanaese Dollar" },
  { country: "HK", countryName: "Hong Kong", currency: "HKD", currencyName: "Hong Kong Dollar" },
  { country: "HM", countryName: "Heard Island and McDonald Islands", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "HN", countryName: "Honduras", currency: "HNL", currencyName: "Honduran Lempira" },
  { country: "HR", countryName: "Croatia", currency: "EUR", currencyName: "Euro" },
  { country: "HT", countryName: "Haiti", currency: "HTG", currencyName: "Haitian Gourde" },
  { country: "HU", countryName: "Hungary", currency: "HUF", currencyName: "Hungarian Forint" },
  { country: "ID", countryName: "Indonesia", currency: "IDR", currencyName: "Indonesian Rupiah" },
  { country: "IE", countryName: "Ireland", currency: "EUR", currencyName: "Euro" },
  { country: "IL", countryName: "Israel", currency: "ILS", currencyName: "Israeli New Shekel" },
  { country: "IM", countryName: "Isle of Man", currency: "GBP", currencyName: "British Pound" },
  { country: "IN", countryName: "India", currency: "INR", currencyName: "Indian Rupee" },
  { country: "IO", countryName: "British Indian Ocean Territory", currency: "USD", currencyName: "US Dollar" },
  { country: "IQ", countryName: "Iraq", currency: "IQD", currencyName: "Iraqi Dinar" },
  { country: "IR", countryName: "Iran", currency: "IRR", currencyName: "Iranian Rial" },
  { country: "IS", countryName: "Iceland", currency: "ISK", currencyName: "Icelandic Kr\xF3na" },
  { country: "IT", countryName: "Italy", currency: "EUR", currencyName: "Euro" },
  { country: "JE", countryName: "Jersey", currency: "GBP", currencyName: "British Pound" },
  { country: "JM", countryName: "Jamaica", currency: "JMD", currencyName: "Jamaican Dollar" },
  { country: "JO", countryName: "Jordan", currency: "JOD", currencyName: "Jordanian Dinar" },
  { country: "JP", countryName: "Japan", currency: "JPY", currencyName: "Japanese Yen" },
  { country: "KE", countryName: "Kenya", currency: "KES", currencyName: "Kenyan Shilling" },
  { country: "KG", countryName: "Kyrgyzstan", currency: "KGS", currencyName: "Kyrgystani Som" },
  { country: "KH", countryName: "Cambodia", currency: "KHR", currencyName: "Cambodian Riel" },
  { country: "KI", countryName: "Kiribati", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "KM", countryName: "Comoros", currency: "KMF", currencyName: "Comorian Franc" },
  { country: "KN", countryName: "Saint Kitts and Nevis", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "KP", countryName: "North Korea", currency: "KPW", currencyName: "North Korean Won" },
  { country: "KR", countryName: "South Korea", currency: "KRW", currencyName: "South Korean Won" },
  { country: "KW", countryName: "Kuwait", currency: "KWD", currencyName: "Kuwaiti Dinar" },
  { country: "KY", countryName: "Cayman Islands", currency: "KYD", currencyName: "Cayman Islands Dollar" },
  { country: "KZ", countryName: "Kazakhstan", currency: "KZT", currencyName: "Kazakhstani Tenge" },
  { country: "LA", countryName: "Laos", currency: "LAK", currencyName: "Laotian Kip" },
  { country: "LB", countryName: "Lebanon", currency: "LBP", currencyName: "Lebanese Pound" },
  { country: "LC", countryName: "Saint Lucia", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "LI", countryName: "Liechtenstein", currency: "CHF", currencyName: "Swiss Franc" },
  { country: "LK", countryName: "Sri Lanka", currency: "LKR", currencyName: "Sri Lankan Rupee" },
  { country: "LR", countryName: "Liberia", currency: "LRD", currencyName: "Liberian Dollar" },
  { country: "LS", countryName: "Lesotho", currency: "LSL", currencyName: "Lesotho Loti" },
  { country: "LT", countryName: "Lithuania", currency: "EUR", currencyName: "Euro" },
  { country: "LU", countryName: "Luxembourg", currency: "EUR", currencyName: "Euro" },
  { country: "LV", countryName: "Latvia", currency: "EUR", currencyName: "Euro" },
  { country: "LY", countryName: "Libya", currency: "LYD", currencyName: "Libyan Dinar" },
  { country: "MA", countryName: "Morocco", currency: "MAD", currencyName: "Moroccan Dirham" },
  { country: "MC", countryName: "Monaco", currency: "EUR", currencyName: "Euro" },
  { country: "MD", countryName: "Moldova", currency: "MDL", currencyName: "Moldovan Leu" },
  { country: "ME", countryName: "Montenegro", currency: "EUR", currencyName: "Euro" },
  { country: "MF", countryName: "Saint Martin", currency: "EUR", currencyName: "Euro" },
  { country: "MG", countryName: "Madagascar", currency: "MGA", currencyName: "Malagasy Ariary" },
  { country: "MH", countryName: "Marshall Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "MK", countryName: "North Macedonia", currency: "MKD", currencyName: "Macedonian Denar" },
  { country: "ML", countryName: "Mali", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "MM", countryName: "Myanmar", currency: "MMK", currencyName: "Myanmar Kyat" },
  { country: "MN", countryName: "Mongolia", currency: "MNT", currencyName: "Mongolian Tugrik" },
  { country: "MO", countryName: "Macao", currency: "MOP", currencyName: "Macanese Pataca" },
  { country: "MP", countryName: "Northern Mariana Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "MQ", countryName: "Martinique", currency: "EUR", currencyName: "Euro" },
  { country: "MR", countryName: "Mauritania", currency: "MRU", currencyName: "Mauritanian Ouguiya" },
  { country: "MS", countryName: "Montserrat", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "MT", countryName: "Malta", currency: "EUR", currencyName: "Euro" },
  { country: "MU", countryName: "Mauritius", currency: "MUR", currencyName: "Mauritian Rupee" },
  { country: "MV", countryName: "Maldives", currency: "MVR", currencyName: "Maldivian Rufiyaa" },
  { country: "MW", countryName: "Malawi", currency: "MWK", currencyName: "Malawian Kwacha" },
  { country: "MX", countryName: "Mexico", currency: "MXN", currencyName: "Mexican Peso" },
  { country: "MY", countryName: "Malaysia", currency: "MYR", currencyName: "Malaysian Ringgit" },
  { country: "MZ", countryName: "Mozambique", currency: "MZN", currencyName: "Mozambican Metical" },
  { country: "NA", countryName: "Namibia", currency: "NAD", currencyName: "Namibian Dollar" },
  { country: "NC", countryName: "New Caledonia", currency: "XPF", currencyName: "CFP Franc" },
  { country: "NE", countryName: "Niger", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "NF", countryName: "Norfolk Island", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "NG", countryName: "Nigeria", currency: "NGN", currencyName: "Nigerian Naira" },
  { country: "NI", countryName: "Nicaragua", currency: "NIO", currencyName: "Nicaraguan C\xF3rdoba" },
  { country: "NL", countryName: "Netherlands", currency: "EUR", currencyName: "Euro" },
  { country: "NO", countryName: "Norway", currency: "NOK", currencyName: "Norwegian Krone" },
  { country: "NP", countryName: "Nepal", currency: "NPR", currencyName: "Nepalese Rupee" },
  { country: "NR", countryName: "Nauru", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "NU", countryName: "Niue", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "NZ", countryName: "New Zealand", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "OM", countryName: "Oman", currency: "OMR", currencyName: "Omani Rial" },
  { country: "PA", countryName: "Panama", currency: "PAB", currencyName: "Panamanian Balboa" },
  { country: "PE", countryName: "Peru", currency: "PEN", currencyName: "Peruvian Sol" },
  { country: "PF", countryName: "French Polynesia", currency: "XPF", currencyName: "CFP Franc" },
  { country: "PG", countryName: "Papua New Guinea", currency: "PGK", currencyName: "Papua New Guinean Kina" },
  { country: "PH", countryName: "Philippines", currency: "PHP", currencyName: "Philippine Peso" },
  { country: "PK", countryName: "Pakistan", currency: "PKR", currencyName: "Pakistani Rupee" },
  { country: "PL", countryName: "Poland", currency: "PLN", currencyName: "Polish Z\u0142oty" },
  { country: "PM", countryName: "Saint Pierre and Miquelon", currency: "EUR", currencyName: "Euro" },
  { country: "PN", countryName: "Pitcairn", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "PR", countryName: "Puerto Rico", currency: "USD", currencyName: "US Dollar" },
  { country: "PS", countryName: "Palestine", currency: "ILS", currencyName: "Israeli New Shekel" },
  { country: "PT", countryName: "Portugal", currency: "EUR", currencyName: "Euro" },
  { country: "PW", countryName: "Palau", currency: "USD", currencyName: "US Dollar" },
  { country: "PY", countryName: "Paraguay", currency: "PYG", currencyName: "Paraguayan Guarani" },
  { country: "QA", countryName: "Qatar", currency: "QAR", currencyName: "Qatari Riyal" },
  { country: "RE", countryName: "R\xE9union", currency: "EUR", currencyName: "Euro" },
  { country: "RO", countryName: "Romania", currency: "RON", currencyName: "Romanian Leu" },
  { country: "RS", countryName: "Serbia", currency: "RSD", currencyName: "Serbian Dinar" },
  { country: "RU", countryName: "Russia", currency: "RUB", currencyName: "Russian Ruble" },
  { country: "RW", countryName: "Rwanda", currency: "RWF", currencyName: "Rwandan Franc" },
  { country: "SA", countryName: "Saudi Arabia", currency: "SAR", currencyName: "Saudi Riyal" },
  { country: "SB", countryName: "Solomon Islands", currency: "SBD", currencyName: "Solomon Islands Dollar" },
  { country: "SC", countryName: "Seychelles", currency: "SCR", currencyName: "Seychellois Rupee" },
  { country: "SD", countryName: "Sudan", currency: "SDG", currencyName: "Sudanese Pound" },
  { country: "SE", countryName: "Sweden", currency: "SEK", currencyName: "Swedish Krona" },
  { country: "SG", countryName: "Singapore", currency: "SGD", currencyName: "Singapore Dollar" },
  { country: "SH", countryName: "Saint Helena, Ascension and Tristan da Cunha", currency: "SHP", currencyName: "Saint Helena Pound" },
  { country: "SI", countryName: "Slovenia", currency: "EUR", currencyName: "Euro" },
  { country: "SJ", countryName: "Svalbard and Jan Mayen", currency: "NOK", currencyName: "Norwegian Krone" },
  { country: "SK", countryName: "Slovakia", currency: "EUR", currencyName: "Euro" },
  { country: "SL", countryName: "Sierra Leone", currency: "SLE", currencyName: "Sierra Leonean Leone" },
  { country: "SM", countryName: "San Marino", currency: "EUR", currencyName: "Euro" },
  { country: "SN", countryName: "Senegal", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "SO", countryName: "Somalia", currency: "SOS", currencyName: "Somali Shilling" },
  { country: "SR", countryName: "Suriname", currency: "SRD", currencyName: "Surinamese Dollar" },
  { country: "SS", countryName: "South Sudan", currency: "SSP", currencyName: "South Sudanese Pound" },
  { country: "ST", countryName: "S\xE3o Tom\xE9 and Pr\xEDncipe", currency: "STN", currencyName: "S\xE3o Tom\xE9 and Pr\xEDncipe Dobra" },
  { country: "SV", countryName: "El Salvador", currency: "USD", currencyName: "US Dollar" },
  { country: "SX", countryName: "Sint Maarten", currency: "ANG", currencyName: "Netherlands Antillean Guilder" },
  { country: "SY", countryName: "Syria", currency: "SYP", currencyName: "Syrian Pound" },
  { country: "SZ", countryName: "Eswatini", currency: "SZL", currencyName: "Swazi Lilangeni" },
  { country: "TC", countryName: "Turks and Caicos Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "TD", countryName: "Chad", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "TF", countryName: "French Southern Territories", currency: "EUR", currencyName: "Euro" },
  { country: "TG", countryName: "Togo", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "TH", countryName: "Thailand", currency: "THB", currencyName: "Thai Baht" },
  { country: "TJ", countryName: "Tajikistan", currency: "TJS", currencyName: "Tajikistani Somoni" },
  { country: "TK", countryName: "Tokelau", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "TL", countryName: "Timor-Leste", currency: "USD", currencyName: "US Dollar" },
  { country: "TM", countryName: "Turkmenistan", currency: "TMT", currencyName: "Turkmenistani Manat" },
  { country: "TN", countryName: "Tunisia", currency: "TND", currencyName: "Tunisian Dinar" },
  { country: "TO", countryName: "Tonga", currency: "TOP", currencyName: "Tongan Pa\u02BBanga" },
  { country: "TR", countryName: "Turkey", currency: "TRY", currencyName: "Turkish Lira" },
  { country: "TT", countryName: "Trinidad and Tobago", currency: "TTD", currencyName: "Trinidad and Tobago Dollar" },
  { country: "TV", countryName: "Tuvalu", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "TW", countryName: "Taiwan", currency: "TWD", currencyName: "New Taiwan Dollar" },
  { country: "TZ", countryName: "Tanzania", currency: "TZS", currencyName: "Tanzanian Shilling" },
  { country: "UA", countryName: "Ukraine", currency: "UAH", currencyName: "Ukrainian Hryvnia" },
  { country: "UG", countryName: "Uganda", currency: "UGX", currencyName: "Ugandan Shilling" },
  { country: "UM", countryName: "United States Minor Outlying Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "US", countryName: "United States", currency: "USD", currencyName: "US Dollar" },
  { country: "UY", countryName: "Uruguay", currency: "UYU", currencyName: "Uruguayan Peso" },
  { country: "UZ", countryName: "Uzbekistan", currency: "UZS", currencyName: "Uzbekistani Som" },
  { country: "VA", countryName: "Vatican City", currency: "EUR", currencyName: "Euro" },
  { country: "VC", countryName: "Saint Vincent and the Grenadines", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "VE", countryName: "Venezuela", currency: "VES", currencyName: "Venezuelan Bol\xEDvar" },
  { country: "VG", countryName: "British Virgin Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "VI", countryName: "United States Virgin Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "VN", countryName: "Vietnam", currency: "VND", currencyName: "Vietnamese Dong" },
  { country: "VU", countryName: "Vanuatu", currency: "VUV", currencyName: "Vanuatu Vatu" },
  { country: "WF", countryName: "Wallis and Futuna", currency: "XPF", currencyName: "CFP Franc" },
  { country: "WS", countryName: "Samoa", currency: "WST", currencyName: "Samoan Tala" },
  { country: "YE", countryName: "Yemen", currency: "YER", currencyName: "Yemeni Rial" },
  { country: "YT", countryName: "Mayotte", currency: "EUR", currencyName: "Euro" },
  { country: "ZA", countryName: "South Africa", currency: "ZAR", currencyName: "South African Rand" },
  { country: "ZM", countryName: "Zambia", currency: "ZMW", currencyName: "Zambian Kwacha" },
  { country: "ZW", countryName: "Zimbabwe", currency: "ZWL", currencyName: "Zimbabwean Dollar" }
];
var CountryCode = Object.fromEntries(COUNTRY_CURRENCY_LIST.map((e) => [e.country, e.country]));
var uniqueCurrencies = /* @__PURE__ */ new Map();
for (const entry of COUNTRY_CURRENCY_LIST) {
  if (!uniqueCurrencies.has(entry.currency)) uniqueCurrencies.set(entry.currency, entry.currencyName);
}
var FiatCurrencyCode = Object.fromEntries([...uniqueCurrencies.keys()].map((code) => [code, code]));
var COUNTRY_NAMES = Object.fromEntries(COUNTRY_CURRENCY_LIST.map((e) => [e.country, e.countryName]));
var FIAT_CURRENCY_NAMES = Object.fromEntries(uniqueCurrencies);
var COUNTRY_TO_CURRENCY = Object.fromEntries(COUNTRY_CURRENCY_LIST.map((e) => [e.country, e.currency]));
var PAYMENT_METHOD_CATEGORIES = ["card", "apple_pay", "google_pay", "bank_transfer"];

// src/schemas.ts
var import_zod = require("zod");
var FIAT_CURRENCY_CODES = Object.keys(FIAT_CURRENCY_NAMES);
var obj = (shape) => import_zod.z.object(shape).strict();
var JsonSchema = import_zod.z.lazy(
  () => import_zod.z.union([
    import_zod.z.string(),
    import_zod.z.number(),
    import_zod.z.boolean(),
    import_zod.z.null(),
    import_zod.z.array(JsonSchema),
    import_zod.z.record(import_zod.z.string(), JsonSchema)
  ])
);
var HTTP_VERBS = ["GET", "POST"];
var ENDPOINT_PATTERN = /^(GET|POST) \/fiat\/[^\s]*$/;
var $endpoint = import_zod.z.string().regex(ENDPOINT_PATTERN, 'endpoint must read "<GET|POST> /fiat/\u2026"');
var FiatEndpointSchema = $endpoint;
var UsStateCodeSchema = import_zod.z.enum(US_STATE_CODES);
var $provider = import_zod.z.enum([
  "TRANSAK",
  "SWAPPED",
  "BANXA",
  "MOONPAY",
  "MOONPAY_GUEST",
  "STRIPE",
  "COINBASE",
  "CROSSMINT"
]);
var FiatProviderSchema = $provider;
var $kycProvider = import_zod.z.enum(["SUMSUB"]);
var KYCProviderSchema = $kycProvider;
var $surfaceProvider = import_zod.z.enum([...$provider.options, ...$kycProvider.options]);
var SurfaceProviderSchema = $surfaceProvider;
var $orderStatus = import_zod.z.enum([
  "CREATING",
  "AWAITING_PAYMENT",
  "PAYMENT_VERIFYING",
  "PROCESSING",
  "PENDING_DELIVERY",
  "ON_HOLD",
  "CRYPTO_SENT",
  "SETTLED",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
  "REFUNDED",
  "CAPTURE_ORPHANED"
]);
var OrderStatusSchema = $orderStatus;
var $recovery = import_zod.z.enum(["REQUOTE", "RETRY_PAYMENT", "CONTACT_SUPPORT", "NONE"]);
var RecoverySchema = $recovery;
var $failureReason = import_zod.z.union([
  obj({
    category: import_zod.z.enum([
      "PAYMENT_DECLINED",
      "KYC_REJECTED",
      "PROVIDER_OUTAGE",
      "USER_ERROR",
      "CANCELLED"
    ]),
    retryable: import_zod.z.boolean(),
    recovery: $recovery,
    code: import_zod.z.string().optional()
  }),
  obj({
    category: import_zod.z.literal("EXPIRED"),
    which: import_zod.z.enum(["QUOTE", "PAYMENT_WINDOW", "INSTRUCTIONS"]),
    retryable: import_zod.z.boolean(),
    recovery: $recovery,
    code: import_zod.z.string().optional()
  })
]);
var FailureReasonSchema = $failureReason;
var $money = obj({ currency: import_zod.z.enum(FIAT_CURRENCY_CODES), amount: import_zod.z.string() });
var FiatAmountSchema = $money;
var $cryptoAmount = obj({
  currency: import_zod.z.string(),
  network: import_zod.z.string(),
  amount: import_zod.z.string()
});
var CryptoAmountSchema = $cryptoAmount;
var $feeLine = obj({ id: import_zod.z.string(), labelFallback: import_zod.z.string(), amount: import_zod.z.string() });
var FeeLineSchema = $feeLine;
var $quote = obj({
  quoteRef: import_zod.z.string(),
  fiat: $money,
  crypto: $cryptoAmount,
  rate: import_zod.z.string(),
  totalFee: import_zod.z.string(),
  feeBreakdown: import_zod.z.array($feeLine),
  paymentMethod: import_zod.z.enum(PAYMENT_METHOD_CATEGORIES),
  expiresAt: import_zod.z.string(),
  feeSubsidy: $money.optional()
});
var QuoteSchema = $quote;
var $quoteLimitRange = obj({ min: import_zod.z.string(), max: import_zod.z.string() });
var QuoteLimitRangeSchema = $quoteLimitRange;
var $quoteLimits = obj({
  min: import_zod.z.string(),
  max: import_zod.z.string(),
  serviceableRanges: import_zod.z.array($quoteLimitRange).min(1).optional()
});
var QuoteLimitsSchema = $quoteLimits;
var $instrument = obj({ brandLabel: import_zod.z.string(), last4: import_zod.z.string() });
var InstrumentSchema = $instrument;
var $orderRef = obj({
  orderId: import_zod.z.string(),
  fiat: $money,
  crypto: $cryptoAmount,
  method: import_zod.z.enum(PAYMENT_METHOD_CATEGORIES),
  createdAt: import_zod.z.string(),
  status: $orderStatus
});
var OrderRefSchema = $orderRef;
var $orderSummary = obj({
  orderId: import_zod.z.string(),
  fiat: $money,
  crypto: $cryptoAmount.optional(),
  method: import_zod.z.enum(PAYMENT_METHOD_CATEGORIES),
  createdAt: import_zod.z.string(),
  instrument: $instrument.optional()
});
var OrderSummarySchema = $orderSummary;
var $statusHistoryEntry = obj({ status: $orderStatus });
var StatusHistoryEntrySchema = $statusHistoryEntry;
var $tx = obj({ chainId: import_zod.z.number(), hash: import_zod.z.string() });
var TxSchema = $tx;
var $refund = obj({
  currency: import_zod.z.enum(FIAT_CURRENCY_CODES),
  amount: import_zod.z.string(),
  expectedBy: import_zod.z.string()
});
var RefundSchema = $refund;
var $surfaceKind = import_zod.z.enum([
  "URL_REDIRECT",
  "KYC_SDK",
  "PCI_COMPONENT",
  "PAY_SHEET",
  "ACH_COMPONENT",
  "AUTH_COMPONENT"
]);
var SurfaceKindSchema = $surfaceKind;
var $surfaceBase = {
  provider: $surfaceProvider,
  /**
   * The one deliberate non-strict leaf in the contract. Provider inputs are the adapter's
   * vocabulary, so typing them here would drag every provider field change through a contract
   * release and both consumers — and a normalised `environment` could only be lossy across
   * Transak's four values and Banxa's two. Both ends narrow instead: fun-backend emits from a
   * typed provider session, the client adapter validates with its own schema, and a recorded
   * fixture per `(provider, kind)` keeps the two honest.
   */
  params: import_zod.z.record(import_zod.z.string(), JsonSchema),
  expiresAt: import_zod.z.string().optional()
};
var $preferredIdentityDocument = obj({
  idDocType: import_zod.z.enum(["PASSPORT", "ID_CARD", "DRIVERS", "RESIDENCE_PERMIT", "VISA"]),
  country: import_zod.z.string().regex(/^[A-Z]{3}$/)
});
var PreferredIdentityDocumentSchema = $preferredIdentityDocument;
var STANDARD_KYC_FIELD_IDS = [
  "LEGAL_FIRST_NAME",
  "LEGAL_MIDDLE_NAME",
  "LEGAL_LAST_NAME",
  "DATE_OF_BIRTH",
  "COUNTRY_OF_BIRTH",
  "CITY_OF_BIRTH",
  "NATIONALITY",
  "EMAIL_ADDRESS",
  "EMAIL_OWNERSHIP_VERIFICATION",
  "PHONE_NUMBER",
  "PHONE_OWNERSHIP_VERIFICATION",
  "RESIDENTIAL_ADDRESS_LINE_1",
  "RESIDENTIAL_ADDRESS_LINE_2",
  "RESIDENTIAL_ADDRESS_CITY",
  "RESIDENTIAL_ADDRESS_REGION",
  "RESIDENTIAL_ADDRESS_POSTAL_CODE",
  "RESIDENTIAL_ADDRESS_COUNTRY",
  "TAX_IDENTIFIER",
  "US_SSN_LAST_FOUR",
  "TAX_RESIDENCE_COUNTRY",
  "EMPLOYMENT_STATUS",
  "OCCUPATION_INDUSTRY",
  "OCCUPATION_TITLE",
  "SOURCE_OF_FUNDS_DECLARATION",
  "SOURCE_OF_INCOME_DECLARATION",
  "SOURCE_OF_WEALTH_DECLARATION",
  "PURPOSE_OF_SERVICE",
  "PURPOSE_OF_TRANSACTION",
  "CUSTOMER_CATEGORY"
];
var KYC_ACKNOWLEDGEMENT_FIELD_IDS = [
  "RISK_ACKNOWLEDGEMENT",
  "COOLING_OFF_ACKNOWLEDGEMENT",
  "TERMS_ACCEPTANCE"
];
var $questionnaireKycFieldId = import_zod.z.custom(
  (value) => typeof value === "string" && /^QUESTIONNAIRE_RESPONSE:[^:]+:[^:]+$/.test(value),
  "Questionnaire field ids must identify exactly one policy and question"
);
var $kycFieldId = import_zod.z.union([
  import_zod.z.enum(STANDARD_KYC_FIELD_IDS),
  import_zod.z.enum(KYC_ACKNOWLEDGEMENT_FIELD_IDS),
  $questionnaireKycFieldId
]);
var KycFieldIdSchema = $kycFieldId;
var $clientExecutedDelivery = obj({
  channel: import_zod.z.literal("CLIENT_EXECUTED"),
  source: import_zod.z.literal("CURRENT_SESSION_INPUTS"),
  allowedFieldIds: import_zod.z.array($kycFieldId).min(1)
}).superRefine((delivery, context2) => {
  if (new Set(delivery.allowedFieldIds).size !== delivery.allowedFieldIds.length) {
    context2.addIssue({
      code: "custom",
      path: ["allowedFieldIds"],
      message: "allowedFieldIds must be unique"
    });
  }
});
var ClientExecutedDeliverySchema = $clientExecutedDelivery;
var $surface = import_zod.z.union([
  obj({
    ...$surfaceBase,
    kind: import_zod.z.literal("KYC_SDK"),
    provider: $kycProvider,
    preferredDocuments: obj({ IDENTITY: $preferredIdentityDocument }).optional()
  }),
  obj({
    ...$surfaceBase,
    kind: import_zod.z.enum(["URL_REDIRECT", "PCI_COMPONENT", "PAY_SHEET", "ACH_COMPONENT", "AUTH_COMPONENT"]),
    provider: $provider,
    delivery: $clientExecutedDelivery.optional()
  })
]);
var SurfaceSchema = $surface;
var $paymentSurface = obj({
  ...$surfaceBase,
  kind: import_zod.z.enum(["URL_REDIRECT", "PCI_COMPONENT", "PAY_SHEET", "ACH_COMPONENT"]),
  provider: $provider,
  delivery: $clientExecutedDelivery.optional()
});
var PaymentSurfaceSchema = $paymentSurface;
var $instructionField = obj({
  id: import_zod.z.string(),
  labelFallback: import_zod.z.string(),
  value: import_zod.z.string()
});
var InstructionFieldSchema = $instructionField;
var $instructions = import_zod.z.union([
  obj({ kind: import_zod.z.literal("DEEPLINK"), url: import_zod.z.string(), appVariants: import_zod.z.array(import_zod.z.string()) }),
  obj({ kind: import_zod.z.literal("QR_IMAGE"), url: import_zod.z.string() }),
  obj({
    kind: import_zod.z.literal("BANK_FIELDS"),
    fields: import_zod.z.array($instructionField),
    expiresAt: import_zod.z.string().optional()
  }),
  obj({ kind: import_zod.z.literal("REFERENCE"), code: import_zod.z.string(), expiresAt: import_zod.z.string() })
]);
var InstructionsSchema = $instructions;
var $selectOption = obj({ id: import_zod.z.string(), labelFallback: import_zod.z.string() });
var SelectOptionSchema = $selectOption;
var $formFieldType = import_zod.z.enum(["TEXT", "DATE", "SELECT", "COUNTRY", "FILE", "HOSTED_LINK"]);
var FormFieldTypeSchema = $formFieldType;
var $formFieldBase = { id: $kycFieldId, labelFallback: import_zod.z.string(), required: import_zod.z.boolean() };
var $formField = import_zod.z.union([
  obj({ ...$formFieldBase, type: import_zod.z.literal("TEXT"), regex: import_zod.z.string().optional() }),
  obj({ ...$formFieldBase, type: import_zod.z.literal("DATE") }),
  obj({ ...$formFieldBase, type: import_zod.z.literal("SELECT"), options: import_zod.z.array($selectOption) }),
  obj({ ...$formFieldBase, type: import_zod.z.literal("COUNTRY") }),
  obj({ ...$formFieldBase, type: import_zod.z.literal("FILE") }),
  obj({ ...$formFieldBase, type: import_zod.z.literal("HOSTED_LINK"), url: import_zod.z.string() })
]);
var FormFieldSchema = $formField;
var $formDescriptor = obj({ formId: import_zod.z.string(), fields: import_zod.z.array($formField) });
var FormDescriptorSchema = $formDescriptor;
var FIELD_SPEC_TYPES = [
  "TEXT",
  "DATE",
  "COUNTRY",
  "FILE",
  "SELECT",
  "HOSTED_LINK",
  "FORM_VALUES",
  "TERMS_ACCEPTANCE"
];
var $fieldSpec = import_zod.z.union([
  obj({
    type: import_zod.z.literal("TEXT"),
    length: import_zod.z.number().optional(),
    regex: import_zod.z.string().optional(),
    labelFallback: import_zod.z.string().optional()
  }),
  obj({ type: import_zod.z.literal("DATE"), labelFallback: import_zod.z.string().optional() }),
  obj({ type: import_zod.z.literal("COUNTRY"), labelFallback: import_zod.z.string().optional() }),
  obj({ type: import_zod.z.literal("FILE"), labelFallback: import_zod.z.string().optional() }),
  obj({
    type: import_zod.z.literal("SELECT"),
    options: import_zod.z.array($selectOption).optional(),
    labelFallback: import_zod.z.string().optional()
  }),
  obj({ type: import_zod.z.literal("HOSTED_LINK"), url: import_zod.z.string(), labelFallback: import_zod.z.string().optional() }),
  obj({ type: import_zod.z.literal("FORM_VALUES") }),
  obj({
    type: import_zod.z.literal("TERMS_ACCEPTANCE"),
    documentUrl: import_zod.z.string(),
    version: import_zod.z.string(),
    labelFallback: import_zod.z.string().optional()
  })
]);
var FieldSpecSchema = $fieldSpec;
var TermsAcceptanceSchema = obj({
  version: import_zod.z.string(),
  acceptedAt: import_zod.z.string()
});
var looksLikeFieldSpec = (value) => typeof value === "object" && value !== null && !Array.isArray(value) && typeof value.type === "string" && FIELD_SPEC_TYPES.includes(value.type);
var $params = import_zod.z.record(import_zod.z.string(), JsonSchema).superRefine((params, ctx) => {
  for (const [key, value] of Object.entries(params)) {
    if (looksLikeFieldSpec(value)) {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message: `params.${key} is FieldSpec-shaped ({type: "\u2026"}). params carry server literals the client spreads verbatim; a spec the client must collect belongs in inputs.`
      });
    }
  }
});
var TransitionParamsSchema = $params;
var $inputs = import_zod.z.record(import_zod.z.string(), $fieldSpec);
var TransitionInputsSchema = $inputs;
var MAX_DELAY_MS = 2 ** 31 - 1;
var MIN_INTERVAL_MS = 500;
var $pollSpec = obj({
  endpoint: $endpoint,
  params: $params.optional(),
  intervalMs: import_zod.z.number().int().min(MIN_INTERVAL_MS).max(MAX_DELAY_MS),
  // Not `.int()` — 1.5 is the recorded factor and a legitimate one. `.finite()` is load-bearing:
  // zod 3's `z.number()` admits Infinity, and `Infinity >= 1` satisfies `.min(1)` on its own.
  backoffFactor: import_zod.z.number().finite().min(1).optional(),
  maxIntervalMs: import_zod.z.number().int().min(MIN_INTERVAL_MS).max(MAX_DELAY_MS).optional(),
  giveUpAfterMs: import_zod.z.number().int().nonnegative().max(MAX_DELAY_MS).optional()
}).superRefine((spec, ctx) => {
  if (spec.backoffFactor !== void 0 && spec.maxIntervalMs === void 0) {
    ctx.addIssue({
      code: "custom",
      path: ["maxIntervalMs"],
      message: "maxIntervalMs is required when backoffFactor is present \u2014 an unbounded backoff grows the interval past 2^31-1, where setTimeout truncates the delay to 0 and the poll hot-loops."
    });
  }
  if (spec.maxIntervalMs !== void 0 && spec.maxIntervalMs < spec.intervalMs) {
    ctx.addIssue({
      code: "custom",
      path: ["maxIntervalMs"],
      message: `maxIntervalMs (${spec.maxIntervalMs}) is below intervalMs (${spec.intervalMs}) \u2014 a ceiling under the starting interval caps the poll at less than its own first delay.`
    });
  }
});
var PollSpecSchema = $pollSpec;
var $reportSpec = obj({
  endpoint: $endpoint,
  params: $params.optional(),
  expects: import_zod.z.array(import_zod.z.string()).optional(),
  result: obj({ type: import_zod.z.literal("KYC_SDK_RESULT"), bodyKey: import_zod.z.string().trim().min(1) }).optional()
});
var ReportSpecSchema = $reportSpec;
var $kycSdkResult = import_zod.z.union([
  obj({ outcome: import_zod.z.literal("COMPLETED") }),
  obj({ outcome: import_zod.z.literal("FAILED"), errorType: import_zod.z.string().trim().min(1) })
]);
var KycSdkResultReportSchema = $kycSdkResult;
var $clientSurfaceTransition = obj({
  id: import_zod.z.string(),
  mode: import_zod.z.literal("CLIENT_SURFACE"),
  report: $reportSpec
});
var $transition = import_zod.z.union([
  obj({
    id: import_zod.z.string(),
    mode: import_zod.z.literal("SUBMIT"),
    endpoint: $endpoint,
    params: $params.optional(),
    inputs: $inputs.optional(),
    labelFallback: import_zod.z.string().optional()
  }),
  obj({ id: import_zod.z.string(), mode: import_zod.z.literal("AWAIT"), poll: $pollSpec }),
  $clientSurfaceTransition
]);
var TransitionSchema = $transition;
var $preparedPayment = obj({
  quoteRef: import_zod.z.string().trim().min(1),
  surface: $paymentSurface,
  transition: $clientSurfaceTransition
});
var PreparedPaymentSchema = $preparedPayment;
var $quoteState = obj({
  kind: import_zod.z.literal("QUOTE"),
  quote: $quote,
  limits: $quoteLimits,
  helper: import_zod.z.string().optional(),
  /** Present when the provider's component is the primary CTA, inline on the entry screen. */
  surface: $surface.optional(),
  error: $failureReason.optional()
});
var QuoteStateSchema = $quoteState;
var $funAuthState = obj({
  kind: import_zod.z.literal("FUN_AUTH"),
  channel: import_zod.z.enum(["EMAIL_OTP", "SMS_OTP"]),
  phase: import_zod.z.enum(["IDENTIFIER", "CODE", "VERIFIED"]),
  expiresAtMs: import_zod.z.number().int().nonnegative().optional(),
  resendAvailableAtMs: import_zod.z.number().int().nonnegative().optional(),
  attemptsRemaining: import_zod.z.number().int().nonnegative().optional(),
  error: $failureReason.optional()
});
var FunAuthStateSchema = $funAuthState;
var $fiatSession = obj({
  accessToken: import_zod.z.string().min(1),
  refreshHandle: import_zod.z.string().min(1),
  expiresAtMs: import_zod.z.number().int().nonnegative()
});
var FiatSessionSchema = $fiatSession;
var $sessionAuthState = obj({
  kind: import_zod.z.literal("SESSION_AUTH"),
  channel: import_zod.z.enum(["EMAIL_OTP", "SMS_OTP", "PROVIDER_RENDERED"]),
  surface: $surface.optional(),
  error: $failureReason.optional()
});
var SessionAuthStateSchema = $sessionAuthState;
var $kycCaptureState = obj({
  kind: import_zod.z.literal("KYC"),
  phase: import_zod.z.literal("CAPTURE"),
  quote: $quote.optional(),
  surface: $surface,
  correctionReason: import_zod.z.string().min(1).max(1024).optional(),
  error: $failureReason.optional()
});
var KycCaptureStateSchema = $kycCaptureState;
var $kycInputRequiredState = obj({
  kind: import_zod.z.literal("KYC"),
  phase: import_zod.z.literal("INPUT_REQUIRED"),
  quote: $quote.optional(),
  form: $formDescriptor,
  error: $failureReason.optional()
});
var KycInputRequiredStateSchema = $kycInputRequiredState;
var $kycReviewDuration = import_zod.z.discriminatedUnion("duration", [
  obj({ duration: import_zod.z.literal("BRIEF"), holdMs: import_zod.z.number().int().positive().max(6e5) }),
  obj({ duration: import_zod.z.literal("EXTENDED") })
]);
var KycReviewDurationSchema = $kycReviewDuration;
var $kycNoActionRequiredFields = {
  kind: import_zod.z.literal("KYC"),
  phase: import_zod.z.literal("NO_ACTION_REQUIRED"),
  quote: $quote.optional(),
  retryAfter: import_zod.z.string().optional(),
  failureReason: $failureReason.optional(),
  error: $failureReason.optional()
};
var $kycNoActionRequiredState = import_zod.z.union([
  obj({ ...$kycNoActionRequiredFields, reason: import_zod.z.literal("IN_REVIEW"), review: $kycReviewDuration.optional() }),
  obj({ ...$kycNoActionRequiredFields, reason: import_zod.z.enum(["ON_HOLD", "REJECTED"]) })
]);
var KycNoActionRequiredStateSchema = $kycNoActionRequiredState;
var $pendingOrderState = obj({
  kind: import_zod.z.literal("PENDING_ORDER"),
  order: $orderRef,
  error: $failureReason.optional()
});
var PendingOrderStateSchema = $pendingOrderState;
var $blockedReason = import_zod.z.enum([
  "REGION_UNSUPPORTED",
  "ASSET_UNSUPPORTED",
  "ALL_PROVIDERS_DECLINED",
  "AMOUNT_UNSERVABLE",
  "CLIENT_UPGRADE_REQUIRED"
]);
var BlockedReasonSchema = $blockedReason;
var $blockedState = obj({
  kind: import_zod.z.literal("BLOCKED"),
  reason: $blockedReason,
  retryAfter: import_zod.z.string().nullable().optional(),
  error: $failureReason.optional()
});
var BlockedStateSchema = $blockedState;
var $paymentCaptureState = obj({
  kind: import_zod.z.literal("PAYMENT"),
  phase: import_zod.z.literal("CAPTURE"),
  surface: $surface,
  error: $failureReason.optional()
});
var PaymentCaptureStateSchema = $paymentCaptureState;
var $paymentInstructState = obj({
  kind: import_zod.z.literal("PAYMENT"),
  phase: import_zod.z.literal("INSTRUCT"),
  orderId: import_zod.z.string().optional(),
  instructions: $instructions,
  error: $failureReason.optional()
});
var PaymentInstructStateSchema = $paymentInstructState;
var $orderAwaitingConfirmationState = obj({
  kind: import_zod.z.literal("ORDER"),
  phase: import_zod.z.literal("AWAITING_CONFIRMATION"),
  quote: $quote,
  error: $failureReason.optional()
});
var OrderAwaitingConfirmationStateSchema = $orderAwaitingConfirmationState;
var $orderCreatedState = obj({
  kind: import_zod.z.literal("ORDER"),
  phase: import_zod.z.literal("CREATED"),
  order: $orderSummary.optional(),
  status: $orderStatus,
  statusHistory: import_zod.z.array($statusHistoryEntry).optional(),
  tx: $tx.optional(),
  refund: $refund.optional(),
  failureReason: $failureReason.optional(),
  error: $failureReason.optional()
});
var OrderCreatedStateSchema = $orderCreatedState;
var $deliveryState = import_zod.z.discriminatedUnion("state", [
  obj({ kind: import_zod.z.literal("DELIVERY"), state: import_zod.z.literal("PENDING") }),
  obj({ kind: import_zod.z.literal("DELIVERY"), state: import_zod.z.literal("SUCCEEDED"), txHash: import_zod.z.string().min(1) }),
  obj({ kind: import_zod.z.literal("DELIVERY"), state: import_zod.z.literal("FAILED") })
]);
var DeliveryStateSchema = $deliveryState;
var $providerBoundFlowState = import_zod.z.union([
  $quoteState,
  $sessionAuthState,
  $kycCaptureState,
  $kycInputRequiredState,
  $kycNoActionRequiredState,
  $pendingOrderState,
  $paymentCaptureState,
  $paymentInstructState,
  $orderAwaitingConfirmationState,
  $orderCreatedState,
  $deliveryState
]);
var $flowState = import_zod.z.union([$providerBoundFlowState, $funAuthState, $blockedState]);
var FlowStateSchema = $flowState;
var $nonBlank = import_zod.z.string().refine((value) => value.trim().length > 0, "must not be blank");
var $isoInstant = import_zod.z.string().datetime({ offset: true });
var $errorBodyFields = { errorMsg: import_zod.z.string(), reqId: import_zod.z.string().optional() };
var $termsStage = import_zod.z.enum(["CHECKOUT", "KYC"]);
var $termsDocument = obj({
  id: $nonBlank,
  kind: import_zod.z.enum(["PROVIDER_TERMS", "FUN_KYC_COLLECTION", "PROVIDER_KYC_SHARING"]),
  stage: $termsStage,
  version: $nonBlank,
  contentDigest: $nonBlank,
  links: import_zod.z.array(obj({ label: $nonBlank, url: import_zod.z.string().regex(/^https:\/\/\S+$/, "must be an https URL") })).min(1)
});
var TermsDocumentSchema = $termsDocument;
var hasUniqueIds = (ids) => new Set(ids).size === ids.length;
var $termsAcceptance = obj({
  documentId: $nonBlank,
  version: $nonBlank,
  contentDigest: $nonBlank,
  acceptedAt: $isoInstant
});
var TermsDocumentAcceptanceSchema = $termsAcceptance;
var $termsRequest = obj({
  provider: $provider,
  acceptances: import_zod.z.array($termsAcceptance).min(1).refine((acceptances) => hasUniqueIds(acceptances.map((acceptance) => acceptance.documentId)), "each document is accepted once")
});
var FiatTermsRequestSchema = $termsRequest;
var $termsResponse = obj({ recorded: import_zod.z.array($nonBlank) });
var FiatTermsResponseSchema = $termsResponse;
var $termsErrorBody = obj({
  errorCode: $nonBlank,
  ...$errorBodyFields,
  reason: import_zod.z.enum(["STALE_TERMS", "INVALID_REQUEST", "RATE_LIMITED", "PROVIDER_UNAVAILABLE"]),
  recovery: import_zod.z.enum(["RETRY", "REQUOTE", "NONE"])
});
var FiatTermsErrorBodySchema = $termsErrorBody;
var $evmAddress = import_zod.z.custom(
  (value) => typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value),
  "must be an EVM address: 0x and 40 hex digits"
);
var $solanaAddress = import_zod.z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "must be a Solana base58 address");
var $evmDestinationAsset = obj({
  vm: import_zod.z.literal("EVM"),
  chainId: import_zod.z.number().int().positive(),
  asset: import_zod.z.discriminatedUnion("kind", [
    obj({
      kind: import_zod.z.literal("FUNGIBLE"),
      token: import_zod.z.discriminatedUnion("type", [
        obj({ type: import_zod.z.literal("NATIVE") }),
        obj({ type: import_zod.z.literal("ERC20"), address: $evmAddress })
      ])
    }),
    obj({
      kind: import_zod.z.literal("NON_FUNGIBLE"),
      address: $evmAddress,
      tokenId: import_zod.z.string().regex(/^(0|[1-9]\d*)$/, "must be a decimal integer")
    })
  ])
});
var $solanaDestinationAsset = obj({
  vm: import_zod.z.literal("SOLANA"),
  asset: import_zod.z.discriminatedUnion("kind", [
    obj({
      kind: import_zod.z.literal("FUNGIBLE"),
      token: import_zod.z.discriminatedUnion("type", [
        obj({ type: import_zod.z.literal("NATIVE") }),
        obj({ type: import_zod.z.literal("SPL"), address: $solanaAddress })
      ])
    }),
    obj({ kind: import_zod.z.literal("NON_FUNGIBLE"), address: $solanaAddress })
  ])
});
var $destinationAsset = import_zod.z.discriminatedUnion("vm", [$evmDestinationAsset, $solanaDestinationAsset]);
var DestinationAssetSchema = $destinationAsset;
var $decimalAmount = import_zod.z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, "must be a decimal string");
var compareDecimals = (left, right) => {
  const [leftWhole = "", leftFraction = ""] = left.split(".");
  const [rightWhole = "", rightFraction = ""] = right.split(".");
  if (leftWhole.length !== rightWhole.length) return leftWhole.length - rightWhole.length;
  const width = Math.max(leftFraction.length, rightFraction.length);
  const leftDigits = leftWhole + leftFraction.padEnd(width, "0");
  const rightDigits = rightWhole + rightFraction.padEnd(width, "0");
  return leftDigits < rightDigits ? -1 : leftDigits > rightDigits ? 1 : 0;
};
var $countryCode = import_zod.z.enum(Object.keys(CountryCode));
var $routingProvider = $provider.extract(["TRANSAK", "BANXA", "MOONPAY", "MOONPAY_GUEST", "STRIPE", "COINBASE"]);
var $optionalGeoField = import_zod.z.union([$nonBlank, import_zod.z.literal("")]).optional();
var US_REGION_REQUIRED = "a US buyer needs a US state code as region";
var hasUsRegion = (country, region) => country !== "US" || UsStateCodeSchema.safeParse(region).success;
var $routingTableProviderInputs = obj({
  MOONPAY: obj({ accessToken: $nonBlank.optional() }).optional()
});
var $routingTableRequest = obj({
  fiatCurrencyCode: import_zod.z.enum(FIAT_CURRENCY_CODES).optional(),
  cryptoCurrencyCode: $nonBlank,
  chainId: $nonBlank,
  country: $countryCode,
  region: $optionalGeoField,
  // Duplicates are allowed; the response lists each method once.
  methods: import_zod.z.array(import_zod.z.enum(PAYMENT_METHOD_CATEGORIES)).min(1),
  providers: $routingTableProviderInputs.optional(),
  destinationAsset: $destinationAsset.optional(),
  depositAddress: $nonBlank.optional()
}).refine((request2) => hasUsRegion(request2.country, request2.region), { message: US_REGION_REQUIRED, path: ["region"] });
var FiatRoutingTableRequestSchema = $routingTableRequest;
var $routingTableProvider = obj({
  provider: $routingProvider,
  next: import_zod.z.enum(["READY", "AUTH", "DECLARATIVE_KYC", "DOCUMENTARY_KYC", "PENDING_REVIEW"]),
  visibility: import_zod.z.enum(["COMPLETE", "PARTIAL", "AUTH_GATED"]),
  currentLimit: $decimalAmount.nullable()
});
var $routingTableInterval = obj({
  min: $decimalAmount,
  max: $decimalAmount,
  providers: import_zod.z.array($routingTableProvider).min(1).refine((providers) => hasUniqueIds(providers.map((entry) => entry.provider)), "each provider is listed once")
}).refine((interval) => compareDecimals(interval.min, interval.max) <= 0, { message: "min must not exceed max", path: ["max"] });
var $routingTableMethod = obj({
  method: import_zod.z.enum(PAYMENT_METHOD_CATEGORIES),
  unavailableReason: import_zod.z.enum(["USER_LIMIT", "KYC_REJECTED", "PROVIDER_OUTAGE", "NOT_SERVED"]).optional(),
  intervals: import_zod.z.array($routingTableInterval).superRefine((intervals, context2) => {
    intervals.forEach((interval, index) => {
      const previous = intervals[index - 1];
      if (previous !== void 0 && compareDecimals(interval.min, previous.max) <= 0) {
        context2.addIssue({ code: "custom", path: [index, "min"], message: "intervals are sorted and do not overlap" });
      }
    });
  })
}).refine((method) => method.unavailableReason === void 0 || method.intervals.length === 0, {
  message: "unavailableReason only with no interval",
  path: ["unavailableReason"]
});
var $routingTableResponse = obj({
  expiresAt: $isoInstant,
  methods: import_zod.z.array($routingTableMethod).refine((methods) => hasUniqueIds(methods.map((entry) => entry.method)), "each method is listed once"),
  feeSubsidy: obj({ subsidized: import_zod.z.boolean() }).optional()
});
var FiatRoutingTableResponseSchema = $routingTableResponse;
var $routingQuoteTermsShape = {
  fiatCurrency: import_zod.z.enum(FIAT_CURRENCY_CODES),
  fiatAmount: $decimalAmount.refine((amount) => Number(amount) > 0, "must be positive"),
  cryptoCurrencyCode: $nonBlank,
  chainId: $nonBlank,
  paymentMethodId: import_zod.z.enum(PAYMENT_METHOD_CATEGORIES),
  geo: obj({ alpha2: $countryCode, region: $optionalGeoField, ip: $optionalGeoField, city: import_zod.z.string().optional() }).refine(
    (geo) => hasUsRegion(geo.alpha2, geo.region),
    { message: US_REGION_REQUIRED, path: ["region"] }
  ),
  prepareSessionAuth: import_zod.z.boolean().optional(),
  routingOverrides: obj({ providers: import_zod.z.array($routingProvider) }).optional(),
  destinationAsset: $destinationAsset.optional(),
  depositAddress: $nonBlank.optional()
};
var $routingQuoteTerms = obj($routingQuoteTermsShape);
var FiatRoutingQuoteTermsSchema = $routingQuoteTerms;
var $routingQuoteRequest = import_zod.z.union([
  obj({
    ...$routingQuoteTermsShape,
    providers: import_zod.z.array($routingProvider).min(1).refine((providers) => hasUniqueIds(providers), "each provider is listed once")
  }),
  obj({ ...$routingQuoteTermsShape, provider: $routingProvider })
]).refine(
  (request2) => {
    const allowed = request2.routingOverrides?.providers;
    const selected = "providers" in request2 ? request2.providers : [request2.provider];
    return allowed === void 0 || selected.every((provider) => allowed.includes(provider));
  },
  { message: "requested providers must be allowed by routingOverrides", path: ["routingOverrides"] }
);
var FiatRoutingQuoteRequestSchema = $routingQuoteRequest;
var $routingServiceableRange = obj({ min: $money, max: $money, userMax: $money.nullable().optional() });
var $noRouteFields = {
  ...$errorBodyFields,
  errorCode: import_zod.z.literal("FiatNoRouteError"),
  serviceableRanges: import_zod.z.array($routingServiceableRange),
  retryable: import_zod.z.boolean()
};
var $routingNoRouteErrorBody = import_zod.z.union([
  obj({ ...$noRouteFields, reason: import_zod.z.enum(["NO_CANDIDATE", "PROVIDER_DECLINED", "PROVIDER_OUTAGE", "KYC_REJECTED"]) }),
  obj({ ...$noRouteFields, reason: import_zod.z.literal("USER_LIMIT"), code: import_zod.z.literal("LIMITS_EXCEEDED"), recovery: import_zod.z.literal("REQUOTE") })
]);
var $amountErrorFields = { ...$errorBodyFields, fiatCurrencyCode: import_zod.z.enum(FIAT_CURRENCY_CODES) };
var $routingAmountErrorBody = import_zod.z.union([
  obj({ ...$amountErrorFields, errorCode: import_zod.z.literal("FiatAmountBelowMinimumError"), minFiatAmount: $decimalAmount }),
  obj({ ...$amountErrorFields, errorCode: import_zod.z.literal("FiatAmountAboveMaximumError"), maxFiatAmount: $decimalAmount })
]);
var $routingRateLimitedErrorBody = obj({
  ...$errorBodyFields,
  errorCode: import_zod.z.literal("TooManyRequestsError"),
  retryAfterSeconds: import_zod.z.number().int().positive().optional()
});
var ROUTING_ERROR_CODES = [
  "FiatNoRouteError",
  "FiatAmountBelowMinimumError",
  "FiatAmountAboveMaximumError",
  "TooManyRequestsError"
];
var $routingFaultErrorBody = obj({
  ...$errorBodyFields,
  errorCode: $nonBlank.refine((code) => !ROUTING_ERROR_CODES.includes(code), "this errorCode carries its own fields")
});
var $routingTableErrorBody = import_zod.z.union([$routingRateLimitedErrorBody, $routingFaultErrorBody]);
var FiatRoutingTableErrorBodySchema = $routingTableErrorBody;
var $routingQuoteErrorBody = import_zod.z.union([$routingNoRouteErrorBody, $routingAmountErrorBody, $routingFaultErrorBody]);
var FiatRoutingQuoteErrorBodySchema = $routingQuoteErrorBody;
var $fiatGeo = obj({ alpha2: import_zod.z.string().regex(/^[A-Z]{2}$/), region: $nonBlank.optional(), ip: $nonBlank.optional() });
var FiatGeoSchema = $fiatGeo;
var $nextRequest = import_zod.z.object({
  provider: $provider,
  action: $nonBlank,
  geo: $fiatGeo,
  destinationAsset: $destinationAsset.optional(),
  depositAddress: $nonBlank.optional()
}).catchall(import_zod.z.unknown());
var FiatNextRequestSchema = $nextRequest;
var $authStartRequest = import_zod.z.union([obj({ email: $nonBlank }), obj({ verificationRef: $nonBlank })]);
var FiatAuthStartRequestSchema = $authStartRequest;
var $authVerifyRequest = obj({ verificationRef: $nonBlank, otpCode: import_zod.z.string().regex(/^\d{6}$/, "must be six digits") });
var FiatAuthVerifyRequestSchema = $authVerifyRequest;
var $authRefreshRequest = obj({ refreshHandle: $nonBlank });
var FiatAuthRefreshRequestSchema = $authRefreshRequest;
var $authRefreshResponse = obj({ session: $fiatSession });
var FiatAuthRefreshResponseSchema = $authRefreshResponse;
var $authRevokeRequest = obj({ refreshHandle: $nonBlank });
var FiatAuthRevokeRequestSchema = $authRevokeRequest;
var $stepResponseBase = {
  transitions: import_zod.z.array($transition),
  routingSessionRef: import_zod.z.string().optional(),
  providerAuthToken: obj({
    clientSecret: import_zod.z.string(),
    expiresAt: import_zod.z.string()
  }).optional(),
  orderId: import_zod.z.string().optional(),
  refreshLimits: import_zod.z.literal(true).optional()
};
var $providerBoundStepResponse = obj({
  ...$stepResponseBase,
  state: $providerBoundFlowState,
  provider: $provider,
  preparedPayment: $preparedPayment.optional(),
  handoff: obj({ provider: $provider }).optional()
}).superRefine((response, context2) => {
  if (response.preparedPayment !== void 0 && response.preparedPayment.surface.provider !== response.provider) {
    context2.addIssue({
      code: "custom",
      path: ["preparedPayment", "surface", "provider"],
      message: "preparedPayment.surface.provider must match the response provider"
    });
  }
  if (response.handoff !== void 0 && response.handoff.provider !== response.provider) {
    context2.addIssue({
      code: "custom",
      path: ["handoff", "provider"],
      message: "handoff.provider must match the response provider"
    });
  }
  if (response.handoff !== void 0 && response.state.kind !== "QUOTE") {
    context2.addIssue({
      code: "custom",
      path: ["handoff"],
      message: "only a QUOTE response hands off to a provider"
    });
  }
  if (response.handoff !== void 0 && response.transitions.length > 0) {
    context2.addIssue({
      code: "custom",
      path: ["transitions"],
      message: "a handoff response carries no transitions"
    });
  }
});
var $blockedStepResponse = obj({
  ...$stepResponseBase,
  state: $blockedState,
  provider: $provider.optional()
});
var FUN_AUTH_TRANSITIONS_BY_PHASE = {
  IDENTIFIER: ["start"],
  CODE: ["verify", "resend"],
  VERIFIED: []
};
var $funAuthStepResponse = obj({
  ...$stepResponseBase,
  state: $funAuthState,
  provider: $provider.optional(),
  session: $fiatSession.optional()
}).superRefine((response, context2) => {
  const { phase } = response.state;
  if (response.session !== void 0 && phase !== "VERIFIED") {
    context2.addIssue({ code: "custom", path: ["session"], message: "only a FUN_AUTH response in phase VERIFIED carries session" });
  }
  const allowed = FUN_AUTH_TRANSITIONS_BY_PHASE[phase];
  response.transitions.forEach((transition, index) => {
    if (!allowed.includes(transition.id)) {
      context2.addIssue({
        code: "custom",
        path: ["transitions", index, "id"],
        message: `FUN_AUTH phase ${phase} offers ${allowed.join(" or ") || "no transitions"}, not "${transition.id}"`
      });
    }
  });
});
var $stepResponse = import_zod.z.union([$providerBoundStepResponse, $funAuthStepResponse, $blockedStepResponse]);
var FiatStepResponseSchema = $stepResponse;

// package.json
var version = "0.49.0";

// src/table.ts
var TABLE_VERSION = version;
var TERMINAL_ORDER_STATUSES = [
  "SETTLED",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
  "REFUNDED"
];
var FUN_AUTH_ERROR_CODES = [
  "INVALID_EMAIL",
  "BAD_CODE",
  "CODE_EXPIRED",
  "TOO_MANY_ATTEMPTS",
  "OTP_DISPATCH_THROTTLED"
];
var KYC_ANY = [
  "KYC/CAPTURE",
  "KYC/INPUT_REQUIRED",
  "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
  "KYC/NO_ACTION_REQUIRED:ON_HOLD",
  "KYC/NO_ACTION_REQUIRED:REJECTED"
];
var TRANSITION_TABLE = {
  QUOTE: {
    key: "QUOTE",
    kind: "QUOTE",
    screens: [1],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "continue",
        mode: "SUBMIT",
        endpoint: "POST /fiat/session",
        when: "no valid provider session token (own-tables check)"
      },
      {
        id: "open_session",
        mode: "SUBMIT",
        endpoint: "POST /fiat/payment-session",
        when: "returning user, session + KYC valid, capture-first rail \u2014 the method authorises before any order exists",
        note: "Returns PAYMENT{CAPTURE} carrying the Surface. Without this entry the capture-first rail has no legal way in: a transition-following client takes POST /fiat/orders instead, and the backend refuses that when the provider declares the capture-first capability and no authorisation is present. Named open_session per the Fiat Contract 0.7 doc, which adds quote-time-minted surface rows beside it."
      },
      {
        id: "continue",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders",
        when: "returning user, session + KYC valid, order-first rail \u2014 the quote screen doubles as review",
        note: "Narrowed to the order-first rail: on a capture-first method the order cannot be created before the payment is authorised, so the sibling payment-session entry is the one that applies."
      },
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/orders",
        when: "capture-then-order rail whose session is minted at quote time (inline pay sheet)",
        note: "The 0.7 row that makes the single-screen Apple Pay design legal: the surface rides QUOTE, the provider component IS the primary CTA, and its result creates the order. Apple policy forbids a visible step between an Apple-branded tap and the sheet, and TransakApplePay exposes no programmatic trigger, so a two-step via payment-session cannot serve this rail. Requires state.surface (\u03942)."
      },
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/orders/:id/surface-result",
        when: "order-then-capture rail whose provider order was created with the quote-time session",
        note: "Same quote-time placement, other topology: the order already exists, so the surface reports against it rather than creating one."
      }
    ],
    mayReturn: [
      "SESSION_AUTH",
      ...KYC_ANY,
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "PENDING_ORDER",
      "ORDER/AWAITING_CONFIRMATION",
      "ORDER/CREATED",
      "BLOCKED"
    ],
    terminal: false,
    notes: [
      "Re-quote on amount change is a client-local event, not a transition. A new quote carries a new surface; the client remounts the adapter rather than reusing the old session.",
      "A surface on QUOTE and a SUBMIT to the same endpoint may not coexist \u2014 two paths to one order. assertLegalEmission enforces it; the server picks one per rail.",
      `Both PAYMENT states are reachable directly from QUOTE: the FE doc canvas draws S1 \u2192 S5 (card, capture-first) and S1 \u2192 S6 (bank). This entry was first ported from the FE doc's bindings table, whose "May receive back" column omits both \u2014 the canvas is the correct source of the two.`,
      'TODO(open-decision): contract \xA7"Proposal: remove PENDING_ORDER" would additionally have QUOTE return ORDER{CREATED} for an active order. That decision does not gate the PAYMENT edges above.'
    ]
  },
  FUN_AUTH: {
    key: "FUN_AUTH",
    kind: "FUN_AUTH",
    screens: [],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      { id: "start", mode: "SUBMIT", endpoint: "POST /fiat/auth", when: "phase IDENTIFIER \u2014 inputs { email: TEXT }" },
      {
        id: "verify",
        mode: "SUBMIT",
        endpoint: "POST /fiat/auth/verify",
        when: "phase CODE \u2014 params { verificationRef }, inputs { otpCode: TEXT length 6, regex ^\\d{6}$ }"
      },
      {
        id: "resend",
        mode: "SUBMIT",
        endpoint: "POST /fiat/auth",
        when: "phase CODE, once resendAvailableAtMs has passed \u2014 params { verificationRef }"
      }
    ],
    mayReturn: ["FUN_AUTH"],
    terminal: false,
    notes: [
      "Answered, in phase IDENTIFIER with the start transition, to the entry quote request (POST /fiat/routing/quote or POST /fiat/quote) of a Fun-run login that holds no session; no state returns it, and a customer-asserted identity never sees it.",
      "VERIFIED carries no transitions. A Fun-run login also carries `session` on the envelope; the SDK then starts the flow at QUOTE with `accessToken` as Bearer.",
      "Not in the FE doc, so no screen number: the client renders it on its contact and OTP screens.",
      "Every FUN_AUTH error is category USER_ERROR with a code from FUN_AUTH_ERROR_CODES. A wrong code re-enters CODE with BAD_CODE and a lower attemptsRemaining; TOO_MANY_ATTEMPTS and CODE_EXPIRED drop the challenge and offer resend; OTP_DISPATCH_THROTTLED re-enters with resendAvailableAtMs set.",
      "resend carries the verificationRef the client holds, even one the server has dropped (expired, too many attempts); the server starts a fresh challenge for the same email while it still remembers the challenge (its code expiry plus a short grace); once it is forgotten the answer is IDENTIFIER with CODE_EXPIRED.",
      "POST /fiat/auth/refresh and /revoke are called by the SDK session store, never offered as transitions."
    ]
  },
  SESSION_AUTH: {
    key: "SESSION_AUTH",
    kind: "SESSION_AUTH",
    screens: [2],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      { id: "start", mode: "SUBMIT", endpoint: "POST /fiat/session" },
      { id: "verify", mode: "SUBMIT", endpoint: "POST /fiat/session/verify" },
      {
        id: "report_auth_result",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/session/verify",
        note: "Reports a provider-owned authentication surface result; the backend alone reassesses and selects the next state."
      }
    ],
    mayReturn: [
      "SESSION_AUTH",
      "QUOTE",
      "PAYMENT/CAPTURE",
      ...KYC_ANY,
      "ORDER/AWAITING_CONFIRMATION",
      "PENDING_ORDER"
    ],
    terminal: false,
    notes: [
      "A bad code re-enters this same state with error {category: USER_ERROR, code: BAD_CODE} \u2014 banner, not a screen change.",
      "No resend affordance is specified in either doc (known gap, FE doc Screen 2).",
      "A provider-owned surface may declare client-executed delivery from allowlisted CURRENT_SESSION_INPUTS only.",
      "A provider-owned authentication surface reports through CLIENT_SURFACE; it is not a user-entered OTP submission."
    ]
  },
  "KYC/CAPTURE": {
    key: "KYC/CAPTURE",
    kind: "KYC",
    phase: "CAPTURE",
    screens: [8],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "refresh_sdk_token",
        mode: "SUBMIT",
        endpoint: "POST /fiat/kyc/sdk-token",
        note: "Refreshes an expired SDK credential and returns a new KYC/CAPTURE state."
      },
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/kyc/capture",
        note: "Reports SDK submission; provider eligibility is re-evaluated through quote orchestration."
      }
    ],
    mayReturn: [
      "KYC/CAPTURE",
      "KYC/INPUT_REQUIRED",
      "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
      "KYC/NO_ACTION_REQUIRED:ON_HOLD",
      "KYC/NO_ACTION_REQUIRED:REJECTED",
      "QUOTE",
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "ORDER/AWAITING_CONFIRMATION"
    ],
    terminal: false,
    notes: [
      "Carries the handshake-gated KYC_SDK surface; provider selects the identity-vendor adapter.",
      "SDK completion or failure is only a launch report; eligibility is re-read authoritatively by the backend."
    ]
  },
  "KYC/INPUT_REQUIRED": {
    key: "KYC/INPUT_REQUIRED",
    kind: "KYC",
    phase: "INPUT_REQUIRED",
    screens: [3],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      { id: "submit_round", mode: "SUBMIT", endpoint: "POST /fiat/kyc/form" }
    ],
    mayReturn: [
      "KYC/CAPTURE",
      "KYC/INPUT_REQUIRED",
      "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
      "KYC/NO_ACTION_REQUIRED:ON_HOLD",
      "KYC/NO_ACTION_REQUIRED:REJECTED",
      "QUOTE",
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "ORDER/AWAITING_CONFIRMATION"
    ],
    terminal: false,
    notes: [
      "One POST per round; conditional requirements may open another round.",
      "FILE fields use POST /fiat/kyc/document to obtain or report a direct provider/vendor upload; document bytes never transit Fun. The harness owns this auxiliary path, not a transition.",
      "Hosted KYC links arrive as HOSTED_LINK form fields, not as a Surface."
    ]
  },
  "KYC/NO_ACTION_REQUIRED:IN_REVIEW": {
    key: "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
    kind: "KYC",
    phase: "NO_ACTION_REQUIRED",
    reason: "IN_REVIEW",
    screens: [9],
    docStatus: "SPECIFIED",
    allowedTransitions: [{ id: "poll", mode: "AWAIT", endpoint: "GET /fiat/quotes/:quoteRef" }],
    mayReturn: [
      "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
      "KYC/CAPTURE",
      "KYC/INPUT_REQUIRED",
      "KYC/NO_ACTION_REQUIRED:ON_HOLD",
      "KYC/NO_ACTION_REQUIRED:REJECTED",
      "QUOTE",
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "ORDER/AWAITING_CONFIRMATION"
    ],
    terminal: false,
    notes: [
      "Documented poll shape: intervalMs 3000, backoffFactor 1.5, maxIntervalMs 10000, giveUpAfterMs 90000.",
      "Pre-order giveUp destination is a design gap (FE doc Screen 9) \u2014 client-local, no contract impact."
    ]
  },
  "KYC/NO_ACTION_REQUIRED:ON_HOLD": {
    key: "KYC/NO_ACTION_REQUIRED:ON_HOLD",
    kind: "KYC",
    phase: "NO_ACTION_REQUIRED",
    reason: "ON_HOLD",
    screens: [10],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: KYC_ANY,
    terminal: false,
    notes: [
      "THE proof that terminality is not array emptiness: transitions [] and NOT terminal. Re-entry after retryAfter re-derives."
    ]
  },
  "KYC/NO_ACTION_REQUIRED:REJECTED": {
    key: "KYC/NO_ACTION_REQUIRED:REJECTED",
    kind: "KYC",
    phase: "NO_ACTION_REQUIRED",
    reason: "REJECTED",
    screens: [11],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: [],
    terminal: true,
    notes: [
      "Only explicit non-retryable outcomes reach REJECTED. Correctable failures return CAPTURE or INPUT_REQUIRED; provider-specific declines re-route before becoming user rejection."
    ]
  },
  PENDING_ORDER: {
    key: "PENDING_ORDER",
    kind: "PENDING_ORDER",
    screens: [12],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      { id: "resume", mode: "SUBMIT", endpoint: "GET /fiat/orders/:id" },
      { id: "cancel", mode: "SUBMIT", endpoint: "POST /fiat/orders/:id/cancel" }
    ],
    mayReturn: ["ORDER/CREATED", "QUOTE"],
    terminal: false,
    notes: [
      'TODO(open-decision): removal proposed (contract \xA7"Proposal: remove PENDING_ORDER"); FE Screen 12 is frozen until it lands. The two-call resume-or-cancel shape is why transitions is an array.',
      "SUBMIT is a user-fired request, not a POST: GET /fiat/orders/:id under SUBMIT is legal."
    ]
  },
  BLOCKED: {
    key: "BLOCKED",
    kind: "BLOCKED",
    screens: [16],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: [],
    terminal: true,
    notes: [
      "Region/compliance block \u2014 fires from anywhere (contract \xA7Global transitions). retryAfter renders a dated comeback; null = none.",
      "TODO(open-decision): v1 scope assumed yes for FCA/UK \u2014 product confirm (FE doc open question 4)."
    ]
  },
  "PAYMENT/CAPTURE": {
    key: "PAYMENT/CAPTURE",
    kind: "PAYMENT",
    phase: "CAPTURE",
    screens: [5],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/orders",
        when: "capture-then-order topology (Transak headless cards: the component yields requestId, an input to createOrder)",
        note: 'TODO(open-decision): report target per card topology \u2014 Transak ask (contract Flow A: "confirm before freeze").'
      },
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/orders/:id/surface-result",
        when: "the order already exists (order-then-capture topology)",
        note: 'Endpoint per contract \xA7Endpoints ("client reports CLIENT_SURFACE outcome; backend reconciles vs webhooks").'
      }
    ],
    mayReturn: ["ORDER/CREATED", "PAYMENT/CAPTURE", "QUOTE"],
    terminal: false,
    notes: [
      "Decline re-entry: same state, fresh surface.session, error {category: PAYMENT_DECLINED, retryable: true, recovery: RETRY_PAYMENT}.",
      "The Surface is carried in state, never in the transition (\u03942, single-carry)."
    ]
  },
  "PAYMENT/INSTRUCT": {
    key: "PAYMENT/INSTRUCT",
    kind: "PAYMENT",
    phase: "INSTRUCT",
    screens: [6],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "confirm_paid",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders/:id/confirm-payment"
      },
      {
        id: "cancel",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders/:id/cancel",
        when: "in-wizard cancel placement wins",
        note: "TODO(open-decision): cancel placement \u2014 in-wizard vs an out-of-wizard pending-orders surface (FE doc open questions 1+2). Per-rail cancel eligibility is contract OQ7."
      }
    ],
    mayReturn: ["ORDER/CREATED"],
    terminal: false,
    notes: [
      "No instructions re-issue endpoint exists; expired-instructions recovery is unenumerated. TODO(open-decision): contract OQ7.",
      "Async instructions (PREPARING) are deliberately not in v1 \u2014 Transak returns bank details synchronously."
    ]
  },
  "ORDER/AWAITING_CONFIRMATION": {
    key: "ORDER/AWAITING_CONFIRMATION",
    kind: "ORDER",
    phase: "AWAITING_CONFIRMATION",
    screens: [4],
    docStatus: "SPECIFIED",
    allowedTransitions: [{ id: "confirm", mode: "SUBMIT", endpoint: "POST /fiat/orders" }],
    mayReturn: [
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "ORDER/CREATED",
      "QUOTE",
      "PENDING_ORDER"
    ],
    terminal: false,
    notes: [
      "Bank rails only \u2014 card rails skip it, the pay sheet was the confirmation.",
      "Carries a refreshed quote: the price may have drifted during KYC."
    ]
  },
  "ORDER/CREATED": {
    key: "ORDER/CREATED",
    kind: "ORDER",
    phase: "CREATED",
    screens: [7, 13, 14, 15],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "poll",
        mode: "AWAIT",
        endpoint: "GET /fiat/orders/:id",
        when: "status is non-terminal and the request carried no destinationAsset",
        note: "For older clients only: an order whose request carried a destinationAsset offers delivery instead. Documented giveUpAfterMs 300000 \u2014 on give-up the wizard exits and the durable order takes over."
      },
      {
        id: "delivery",
        mode: "AWAIT",
        endpoint: "GET /fiat/delivery/:deliveryId",
        when: "the request carried a destinationAsset: offered from creation, in every status",
        note: "The backend decides; the client never infers it. It follows this transition when offered and then polls only GET /fiat/delivery/:deliveryId, which reports both the fiat leg and any conversion after it. Without it the client polls the order and treats SETTLED as done. giveUpAfterMs is the time left in the one delivery polling window, which starts at the order's creation (15 minutes); see DELIVERY:PENDING."
      },
      {
        id: "retry_payment",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders",
        when: "failureReason.recovery === RETRY_PAYMENT"
      },
      {
        id: "requote",
        mode: "SUBMIT",
        endpoint: "POST /fiat/quote",
        when: "failureReason.recovery === REQUOTE"
      },
      {
        id: "cancel",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders/:id/cancel",
        when: "in-wizard cancel placement wins and the rail allows it",
        note: "TODO(open-decision): cancel placement (FE doc open questions 1+2); per-rail eligibility is contract OQ7."
      }
    ],
    mayReturn: ["ORDER/CREATED", "DELIVERY:PENDING", "DELIVERY:SUCCEEDED", "DELIVERY:FAILED"],
    terminal: false,
    terminalStatuses: TERMINAL_ORDER_STATUSES,
    notes: [
      "Flow-terminality here rides status \u2208 terminalStatuses, not the state kind and not array emptiness.",
      "A terminal status may still carry a recovery transition: FAILED + retryable failureReason emits it (FE doc Screen 14); non-retryable emits [].",
      "ON_HOLD is a non-terminal status (resolves to PROCESSING or REFUNDED) \u2014 and is NOT the same thing as the KYC ON_HOLD reason; see the note on that field.",
      "CAPTURE_ORPHANED is non-terminal pending the backend rank map (added from review 2026-08-14).",
      "SETTLED is terminal for the order. For a request that carried a destinationAsset the purchase is read from DELIVERY (GET /fiat/delivery/:deliveryId) from creation, so the client never polls the order. The order body itself never describes the conversion.",
      "TODO(open-decision): contract OQ7 \u2014 under/over-payment is the biggest unenumerated branch."
    ]
  },
  "DELIVERY:PENDING": {
    key: "DELIVERY:PENDING",
    kind: "DELIVERY",
    state: "PENDING",
    screens: [7],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "poll",
        mode: "AWAIT",
        endpoint: "GET /fiat/delivery/:deliveryId",
        note: "Every answer carries giveUpAfterMs: the time left in one polling window that starts at the order's creation (15 minutes), so the window never restarts. When it runs out the client closes the wizard and relies on the notification at the end of the purchase. Giving up the poll does not fail the purchase: the backend still finishes the delivery or raises it to support."
      }
    ],
    mayReturn: ["DELIVERY:PENDING", "DELIVERY:SUCCEEDED", "DELIVERY:FAILED"],
    terminal: false,
    notes: [
      "Covers both legs: the fiat order is not terminal yet, or it settled and a crypto asset provider is converting it into the destinationAsset and paying the user. The client shows one waiting screen.",
      "No cancel here. TODO(open-decision): cancel placement (FE doc open questions 1+2)."
    ]
  },
  "DELIVERY:SUCCEEDED": {
    key: "DELIVERY:SUCCEEDED",
    kind: "DELIVERY",
    state: "SUCCEEDED",
    screens: [13],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: [],
    terminal: true,
    notes: [
      "The destinationAsset reached the user. txHash is the transaction that paid them: the fiat order payout on a direct delivery, the conversion payout on a converted one."
    ]
  },
  "DELIVERY:FAILED": {
    key: "DELIVERY:FAILED",
    kind: "DELIVERY",
    state: "FAILED",
    screens: [],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: [],
    terminal: true,
    notes: [
      "FAILED covers both legs: the fiat order failed, was refunded, expired or was cancelled, or the buyer paid and the asset did not arrive. The state carries no reason field.",
      "FAILED offers no transition: the client shows the failure screen and offers no new payment from it. When the buyer paid, support recovers the funds."
    ]
  }
};
var STATE_KEYS = Object.keys(TRANSITION_TABLE);
var DOCUMENTED_ENDPOINTS = [
  "GET /fiat/payment-methods",
  "POST /fiat/quote",
  "POST /fiat/auth",
  "POST /fiat/auth/verify",
  "POST /fiat/auth/refresh",
  "POST /fiat/auth/revoke",
  "POST /fiat/payment-session",
  "POST /fiat/session",
  "POST /fiat/session/verify",
  "GET /fiat/quotes/:quoteRef",
  "POST /fiat/kyc/form",
  "POST /fiat/kyc/capture",
  "POST /fiat/kyc/sdk-token",
  "POST /fiat/kyc/document",
  "POST /fiat/instruments",
  "POST /fiat/orders",
  "GET /fiat/orders/:id",
  "GET /fiat/delivery/:deliveryId",
  "GET /fiat/orders/:id/instructions",
  "POST /fiat/orders/:id/confirm-payment",
  "POST /fiat/orders/:id/reference",
  "POST /fiat/orders/:id/cancel",
  "POST /fiat/orders/:id/surface-result"
];
var UNOFFERED_ENDPOINTS = [
  {
    endpoint: "GET /fiat/payment-methods",
    reason: "Discovery, called before any flow state exists \u2014 there is no state to hang it off."
  },
  {
    endpoint: "POST /fiat/auth/refresh",
    reason: "SDK session store, not a transition."
  },
  {
    endpoint: "POST /fiat/auth/revoke",
    reason: "SDK session store, not a transition."
  },
  {
    endpoint: "POST /fiat/kyc/document",
    reason: "FILE fields use it for a direct provider/vendor upload handshake and completion report; the harness owns that auxiliary path and it is not a transition (see KYC/INPUT_REQUIRED notes)."
  },
  {
    endpoint: "POST /fiat/instruments",
    reason: "No state offers it and no published doc explains why. TODO(open-decision): saved instruments may simply be unreached in v1 \u2014 confirm, or wire it to the state that should offer it."
  },
  {
    endpoint: "GET /fiat/orders/:id/instructions",
    reason: "PAYMENT{INSTRUCT} carries its instructions in state and offers no fetch. TODO(open-decision): that state also notes no re-issue endpoint exists, which sits oddly beside this one being published \u2014 confirm or retire it."
  },
  {
    endpoint: "POST /fiat/orders/:id/reference",
    reason: "The bank-reference submission is offered by no state. TODO(open-decision): PAYMENT{INSTRUCT} is the plausible home \u2014 confirm or wire it."
  }
];
var UNREACHABLE_STATES = [
  {
    stateKey: "FUN_AUTH",
    reason: "Answered to the entry quote request of a Fun-run login with no session, before any state exists; no state returns it."
  }
];
function unofferedEndpoints() {
  const offered = /* @__PURE__ */ new Set();
  for (const key of STATE_KEYS) {
    for (const allowed of TRANSITION_TABLE[key].allowedTransitions) offered.add(allowed.endpoint);
  }
  return DOCUMENTED_ENDPOINTS.filter((endpoint) => !offered.has(endpoint));
}
function unreachableStates(from = "QUOTE") {
  const seen = /* @__PURE__ */ new Set([from]);
  const queue = [from];
  while (queue.length > 0) {
    for (const target of TRANSITION_TABLE[queue.pop()].mayReturn ?? []) {
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return STATE_KEYS.filter((key) => !seen.has(key));
}
function stateKey(state) {
  switch (state.kind) {
    case "QUOTE":
      return "QUOTE";
    case "FUN_AUTH":
      return "FUN_AUTH";
    case "SESSION_AUTH":
      return "SESSION_AUTH";
    case "PENDING_ORDER":
      return "PENDING_ORDER";
    case "BLOCKED":
      return "BLOCKED";
    case "KYC": {
      if (state.phase === "CAPTURE") return "KYC/CAPTURE";
      if (state.phase === "INPUT_REQUIRED") return "KYC/INPUT_REQUIRED";
      return `KYC/NO_ACTION_REQUIRED:${state.reason}`;
    }
    case "PAYMENT":
      return state.phase === "CAPTURE" ? "PAYMENT/CAPTURE" : "PAYMENT/INSTRUCT";
    case "ORDER":
      return state.phase === "AWAITING_CONFIRMATION" ? "ORDER/AWAITING_CONFIRMATION" : "ORDER/CREATED";
    case "DELIVERY":
      return `DELIVERY:${state.state}`;
    default: {
      const exhaustive = state;
      throw new Error(`unknown FlowState: ${JSON.stringify(exhaustive)}`);
    }
  }
}
var tableEntry = (state) => TRANSITION_TABLE[stateKey(state)];
function isTerminal(state) {
  const entry = tableEntry(state);
  if (entry.terminalStatuses && state.kind === "ORDER" && state.phase === "CREATED") {
    return entry.terminalStatuses.includes(state.status);
  }
  return entry.terminal;
}

// src/fixtures/data.ts
var FIXTURE_DATA = {
  "delivery-01-pending": {
    "state": {
      "kind": "DELIVERY",
      "state": "PENDING"
    },
    "provider": "MOONPAY",
    "transitions": [
      {
        "id": "poll",
        "mode": "AWAIT",
        "poll": {
          "endpoint": "GET /fiat/delivery/dlv_31c",
          "intervalMs": 3e3,
          "backoffFactor": 1.5,
          "maxIntervalMs": 1e4,
          "giveUpAfterMs": 18e4
        }
      }
    ]
  },
  "delivery-02-succeeded": {
    "state": {
      "kind": "DELIVERY",
      "state": "SUCCEEDED",
      "txHash": "5VER\u2026"
    },
    "provider": "MOONPAY",
    "transitions": []
  },
  "delivery-03-failed": {
    "state": {
      "kind": "DELIVERY",
      "state": "FAILED"
    },
    "provider": "MOONPAY",
    "transitions": []
  },
  "fun-auth-01-identifier": {
    "state": {
      "kind": "FUN_AUTH",
      "channel": "EMAIL_OTP",
      "phase": "IDENTIFIER",
      "error": {
        "category": "USER_ERROR",
        "retryable": true,
        "recovery": "NONE",
        "code": "INVALID_EMAIL"
      }
    },
    "transitions": [
      {
        "id": "start",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/auth",
        "inputs": {
          "email": {
            "type": "TEXT"
          }
        }
      }
    ]
  },
  "fun-auth-02-code": {
    "state": {
      "kind": "FUN_AUTH",
      "channel": "EMAIL_OTP",
      "phase": "CODE",
      "expiresAtMs": 17600006e5,
      "resendAvailableAtMs": 176000006e4,
      "attemptsRemaining": 3
    },
    "transitions": [
      {
        "id": "verify",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/auth/verify",
        "params": {
          "verificationRef": "vr_7c1"
        },
        "inputs": {
          "otpCode": {
            "type": "TEXT",
            "length": 6,
            "regex": "^\\d{6}$"
          }
        }
      },
      {
        "id": "resend",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/auth",
        "params": {
          "verificationRef": "vr_7c1"
        }
      }
    ]
  },
  "fun-auth-03-verified": {
    "state": {
      "kind": "FUN_AUTH",
      "channel": "EMAIL_OTP",
      "phase": "VERIFIED"
    },
    "transitions": [],
    "session": {
      "accessToken": "<access-token>",
      "refreshHandle": "<refresh-handle>",
      "expiresAtMs": 176e10
    }
  },
  "screen-01-quote": {
    "state": {
      "kind": "QUOTE",
      "limits": {
        "min": "1.00",
        "max": "3000.00",
        "serviceableRanges": [
          {
            "min": "1.00",
            "max": "500.00"
          },
          {
            "min": "1000.00",
            "max": "3000.00"
          }
        ]
      },
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.09"
          },
          {
            "id": "network_fee",
            "labelFallback": "Network fee",
            "amount": "0.50"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "continue",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/session",
        "params": {
          "quoteRef": "q_8f2"
        }
      }
    ]
  },
  "screen-01b-quote-with-pay-sheet": {
    "state": {
      "kind": "QUOTE",
      "limits": {
        "min": "1.00",
        "max": "3000.00",
        "serviceableRanges": [
          {
            "min": "1.00",
            "max": "3000.00"
          }
        ]
      },
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.09"
          },
          {
            "id": "network_fee",
            "labelFallback": "Network fee",
            "amount": "0.50"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      },
      "surface": {
        "kind": "PAY_SHEET",
        "provider": "TRANSAK",
        "params": {
          "sessionId": "txs_\u2026",
          "environment": "STAGING"
        }
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "capture",
        "mode": "CLIENT_SURFACE",
        "report": {
          "endpoint": "POST /fiat/orders",
          "params": {
            "quoteRef": "q_8f2",
            "depositAddress": "\u2026"
          },
          "expects": [
            "paymentAuthorisationId"
          ]
        }
      }
    ]
  },
  "screen-02-session-auth": {
    "state": {
      "kind": "SESSION_AUTH",
      "channel": "EMAIL_OTP"
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "verify",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/session/verify",
        "params": {
          "quoteRef": "q_8f2"
        },
        "inputs": {
          "code": {
            "type": "TEXT",
            "length": 6
          }
        }
      }
    ]
  },
  "screen-03-kyc-input-required": {
    "state": {
      "kind": "KYC",
      "phase": "INPUT_REQUIRED",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      },
      "form": {
        "formId": "kyc_q_8f2_1",
        "fields": [
          {
            "id": "TAX_IDENTIFIER",
            "type": "TEXT",
            "labelFallback": "Tax ID",
            "required": true
          },
          {
            "id": "RESIDENTIAL_ADDRESS_LINE_1",
            "type": "TEXT",
            "labelFallback": "Home address",
            "required": true
          }
        ]
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "submit_round",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/kyc/form",
        "params": {
          "quoteRef": "q_8f2",
          "formId": "kyc_q_8f2_1"
        },
        "inputs": {
          "values": {
            "type": "FORM_VALUES"
          }
        }
      }
    ]
  },
  "screen-04-order-review": {
    "state": {
      "kind": "ORDER",
      "phase": "AWAITING_CONFIRMATION",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.09"
          },
          {
            "id": "network_fee",
            "labelFallback": "Network fee",
            "amount": "0.50"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "confirm",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/orders",
        "params": {
          "quoteRef": "q_8f2"
        }
      }
    ]
  },
  "screen-05-payment-capture": {
    "state": {
      "kind": "PAYMENT",
      "phase": "CAPTURE",
      "surface": {
        "kind": "PCI_COMPONENT",
        "provider": "TRANSAK",
        "params": {
          "sessionId": "eyJ\u2026",
          "environment": "STAGING"
        }
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "capture",
        "mode": "CLIENT_SURFACE",
        "report": {
          "endpoint": "POST /fiat/orders",
          "params": {
            "quoteRef": "q_8f2"
          },
          "expects": [
            "requestId"
          ]
        }
      }
    ]
  },
  "screen-07b-order-created-delivery": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "USD",
          "amount": "50.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "base",
          "amount": "48.73"
        },
        "method": "apple_pay",
        "createdAt": "\u2026"
      },
      "status": "PROCESSING"
    },
    "provider": "MOONPAY",
    "transitions": [
      {
        "id": "delivery",
        "mode": "AWAIT",
        "poll": {
          "endpoint": "GET /fiat/delivery/dlv_31c",
          "intervalMs": 3e3,
          "backoffFactor": 1.5,
          "maxIntervalMs": 1e4,
          "giveUpAfterMs": 9e5
        }
      }
    ]
  },
  "screen-08-kyc-capture": {
    "state": {
      "kind": "KYC",
      "phase": "CAPTURE",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      },
      "surface": {
        "kind": "KYC_SDK",
        "provider": "SUMSUB",
        "params": {
          "accessToken": "eyJ\u2026"
        },
        "preferredDocuments": {
          "IDENTITY": {
            "idDocType": "PASSPORT",
            "country": "GBR"
          }
        },
        "expiresAt": "\u2026"
      },
      "correctionReason": "The image is too blurry. Upload a clearer photo of this document."
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "refresh_sdk_token",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/kyc/sdk-token",
        "params": {
          "quoteRef": "q_8f2"
        },
        "labelFallback": "Retry verification"
      },
      {
        "id": "capture",
        "mode": "CLIENT_SURFACE",
        "report": {
          "endpoint": "POST /fiat/kyc/capture",
          "params": {
            "quoteRef": "q_8f2"
          },
          "result": {
            "type": "KYC_SDK_RESULT",
            "bodyKey": "result"
          }
        }
      }
    ]
  },
  "screen-09-kyc-in-review": {
    "state": {
      "kind": "KYC",
      "phase": "NO_ACTION_REQUIRED",
      "reason": "IN_REVIEW",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "poll",
        "mode": "AWAIT",
        "poll": {
          "endpoint": "GET /fiat/quotes/q_8f2",
          "intervalMs": 3e3,
          "backoffFactor": 1.5,
          "maxIntervalMs": 1e4,
          "giveUpAfterMs": 9e4
        }
      }
    ]
  },
  "screen-10-kyc-on-hold": {
    "state": {
      "kind": "KYC",
      "phase": "NO_ACTION_REQUIRED",
      "reason": "ON_HOLD",
      "retryAfter": "2026-08-20T09:00:00Z",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": []
  },
  "screen-11-kyc-rejected": {
    "state": {
      "kind": "KYC",
      "phase": "NO_ACTION_REQUIRED",
      "reason": "REJECTED",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      },
      "failureReason": {
        "category": "KYC_REJECTED",
        "retryable": false,
        "recovery": "CONTACT_SUPPORT"
      }
    },
    "provider": "TRANSAK",
    "transitions": []
  },
  "screen-12-pending-order": {
    "state": {
      "kind": "PENDING_ORDER",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "method": "bank_transfer",
        "createdAt": "\u2026",
        "status": "AWAITING_PAYMENT"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "resume",
        "mode": "SUBMIT",
        "endpoint": "GET /fiat/orders/o_31c"
      },
      {
        "id": "cancel",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/orders/o_31c/cancel"
      }
    ]
  },
  "screen-13-order-settled": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "method": "card",
        "instrument": {
          "brandLabel": "Chase Debit",
          "last4": "4021"
        },
        "createdAt": "\u2026"
      },
      "status": "SETTLED",
      "tx": {
        "chainId": 137,
        "hash": "0x\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": []
  },
  "screen-13b-order-settled-converted": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "USD",
          "amount": "50.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "base",
          "amount": "48.73"
        },
        "method": "apple_pay",
        "createdAt": "\u2026"
      },
      "status": "SETTLED",
      "tx": {
        "chainId": 8453,
        "hash": "0x\u2026"
      }
    },
    "provider": "MOONPAY",
    "transitions": [
      {
        "id": "delivery",
        "mode": "AWAIT",
        "poll": {
          "endpoint": "GET /fiat/delivery/dlv_31c",
          "intervalMs": 3e3,
          "backoffFactor": 1.5,
          "maxIntervalMs": 1e4,
          "giveUpAfterMs": 6e5
        }
      }
    ]
  },
  "screen-14-order-failed": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "method": "card",
        "createdAt": "\u2026"
      },
      "status": "FAILED",
      "failureReason": {
        "category": "PAYMENT_DECLINED",
        "retryable": true,
        "recovery": "RETRY_PAYMENT"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "retry_payment",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/orders",
        "params": {
          "quoteRef": "q_8f2"
        }
      }
    ]
  },
  "screen-15-order-refunded": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "method": "bank_transfer",
        "createdAt": "\u2026"
      },
      "status": "REFUNDED",
      "refund": {
        "currency": "GBP",
        "amount": "100.00",
        "expectedBy": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": []
  },
  "screen-16-blocked": {
    "state": {
      "kind": "BLOCKED",
      "reason": "REGION_UNSUPPORTED",
      "retryAfter": null
    },
    "transitions": []
  },
  "worked-example-01-quote": {
    "state": {
      "kind": "QUOTE",
      "limits": {
        "min": "1.00",
        "max": "3000.00",
        "serviceableRanges": [
          {
            "min": "1.00",
            "max": "3000.00"
          }
        ]
      },
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.09"
          },
          {
            "id": "network_fee",
            "labelFallback": "Network fee",
            "amount": "0.50"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "2026-08-11T21:33:00Z"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "continue",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/session",
        "params": {
          "quoteRef": "q_8f2"
        },
        "inputs": {
          "email": {
            "type": "TEXT"
          }
        }
      }
    ]
  },
  "worked-example-02-session-auth": {
    "state": {
      "kind": "SESSION_AUTH",
      "channel": "EMAIL_OTP"
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "verify",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/session/verify",
        "params": {
          "quoteRef": "q_8f2"
        },
        "inputs": {
          "code": {
            "type": "TEXT",
            "length": 6
          }
        }
      }
    ]
  },
  "worked-example-04-payment-instruct": {
    "orderId": "o_3d1",
    "state": {
      "kind": "PAYMENT",
      "phase": "INSTRUCT",
      "instructions": {
        "kind": "BANK_FIELDS",
        "fields": [
          {
            "id": "beneficiary",
            "labelFallback": "Beneficiary",
            "value": "Transak"
          },
          {
            "id": "sort_code",
            "labelFallback": "Sort code",
            "value": "04-00-04"
          },
          {
            "id": "account_number",
            "labelFallback": "Account number",
            "value": "12345678"
          },
          {
            "id": "reference",
            "labelFallback": "Reference",
            "value": "o_3d1"
          }
        ],
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "confirm_paid",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/orders/o_3d1/confirm-payment"
      }
    ]
  }
};

// src/fixtures/index.ts
var FIXTURES = [
  {
    id: "screen-01-quote",
    file: "screen-01-quote.json",
    source: "FE_DOC",
    docRef: "Screen 1 \xB7 Quote / review",
    screen: 1,
    stateKey: "QUOTE"
  },
  {
    id: "screen-01b-quote-with-pay-sheet",
    file: "screen-01b-quote-with-pay-sheet.json",
    source: "CONTRACT_DOC",
    docRef: "Fiat Contract 0.7 \xA7The contract diff \xB7 example envelopes",
    screen: 1,
    stateKey: "QUOTE",
    notes: [
      "The 0.7 single-screen shape: the quote carries its own PAY_SHEET, so the provider component is the primary CTA rather than something a later state reveals.",
      "Quote payload is screen-01-quote verbatim; only the surface and the transition differ."
    ]
  },
  {
    id: "screen-02-session-auth",
    file: "screen-02-session-auth.json",
    source: "FE_DOC",
    docRef: "Screen 2 \xB7 Verification code (OTP)",
    screen: 2,
    stateKey: "SESSION_AUTH"
  },
  {
    id: "fun-auth-01-identifier",
    file: "fun-auth-01-identifier.json",
    source: "IDENTITY_DOC",
    docRef: "Fiat identity design doc (2026-10-20) \xB7 Contract changes",
    stateKey: "FUN_AUTH",
    notes: [
      "The server re-asks for the email after a start that failed with a user-correctable error. The first IDENTIFIER is entered client-side.",
      "No provider: FUN_AUTH runs before any provider is chosen."
    ]
  },
  {
    id: "fun-auth-02-code",
    file: "fun-auth-02-code.json",
    source: "IDENTITY_DOC",
    docRef: "Fiat identity design doc (2026-10-20) \xB7 Contract changes",
    stateKey: "FUN_AUTH",
    notes: ["verify and resend carry the same verificationRef; resend is usable once resendAvailableAtMs has passed."]
  },
  {
    id: "fun-auth-03-verified",
    file: "fun-auth-03-verified.json",
    source: "IDENTITY_DOC",
    docRef: "Fiat identity design doc (2026-10-20) \xB7 Contract changes",
    stateKey: "FUN_AUTH",
    notes: [
      "A Fun-run login: the envelope carries the Fun session and no transitions. The SDK then starts the flow at QUOTE with accessToken as Bearer.",
      "accessToken and refreshHandle are placeholders."
    ]
  },
  {
    id: "screen-03-kyc-input-required",
    file: "screen-03-kyc-input-required.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 L1 input round",
    screen: 3,
    stateKey: "KYC/INPUT_REQUIRED",
    notes: ["Carries the FORM_VALUES input spec \u2014 the no-double-carry case of the accepted split."]
  },
  {
    id: "screen-04-order-review",
    file: "screen-04-order-review.json",
    source: "FE_DOC",
    docRef: "Screen 4 \xB7 Order review (bank rail)",
    screen: 4,
    stateKey: "ORDER/AWAITING_CONFIRMATION",
    notes: [
      `The screen card publishes this payload by reference \u2014 "quote: <same shape as Screen 1, refreshed>" \u2014 so the quote here is Screen 1's payload verbatim. The numbers are not re-published as refreshed values, so they are unchanged; only the shape is contractual.`
    ]
  },
  {
    id: "screen-05-payment-capture",
    file: "screen-05-payment-capture.json",
    source: "FE_DOC",
    docRef: "Screen 5 \xB7 Card payment",
    screen: 5,
    stateKey: "PAYMENT/CAPTURE",
    notes: [
      "Capture-then-order topology (report \u2192 POST /fiat/orders, expects requestId).",
      "TODO(open-decision): report target per card topology is a Transak ask (contract Flow A)."
    ]
  },
  {
    id: "screen-08-kyc-capture",
    file: "screen-08-kyc-capture.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 embedded Sumsub WebSDK",
    screen: 8,
    stateKey: "KYC/CAPTURE",
    notes: [
      "The client mounts the Sumsub adapter; no URL or iframe is emitted.",
      "A retry may carry provider-authored correctionReason display text; clients never branch on it."
    ]
  },
  {
    id: "screen-09-kyc-in-review",
    file: "screen-09-kyc-in-review.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 pending quote",
    screen: 9,
    stateKey: "KYC/NO_ACTION_REQUIRED:IN_REVIEW"
  },
  {
    id: "screen-10-kyc-on-hold",
    file: "screen-10-kyc-on-hold.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 verification on hold",
    screen: 10,
    stateKey: "KYC/NO_ACTION_REQUIRED:ON_HOLD",
    notes: ["transitions: [] and NOT terminal \u2014 the fixture that proves terminality is table data."]
  },
  {
    id: "screen-11-kyc-rejected",
    file: "screen-11-kyc-rejected.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 non-retryable rejection",
    screen: 11,
    stateKey: "KYC/NO_ACTION_REQUIRED:REJECTED",
    notes: ["Only an explicit non-retryable provider or identity-vendor outcome reaches this state."]
  },
  {
    id: "screen-12-pending-order",
    file: "screen-12-pending-order.json",
    source: "FE_DOC",
    docRef: "Screen 12 \xB7 Order in progress",
    screen: 12,
    stateKey: "PENDING_ORDER",
    notes: [
      "TODO(open-decision): PENDING_ORDER removal proposed; Screen 12 frozen. Kept so 0.1.0 can validate the current shape."
    ]
  },
  {
    id: "screen-13-order-settled",
    file: "screen-13-order-settled.json",
    source: "FE_DOC",
    docRef: "Screen 13 \xB7 Success",
    screen: 13,
    stateKey: "ORDER/CREATED"
  },
  {
    id: "screen-07b-order-created-delivery",
    file: "screen-07b-order-created-delivery.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 an order whose request carried a destinationAsset",
    screen: 7,
    stateKey: "ORDER/CREATED",
    notes: [
      "Offered from creation: the request carried a destinationAsset, so the order offers delivery and no poll. The client polls only GET /fiat/delivery/:deliveryId from here, within one 15-minute window from the order's creation (giveUpAfterMs)."
    ]
  },
  {
    id: "screen-13b-order-settled-converted",
    file: "screen-13b-order-settled-converted.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 a destinationAsset order at SETTLED",
    screen: 13,
    stateKey: "ORDER/CREATED",
    notes: [
      "The order body is the fiat leg only. The backend offers the delivery transition because the request carried a destinationAsset (from creation, so also at SETTLED); the client follows it instead of showing success."
    ]
  },
  {
    id: "screen-14-order-failed",
    file: "screen-14-order-failed.json",
    source: "FE_DOC",
    docRef: "Screen 14 \xB7 Something went wrong",
    screen: 14,
    stateKey: "ORDER/CREATED",
    notes: ["Terminal status (FAILED) still carrying a recovery transition \u2014 retryable failureReason."]
  },
  {
    id: "screen-15-order-refunded",
    file: "screen-15-order-refunded.json",
    source: "FE_DOC",
    docRef: "Screen 15 \xB7 Refund on the way",
    screen: 15,
    stateKey: "ORDER/CREATED"
  },
  {
    id: "screen-16-blocked",
    file: "screen-16-blocked.json",
    source: "FE_DOC",
    docRef: "Screen 16 \xB7 Not available",
    screen: 16,
    stateKey: "BLOCKED",
    notes: ["A flatly terminal availability state; explicit non-retryable KYC rejection is terminal too."]
  },
  {
    id: "worked-example-01-quote",
    file: "worked-example-01-quote.json",
    source: "CONTRACT_DOC",
    docRef: "\xA7Worked example, step 1 (method selection)",
    stateKey: "QUOTE",
    notes: ["Carries inputs {email: {type: TEXT}} \u2014 the collected-spec half of the split."]
  },
  {
    id: "worked-example-02-session-auth",
    file: "worked-example-02-session-auth.json",
    source: "CONTRACT_DOC",
    docRef: "\xA7Worked example, step 2 (session challenge)",
    stateKey: "SESSION_AUTH"
  },
  {
    id: "worked-example-04-payment-instruct",
    file: "worked-example-04-payment-instruct.json",
    source: "CONTRACT_DOC",
    docRef: "\xA7Worked example, steps 4\u20135 (order + bank instructions)",
    stateKey: "PAYMENT/INSTRUCT",
    notes: [
      "The response-level `orderId` case. TODO(open-decision): orderId placement (beside `state` here vs inside it in the FE doc v0)."
    ]
  },
  {
    id: "delivery-01-pending",
    file: "delivery-01-pending.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 the purchase is running",
    stateKey: "DELIVERY:PENDING",
    notes: [
      "giveUpAfterMs is what is left of the one 15-minute window that started when the order was created (here 12 minutes later), so the window never restarts."
    ]
  },
  {
    id: "delivery-02-succeeded",
    file: "delivery-02-succeeded.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 the destination asset reached the user",
    stateKey: "DELIVERY:SUCCEEDED"
  },
  {
    id: "delivery-03-failed",
    file: "delivery-03-failed.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 the purchase failed",
    stateKey: "DELIVERY:FAILED",
    notes: [
      "No transition, whichever leg failed: the client offers no new payment from it. When the buyer paid, support recovers the funds."
    ]
  }
];
var FIXTURE_COVERAGE_GAPS = [];
var fixtureMeta = (id) => {
  const meta = FIXTURES.find((f) => f.id === id);
  if (!meta) throw new Error(`unknown fixture: ${id}`);
  return meta;
};
function loadFixture(id) {
  const meta = fixtureMeta(id);
  const data = FIXTURE_DATA[meta.id];
  if (data === void 0) throw new Error(`fixture data missing for ${meta.id} \u2014 run npm run generate:fixtures`);
  return JSON.parse(JSON.stringify(data));
}
function loadFixtures() {
  return FIXTURES.map((meta) => ({ meta, json: loadFixture(meta.id) }));
}

// src/assert.ts
var ContractViolation = class extends Error {
  issues;
  constructor(message, issues = []) {
    super(issues.length ? `${message}
  - ${issues.join("\n  - ")}` : message);
    this.name = "ContractViolation";
    this.issues = issues;
  }
};
var formatIssues = (error) => {
  const issues = error.issues;
  if (!issues) return [String(error)];
  return issues.map((issue) => {
    const path = (issue.path ?? []).join(".");
    return path ? `${path}: ${issue.message ?? "invalid"}` : issue.message ?? "invalid";
  });
};
function assertFiatStepResponse(json) {
  const result = FiatStepResponseSchema.safeParse(json);
  if (!result.success) throw new ContractViolation("invalid fiat step response", formatIssues(result.error));
  return result.data;
}
function endpointMatches(template, actual) {
  const pattern = template.split("/").map((segment) => segment.startsWith(":") ? "[^/]+" : escapeRegExp(segment)).join("/");
  return new RegExp(`^${pattern}$`).test(actual);
}
var escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var transitionEndpoint = (transition) => {
  switch (transition.mode) {
    case "SUBMIT":
      return transition.endpoint;
    case "AWAIT":
      return transition.poll.endpoint;
    case "CLIENT_SURFACE":
      return transition.report.endpoint;
  }
};
var matchesAllowed = (transition, allowed) => allowed.mode === transition.mode && endpointMatches(allowed.endpoint, transitionEndpoint(transition));
function bodyKeyIssues(transition) {
  const issues = [];
  const collide = (a, b, left, right) => {
    for (const key of a) {
      if (b.includes(key)) issues.push(`transition "${transition.id}": key "${key}" is in both ${left} and ${right}`);
    }
  };
  if (transition.mode === "SUBMIT") {
    const params = Object.keys(transition.params ?? {});
    const inputs = Object.keys(transition.inputs ?? {});
    collide(params, inputs, "params", "inputs");
    for (const [key, value] of Object.entries(transition.params ?? {})) {
      if (looksLikeFieldSpec(value)) {
        issues.push(
          `transition "${transition.id}": params.${key} is FieldSpec-shaped \u2014 a spec the client must collect belongs in inputs`
        );
      }
    }
  }
  if (transition.mode === "CLIENT_SURFACE") {
    const params = Object.keys(transition.report.params ?? {});
    collide(params, transition.report.expects ?? [], "report.params", "report.expects");
    const resultKeys = transition.report.result ? [transition.report.result.bodyKey] : [];
    collide(params, resultKeys, "report.params", "report.result");
    collide(transition.report.expects ?? [], resultKeys, "report.expects", "report.result");
  }
  return issues;
}
function checkLegalEmission(state, transitions) {
  const entry = tableEntry(state);
  const issues = [];
  if (entry.terminal && transitions.length > 0) {
    issues.push(
      `${entry.key} is terminal (table) and must carry transitions: [] \u2014 got ${transitions.length}`
    );
  }
  const surfaceTargets = new Set(
    transitions.filter((t) => t.mode === "CLIENT_SURFACE").map((t) => t.report.endpoint)
  );
  for (const transition of transitions) {
    if (transition.mode === "SUBMIT" && surfaceTargets.has(transition.endpoint)) {
      issues.push(
        `transition "${transition.id}": SUBMIT ${transition.endpoint} coexists with a CLIENT_SURFACE reporting to it`
      );
    }
  }
  for (const transition of transitions) {
    issues.push(...bodyKeyIssues(transition));
    if (transition.mode === "CLIENT_SURFACE" && !("surface" in state)) {
      issues.push(
        `transition "${transition.id}": CLIENT_SURFACE requires the Surface in state (\u03942 single-carry) \u2014 ${entry.key} carries none`
      );
    }
    if (transition.mode === "CLIENT_SURFACE" && transition.report.result?.type === "KYC_SDK_RESULT" && (!("surface" in state) || state.surface?.kind !== "KYC_SDK")) {
      issues.push(
        `transition "${transition.id}": KYC_SDK_RESULT requires a KYC_SDK surface in state`
      );
    }
    if (transition.mode === "SUBMIT" && Object.values(transition.inputs ?? {}).some((spec) => spec.type === "FORM_VALUES") && !("form" in state)) {
      issues.push(
        `transition "${transition.id}": inputs {type: FORM_VALUES} collects state.form \u2014 ${entry.key} carries no form`
      );
    }
    if (entry.docStatus === "SPECIFIED" && !entry.allowedTransitions.some((a) => matchesAllowed(transition, a))) {
      issues.push(
        `transition "${transition.id}": ${transition.mode} ${transitionEndpoint(transition)} is not in ${entry.key}'s legal set (${entry.allowedTransitions.map((a) => `${a.mode} ${a.endpoint}`).join(" | ") || "none"})`
      );
    }
  }
  return {
    state: entry.key,
    issues,
    unjudgeable: entry.docStatus === "UNSPECIFIED"
  };
}
function assertLegalEmission(state, transitions) {
  const { issues, state: key } = checkLegalEmission(state, transitions);
  if (issues.length) throw new ContractViolation(`illegal emission for ${key}`, issues);
}
function assertLegalReturn(from, to) {
  const entry = tableEntry(from);
  const target = stateKey(to);
  if (!entry.mayReturn) return;
  if (!entry.mayReturn.includes(target)) {
    throw new ContractViolation(
      `illegal return: ${entry.key} \u2192 ${target}`,
      [`${entry.key} may receive back: ${entry.mayReturn.join(" \xB7 ") || "nothing (terminal)"}`]
    );
  }
}
function walkTable(fn) {
  return STATE_KEYS.map((key) => fn(TRANSITION_TABLE[key], key));
}
function assertFixture(id) {
  const meta = fixtureMeta(id);
  const json = loadFixture(id);
  const stepResponse2 = assertFiatStepResponse(json);
  if (stateKey(stepResponse2.state) !== meta.stateKey) {
    throw new ContractViolation(
      `fixture ${id}: manifest says ${meta.stateKey}, step response carries ${stateKey(stepResponse2.state)}`
    );
  }
  assertLegalEmission(stepResponse2.state, stepResponse2.transitions);
  return { meta, stepResponse: stepResponse2 };
}
function assertAllFixtures() {
  return FIXTURES.map((meta) => assertFixture(meta.id));
}

// src/terms.ts
var FIAT_TERMS_ENDPOINT = "POST /fiat/terms";
var MOONPAY_TERMS = {
  id: "MOONPAY_TERMS",
  kind: "PROVIDER_TERMS",
  stage: "CHECKOUT",
  version: "moonpay-terms-2026-09",
  contentDigest: "aab09ddd95a6fdd3f7c483e22833375a03c031d7379a3f60e09aa46ab4856d07",
  links: [
    { label: "MoonPay Terms of Use", url: "https://www.moonpay.com/legal/terms" },
    { label: "MoonPay Privacy Policy", url: "https://www.moonpay.com/legal/privacy_policy" }
  ]
};
var MOONPAY_TERMS_KYC_SHARING_V2 = {
  id: "MOONPAY_TERMS",
  kind: "PROVIDER_TERMS",
  stage: "CHECKOUT",
  version: "2026-09-l2-kyc-sharing-v2",
  contentDigest: "44e096af329262134fe6680659c9bd42014cbf5e96f064d67869173a4f7d822b",
  links: [
    { label: "MoonPay Terms of Use", url: "https://www.moonpay.com/legal/terms" },
    { label: "MoonPay Privacy Policy", url: "https://www.moonpay.com/legal/privacy_policy" },
    { label: "Persona Privacy Policy", url: "https://withpersona.com/legal/privacy-policy" }
  ]
};
var MOONPAY_KYC_SHARING = {
  id: "MOONPAY_KYC_SHARING",
  kind: "PROVIDER_KYC_SHARING",
  stage: "KYC",
  version: "2026-09-l2-kyc-sharing-v3",
  contentDigest: "fe587d7c6542a12070444ddb2e6ff0f2f6062b00ffc512cdb5c60438d355088e",
  links: [{ label: "Persona Privacy Policy", url: "https://withpersona.com/legal/privacy-policy" }]
};
var PROVIDER_CHECKOUT_DOCUMENTS = {
  MOONPAY: [MOONPAY_TERMS],
  MOONPAY_GUEST: [MOONPAY_TERMS]
};
var PROVIDER_KYC_DOCUMENTS = {
  MOONPAY: [MOONPAY_KYC_SHARING]
};
var funKycConsent = (contentDigest) => ({
  id: "FUN_KYC_CONSENT",
  kind: "FUN_KYC_COLLECTION",
  stage: "KYC",
  version: "fun-kyc-consent-2026-09-11",
  contentDigest,
  links: [{ label: "Fun.xyz Privacy Policy", url: "https://fun.xyz/privacy" }]
});
var FUN_KYC_CONSENT_DOCUMENTS = {
  en: funKycConsent("da31f2467deb996476b131116508ea2a00220765e658a79abc6d2bd44337504a"),
  es: funKycConsent("73753b70ad8d1b48dfdcda35e6028c3a7ada66c311a67a1d8f6fe13c76a32f3b"),
  fr: funKycConsent("5ee82675984591dbf66337f31246179103c5624a189850943d400f9b85a84965"),
  ja: funKycConsent("3f272da313f66601a20c3ca43c967aff4bb7f73488177f0a4ce94cbc78bafce2"),
  ko: funKycConsent("aab7839bfba3f34aa47ca6b10647c2c8965c37d845494ef8f3067ca3e3821200"),
  ru: funKycConsent("17168083ebcc4fd11ea80b08c3f230bdec03a1e7b89173a38819ae5533b0fc96"),
  tr: funKycConsent("463040c3b58c922ecae2ae8262a78eb732bbcc5606c394723626378b3db2bbc3"),
  zh: funKycConsent("7f76d850adaf69783c5d9365e51abb5446f4e5778c63eabbdb4784d72464f855")
};
var PUBLISHED_TERMS_DOCUMENTS = [
  MOONPAY_TERMS_KYC_SHARING_V2,
  MOONPAY_TERMS,
  MOONPAY_KYC_SHARING,
  ...Object.values(FUN_KYC_CONSENT_DOCUMENTS)
];

// src/routing.ts
var ROUTING_ENDPOINTS = {
  table: "POST /fiat/routing/table",
  /** Temporary: `POST /fiat/next` replaces it for each provider that moves there. */
  quote: "POST /fiat/routing/quote"
};

// src/providers/moonpay.ts
var MOONPAY_ENDPOINTS = {
  next: "POST /fiat/next"
};

// src/providers/moonpay.schemas.ts
var import_zod2 = require("zod");
var FIAT_CURRENCY_CODES2 = Object.keys(FIAT_CURRENCY_NAMES);
var obj2 = (shape) => import_zod2.z.object(shape).strict();
var $nonEmpty = import_zod2.z.string().refine((value) => value.trim().length > 0, "must not be blank");
var hasUniqueIds2 = (ids) => new Set(ids).size === ids.length;
var $checkout = obj2({
  amount: FiatAmountSchema,
  destination: obj2({ asset: $nonEmpty, network: $nonEmpty }),
  paymentMethod: import_zod2.z.literal("apple_pay")
});
var MoonPayCheckoutSchema = $checkout;
var $credentials = obj2({ customerId: $nonEmpty, accessToken: $nonEmpty });
var MoonPaySdkCredentialsSchema = $credentials;
var $context = {
  checkout: $checkout,
  credentials: $credentials.optional(),
  destinationAsset: DestinationAssetSchema.optional()
};
var $requestContext = obj2($context);
var MoonPayRequestContextSchema = $requestContext;
var $quoteInput = obj2({
  source: obj2({ asset: obj2({ code: import_zod2.z.enum(FIAT_CURRENCY_CODES2) }), amount: $nonEmpty }),
  destination: obj2({ asset: obj2({ code: $nonEmpty }) }),
  wallet: obj2({ address: $nonEmpty }),
  paymentMethod: obj2({ type: import_zod2.z.literal("apple_pay") }),
  feeBehavior: import_zod2.z.literal("inclusive")
});
var MoonPayQuoteInputSchema = $quoteInput;
var $observeFields = { action: import_zod2.z.literal("observe") };
var $consentFields = {
  action: import_zod2.z.literal("consent"),
  acceptances: import_zod2.z.array(TermsDocumentAcceptanceSchema).min(1).refine((acceptances) => hasUniqueIds2(acceptances.map((acceptance) => acceptance.documentId)), "each document is accepted once")
};
var $sessionFields = { action: import_zod2.z.literal("session") };
var $connectFields = { action: import_zod2.z.literal("connect"), customerId: $nonEmpty, accessToken: $nonEmpty };
var $phoneNumberFields = { action: import_zod2.z.literal("phone"), phoneNumber: import_zod2.z.string().regex(/^\+[1-9]\d{1,14}$/) };
var $phoneResendFields = { action: import_zod2.z.literal("phone"), resend: $nonEmpty };
var $phoneCodeFields = { action: import_zod2.z.literal("phoneCode"), verificationRef: $nonEmpty, otpCode: import_zod2.z.string().regex(/^\d{6}$/) };
var $guestDeclineReason = import_zod2.z.enum(["NOT_OFFERED", "MISMATCH", "OVER_LIMIT"]);
var MoonPayGuestDeclineReasonSchema = $guestDeclineReason;
var $declineFields = { action: import_zod2.z.literal("decline"), reason: $guestDeclineReason };
var $kycFields = {
  action: import_zod2.z.literal("kyc"),
  credentials: $credentials,
  values: import_zod2.z.record(KycFieldIdSchema, import_zod2.z.string())
};
var $prepareCaptureFields = { action: import_zod2.z.literal("prepareCapture"), credentials: $credentials };
var $captureFields = { action: import_zod2.z.literal("capture"), credentials: $credentials, result: KycSdkResultReportSchema };
var $orderFields = { action: import_zod2.z.literal("order"), orderId: $nonEmpty, quotedAmount: FiatAmountSchema, transactionId: $nonEmpty.optional() };
var $observeRequest = obj2({ ...$context, ...$observeFields });
var $consentRequest = obj2({ ...$context, ...$consentFields });
var $sessionRequest = obj2({ ...$context, ...$sessionFields });
var $connectRequest = obj2({ ...$context, ...$connectFields });
var $phoneRequest = import_zod2.z.union([obj2({ ...$context, ...$phoneNumberFields }), obj2({ ...$context, ...$phoneResendFields })]);
var $phoneCodeRequest = obj2({ ...$context, ...$phoneCodeFields });
var $declineRequest = obj2({ ...$context, ...$declineFields });
var $kycRequest = obj2({ ...$context, ...$kycFields });
var $prepareCaptureRequest = obj2({ ...$context, ...$prepareCaptureFields });
var $captureRequest = obj2({ ...$context, ...$captureFields });
var $orderRequest = obj2({ ...$context, ...$orderFields });
var MoonPayObserveRequestSchema = $observeRequest;
var MoonPayConsentRequestSchema = $consentRequest;
var MoonPaySessionRequestSchema = $sessionRequest;
var MoonPayConnectRequestSchema = $connectRequest;
var MoonPayPhoneRequestSchema = $phoneRequest;
var MoonPayPhoneCodeRequestSchema = $phoneCodeRequest;
var MoonPayDeclineRequestSchema = $declineRequest;
var MoonPayKycRequestSchema = $kycRequest;
var MoonPayPrepareCaptureRequestSchema = $prepareCaptureRequest;
var MoonPayCaptureRequestSchema = $captureRequest;
var MoonPayOrderRequestSchema = $orderRequest;
var $request = import_zod2.z.union([
  $observeRequest,
  $consentRequest,
  $sessionRequest,
  $connectRequest,
  $kycRequest,
  $prepareCaptureRequest,
  $captureRequest,
  $orderRequest
]);
var MoonPayRequestSchema = $request;
var $envelope = { provider: import_zod2.z.literal("MOONPAY"), geo: FiatGeoSchema, depositAddress: $nonEmpty.optional(), ...$context };
var $nextRequest2 = import_zod2.z.union([
  obj2({ ...$envelope, ...$observeFields }),
  obj2({ ...$envelope, ...$consentFields }),
  obj2({ ...$envelope, ...$sessionFields }),
  obj2({ ...$envelope, ...$connectFields }),
  obj2({ ...$envelope, ...$kycFields }),
  obj2({ ...$envelope, ...$prepareCaptureFields }),
  obj2({ ...$envelope, ...$captureFields }),
  obj2({ ...$envelope, ...$orderFields })
]);
var MoonPayNextRequestSchema = $nextRequest2;
var FIELD_OF_CODE = { PHONE_IN_USE: "PHONE_NUMBER", TAX_ID_IN_USE: "TAX_IDENTIFIER" };
var $fieldError = obj2({ fieldId: $nonEmpty, message: $nonEmpty, code: import_zod2.z.enum(["PHONE_IN_USE", "TAX_ID_IN_USE"]).optional() });
var $consentShape = obj2({ next: import_zod2.z.literal("consent"), documents: import_zod2.z.array(TermsDocumentSchema).min(1) });
var $sessionNextAction = obj2({ next: import_zod2.z.literal("session") });
var $connectNextAction = obj2({
  next: import_zod2.z.literal("connect"),
  sessionToken: $nonEmpty,
  quoteInput: $quoteInput,
  resetConnection: import_zod2.z.literal(true).optional()
});
var $phoneNextAction = obj2({ next: import_zod2.z.literal("phone"), error: import_zod2.z.literal("CODE_EXPIRED").nullable() });
var $phoneCodeNextAction = obj2({
  next: import_zod2.z.literal("phoneCode"),
  verificationRef: $nonEmpty,
  expiresAt: import_zod2.z.string().datetime({ offset: true }),
  error: import_zod2.z.literal("CODE_INVALID").nullable()
});
var $payNextAction = obj2({ next: import_zod2.z.literal("pay"), sessionToken: $nonEmpty, orderId: $nonEmpty, quoteInput: $quoteInput });
var CAPTURE_DOCUMENTS = ["IDENTITY_DOCUMENT", "SELFIE", "PROOF_OF_ADDRESS", "PROOF_OF_INCOME"];
var $captureDocument = import_zod2.z.enum(CAPTURE_DOCUMENTS);
var $reaskRequirement = import_zod2.z.union([KycFieldIdSchema, $captureDocument]);
var $reaskReason = import_zod2.z.enum(["EXPIRED", "POOR_QUALITY", "MISMATCH", "REJECTED"]);
var $reask = obj2({
  requirements: import_zod2.z.array($reaskRequirement).min(1).refine(hasUniqueIds2, "requirements must be unique"),
  reason: $reaskReason.nullable()
});
var $kycShape = obj2({
  next: import_zod2.z.literal("kyc"),
  fields: import_zod2.z.array(FormFieldSchema),
  fieldErrors: import_zod2.z.array($fieldError).min(1).optional(),
  reask: $reask.nullable()
});
var $prepareCaptureNextAction = obj2({ next: import_zod2.z.literal("prepareCapture") });
var $captureShape = obj2({
  next: import_zod2.z.literal("capture"),
  kycProvider: KYCProviderSchema,
  accessToken: $nonEmpty,
  expiresAt: import_zod2.z.string().datetime({ offset: true }),
  reask: $reask.nullable()
});
var $waitNextAction = obj2({ next: import_zod2.z.literal("wait"), retryAfterMs: import_zod2.z.number().int().positive().max(6e4) });
var $orderNextAction = obj2({ next: import_zod2.z.literal("order"), orderId: $nonEmpty, quoteInput: $quoteInput });
var $orderPendingNextAction = obj2({
  next: import_zod2.z.literal("orderPending"),
  orderId: $nonEmpty,
  retryAfterMs: import_zod2.z.number().int().positive().max(6e4),
  order: FiatStepResponseSchema.nullable()
});
var checkConsent = (nextAction, context2) => {
  if (!hasUniqueIds2(nextAction.documents.map((document) => document.id))) {
    context2.addIssue({ code: "custom", path: ["documents"], message: "document ids must be unique" });
  }
};
var checkKyc = (nextAction, context2) => {
  const fieldIds = nextAction.fields.map((field) => field.id);
  if (!hasUniqueIds2(fieldIds)) {
    context2.addIssue({ code: "custom", path: ["fields"], message: "field ids must be unique" });
  }
  if (nextAction.fieldErrors?.some((error) => !fieldIds.includes(error.fieldId))) {
    context2.addIssue({ code: "custom", path: ["fieldErrors"], message: "a field error must name a field in this next action" });
  }
  if (nextAction.fieldErrors?.some((error) => error.code && FIELD_OF_CODE[error.code] !== error.fieldId)) {
    context2.addIssue({ code: "custom", path: ["fieldErrors"], message: "a field error code must match its field" });
  }
  if (nextAction.reask?.requirements.some((requirement) => !fieldIds.includes(requirement))) {
    context2.addIssue({ code: "custom", path: ["reask"], message: "a kyc reask must name fields in this next action" });
  }
};
var isCaptureDocument = (requirement) => CAPTURE_DOCUMENTS.includes(requirement);
var checkCapture = (nextAction, context2) => {
  if (nextAction.reask?.requirements.some((requirement) => !isCaptureDocument(requirement))) {
    context2.addIssue({ code: "custom", path: ["reask"], message: "a capture reask must name documents only" });
  }
};
var MoonPayConsentNextActionSchema = $consentShape.superRefine(checkConsent);
var MoonPaySessionNextActionSchema = $sessionNextAction;
var MoonPayConnectNextActionSchema = $connectNextAction;
var MoonPayPhoneNextActionSchema = $phoneNextAction;
var MoonPayPhoneCodeNextActionSchema = $phoneCodeNextAction;
var MoonPayPayNextActionSchema = $payNextAction;
var MoonPayKycNextActionSchema = $kycShape.superRefine(checkKyc);
var MoonPayPrepareCaptureNextActionSchema = $prepareCaptureNextAction;
var MoonPayCaptureDocumentSchema = $captureDocument;
var MoonPayReaskRequirementSchema = $reaskRequirement;
var MoonPayReaskReasonSchema = $reaskReason;
var MoonPayReaskSchema = $reask;
var MoonPayCaptureNextActionSchema = $captureShape.superRefine(checkCapture);
var MoonPayWaitNextActionSchema = $waitNextAction;
var MoonPayOrderNextActionSchema = $orderNextAction;
var MoonPayOrderPendingNextActionSchema = $orderPendingNextAction;
var checkNextAction = (response, context2) => {
  if (response.next === "consent") checkConsent(response, context2);
  if (response.next === "kyc") checkKyc(response, context2);
  if (response.next === "capture") checkCapture(response, context2);
};
var $nextActionOptions = [
  $consentShape,
  $sessionNextAction,
  $connectNextAction,
  $kycShape,
  $prepareCaptureNextAction,
  $captureShape,
  $waitNextAction,
  $orderNextAction
];
var $nextAction = import_zod2.z.discriminatedUnion("next", [...$nextActionOptions]).superRefine(checkNextAction);
var MoonPayNextActionSchema = $nextAction;
var $done = obj2({ next: import_zod2.z.literal("done"), order: FiatStepResponseSchema });
var MoonPayDoneSchema = $done;
var $stepRefused = obj2({
  next: import_zod2.z.literal("refused"),
  reason: import_zod2.z.enum(["NOT_ELIGIBLE", "DOCUMENTS_REQUIRED", "FINAL_REJECTION", "CUSTOMER_MISMATCH"]),
  recovery: import_zod2.z.enum(["REQUOTE", "NONE"])
});
var $orderRefused = obj2({
  next: import_zod2.z.literal("refused"),
  reason: import_zod2.z.enum(["CUSTOMER_MISMATCH", "WALLET_MISMATCH", "UNRECORDABLE"]),
  recovery: import_zod2.z.literal("NONE")
});
var $stepResponse2 = import_zod2.z.discriminatedUnion("next", [...$nextActionOptions, $stepRefused]).superRefine(checkNextAction);
var MoonPayStepResponseSchema = $stepResponse2;
var $orderResponse = import_zod2.z.discriminatedUnion("next", [$done, $orderNextAction, $orderPendingNextAction, $orderRefused]);
var MoonPayOrderResponseSchema = $orderResponse;
var MoonPayResponseSchemaFor = {
  observe: MoonPayStepResponseSchema,
  consent: MoonPayStepResponseSchema,
  session: MoonPayStepResponseSchema,
  connect: MoonPayStepResponseSchema,
  kyc: MoonPayStepResponseSchema,
  prepareCapture: MoonPayStepResponseSchema,
  capture: MoonPayStepResponseSchema,
  order: MoonPayOrderResponseSchema
};
var $faultFields = {
  reason: import_zod2.z.enum([
    "SESSION_BUDGET_SPENT",
    "RATE_LIMITED",
    "PROVIDER_UNAVAILABLE",
    "KYC_PROVIDER_UNAVAILABLE",
    "SERVICE_UNAVAILABLE",
    "INVALID_REQUEST"
  ]),
  recovery: import_zod2.z.enum(["RETRY", "REQUOTE", "NONE"])
};
var $fault = obj2($faultFields);
var MoonPayFaultSchema = $fault;
var $errorBody = obj2({ ...$faultFields, errorCode: $nonEmpty, errorMsg: import_zod2.z.string(), reqId: import_zod2.z.string().optional() });
var MoonPayErrorBodySchema = $errorBody;

// src/providers/coinbase.ts
var COINBASE_ENDPOINTS = {
  next: "POST /fiat/next"
};
var COINBASE_TERMS = {
  id: "COINBASE_TERMS",
  kind: "PROVIDER_TERMS",
  stage: "CHECKOUT",
  version: "2026-01",
  contentDigest: "22db1a8292d9ecd60b53adf640c8748ad8477646c26a31971a83f7a43457f1fe",
  links: [{ label: "Coinbase User Agreement", url: "https://www.coinbase.com/legal/user_agreement" }]
};

// src/providers/coinbase.schemas.ts
var import_zod3 = require("zod");
var obj3 = (shape) => import_zod3.z.object(shape).strict();
var $nonEmpty2 = import_zod3.z.string().refine((value) => value.trim().length > 0, "must not be blank");
var hasUniqueIds3 = (ids) => new Set(ids).size === ids.length;
var $retryAfterMs = import_zod3.z.number().int().positive().max(6e4);
var $positiveAmount = import_zod3.z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, "must be a decimal string").refine((amount) => Number(amount) > 0, "must be positive");
var $checkout2 = obj3({
  amount: obj3({ currency: import_zod3.z.literal("USD"), amount: $positiveAmount }),
  destination: obj3({ asset: $nonEmpty2, network: $nonEmpty2 }),
  paymentMethod: import_zod3.z.literal("apple_pay")
});
var CoinbaseCheckoutSchema = $checkout2;
var contextFields = { checkout: $checkout2, destinationAsset: DestinationAssetSchema.optional() };
var $requestContext2 = obj3(contextFields);
var CoinbaseRequestContextSchema = $requestContext2;
var observeFields = { action: import_zod3.z.literal("observe") };
var consentFields = {
  action: import_zod3.z.literal("consent"),
  acceptances: import_zod3.z.array(TermsDocumentAcceptanceSchema).min(1).refine((acceptances) => hasUniqueIds3(acceptances.map((acceptance) => acceptance.documentId)), "each document is accepted once")
};
var sessionPhoneFields = { action: import_zod3.z.literal("session"), phoneNumber: import_zod3.z.string().regex(/^\+[1-9]\d{1,14}$/) };
var sessionResendFields = { action: import_zod3.z.literal("session"), resend: $nonEmpty2 };
var otpFields = { action: import_zod3.z.literal("otp"), verificationRef: $nonEmpty2, otpCode: import_zod3.z.string().regex(/^\d{6}$/) };
var $kycValues = import_zod3.z.record(KycFieldIdSchema, import_zod3.z.string());
var kycFields = { action: import_zod3.z.literal("kyc"), values: $kycValues };
var $mintedOrderId = import_zod3.z.string().regex(/^cbo_[A-Za-z0-9_-]{22}$/, "must be an order id a placeOrder answer minted");
var placeOrderFields = { action: import_zod3.z.literal("placeOrder"), orderId: $mintedOrderId };
var orderFields = { action: import_zod3.z.literal("order"), orderId: $mintedOrderId };
var $observeRequest2 = obj3({ ...contextFields, ...observeFields });
var $consentRequest2 = obj3({ ...contextFields, ...consentFields });
var $sessionRequest2 = import_zod3.z.union([obj3({ ...contextFields, ...sessionPhoneFields }), obj3({ ...contextFields, ...sessionResendFields })]);
var $otpRequest = obj3({ ...contextFields, ...otpFields });
var $kycRequest2 = obj3({ ...contextFields, ...kycFields });
var $placeOrderRequest = obj3({ ...contextFields, ...placeOrderFields });
var $orderRequest2 = obj3({ ...contextFields, ...orderFields });
var CoinbaseObserveRequestSchema = $observeRequest2;
var CoinbaseConsentRequestSchema = $consentRequest2;
var CoinbaseSessionRequestSchema = $sessionRequest2;
var CoinbaseOtpRequestSchema = $otpRequest;
var CoinbaseKycRequestSchema = $kycRequest2;
var CoinbasePlaceOrderRequestSchema = $placeOrderRequest;
var CoinbaseOrderRequestSchema = $orderRequest2;
var $request2 = import_zod3.z.union([$observeRequest2, $consentRequest2, $sessionRequest2, $otpRequest, $kycRequest2, $placeOrderRequest, $orderRequest2]);
var CoinbaseRequestSchema = $request2;
var envelope = { provider: import_zod3.z.literal("COINBASE"), geo: FiatGeoSchema, depositAddress: $nonEmpty2.optional(), ...contextFields };
var $nextRequest3 = import_zod3.z.union([
  obj3({ ...envelope, ...observeFields }),
  obj3({ ...envelope, ...consentFields }),
  obj3({ ...envelope, ...sessionPhoneFields }),
  obj3({ ...envelope, ...sessionResendFields }),
  obj3({ ...envelope, ...otpFields }),
  obj3({ ...envelope, ...kycFields }),
  obj3({ ...envelope, ...placeOrderFields }),
  obj3({ ...envelope, ...orderFields })
]);
var CoinbaseNextRequestSchema = $nextRequest3;
var $price = obj3({
  total: FiatAmountSchema,
  fees: import_zod3.z.array(FeeLineSchema),
  cryptoAmount: $nonEmpty2,
  feeSubsidy: FiatAmountSchema.optional()
});
var CoinbasePriceSchema = $price;
var $reask2 = obj3({
  requirements: import_zod3.z.array(KycFieldIdSchema).min(1).refine(hasUniqueIds3, "requirements must be unique"),
  reason: import_zod3.z.enum(["REJECTED"]).nullable()
});
var CoinbaseReaskSchema = $reask2;
var $consentShape2 = obj3({ next: import_zod3.z.literal("consent"), documents: import_zod3.z.array(TermsDocumentSchema).min(1) });
var $sessionNextAction2 = obj3({ next: import_zod3.z.literal("session"), error: import_zod3.z.literal("CODE_EXPIRED").nullable() });
var $otpNextAction = obj3({
  next: import_zod3.z.literal("otp"),
  verificationRef: $nonEmpty2,
  expiresAt: import_zod3.z.string().datetime({ offset: true }),
  error: import_zod3.z.literal("CODE_INVALID").nullable()
});
var $kycShape2 = obj3({
  next: import_zod3.z.literal("kyc"),
  fields: import_zod3.z.array(FormFieldSchema),
  fieldErrors: import_zod3.z.array(obj3({ fieldId: $nonEmpty2, message: $nonEmpty2 })).min(1).optional(),
  reask: $reask2.nullable()
});
var $waitNextAction2 = obj3({ next: import_zod3.z.literal("wait"), retryAfterMs: $retryAfterMs });
var $placeOrderNextAction = obj3({ next: import_zod3.z.literal("placeOrder"), price: $price, orderId: $nonEmpty2 });
var $payNextAction2 = obj3({
  next: import_zod3.z.literal("pay"),
  orderId: $nonEmpty2,
  price: $price,
  // As the shared links are checked: `z.string().url()` would also take `http:` and `javascript:`.
  paymentLink: obj3({ url: import_zod3.z.string().regex(/^https:\/\/\S+$/, "must be an https URL") }),
  environment: import_zod3.z.enum(["sandbox", "production"])
});
var $orderPendingNextAction2 = obj3({
  next: import_zod3.z.literal("orderPending"),
  orderId: $nonEmpty2,
  retryAfterMs: $retryAfterMs,
  order: FiatStepResponseSchema.nullable()
});
var checkConsent2 = (nextAction, context2) => {
  if (!hasUniqueIds3(nextAction.documents.map((document) => document.id))) {
    context2.addIssue({ code: "custom", path: ["documents"], message: "document ids must be unique" });
  }
};
var checkKyc2 = (nextAction, context2) => {
  const fieldIds = nextAction.fields.map((field) => field.id);
  if (!hasUniqueIds3(fieldIds)) {
    context2.addIssue({ code: "custom", path: ["fields"], message: "field ids must be unique" });
  }
  if (nextAction.fieldErrors?.some((error) => !fieldIds.includes(error.fieldId))) {
    context2.addIssue({ code: "custom", path: ["fieldErrors"], message: "a field error must name a field in this next action" });
  }
  if (nextAction.reask?.requirements.some((requirement) => !fieldIds.includes(requirement))) {
    context2.addIssue({ code: "custom", path: ["reask"], message: "a kyc reask must name fields in this next action" });
  }
};
var CoinbaseConsentNextActionSchema = $consentShape2.superRefine(checkConsent2);
var CoinbaseSessionNextActionSchema = $sessionNextAction2;
var CoinbaseOtpNextActionSchema = $otpNextAction;
var CoinbaseKycNextActionSchema = $kycShape2.superRefine(checkKyc2);
var CoinbaseWaitNextActionSchema = $waitNextAction2;
var CoinbasePlaceOrderNextActionSchema = $placeOrderNextAction;
var CoinbasePayNextActionSchema = $payNextAction2;
var CoinbaseOrderPendingNextActionSchema = $orderPendingNextAction2;
var checkNextAction2 = (response, context2) => {
  if (response.next === "consent") checkConsent2(response, context2);
  if (response.next === "kyc") checkKyc2(response, context2);
};
var $nextActionOptions2 = [
  $consentShape2,
  $sessionNextAction2,
  $otpNextAction,
  $kycShape2,
  $waitNextAction2,
  $placeOrderNextAction,
  $payNextAction2,
  $orderPendingNextAction2
];
var $nextAction2 = import_zod3.z.discriminatedUnion("next", [...$nextActionOptions2]).superRefine(checkNextAction2);
var CoinbaseNextActionSchema = $nextAction2;
var $done2 = obj3({ next: import_zod3.z.literal("done"), order: FiatStepResponseSchema });
var CoinbaseDoneSchema = $done2;
var $refused = import_zod3.z.union([
  obj3({
    next: import_zod3.z.literal("refused"),
    reason: import_zod3.z.enum(["NOT_ELIGIBLE", "KYC_UPGRADE_REJECTED", "FINAL_REJECTION", "TOTAL_MISMATCH"]),
    recovery: import_zod3.z.enum(["REQUOTE", "NONE"])
  }),
  obj3({
    next: import_zod3.z.literal("refused"),
    reason: import_zod3.z.literal("LIMITS_EXCEEDED"),
    recovery: import_zod3.z.literal("REQUOTE"),
    maxAmount: FiatAmountSchema.nullable()
  })
]);
var CoinbaseRefusedSchema = $refused;
var $stepResponse3 = import_zod3.z.union([import_zod3.z.discriminatedUnion("next", [...$nextActionOptions2, $done2]), $refused]).superRefine(checkNextAction2);
var CoinbaseStepResponseSchema = $stepResponse3;
var $orderResponse2 = import_zod3.z.discriminatedUnion("next", [$done2, $orderPendingNextAction2]);
var CoinbaseOrderResponseSchema = $orderResponse2;
var CoinbaseResponseSchemaFor = {
  observe: CoinbaseStepResponseSchema,
  consent: CoinbaseStepResponseSchema,
  session: CoinbaseStepResponseSchema,
  otp: CoinbaseStepResponseSchema,
  kyc: CoinbaseStepResponseSchema,
  placeOrder: CoinbaseStepResponseSchema,
  order: CoinbaseOrderResponseSchema
};
var faultFields = {
  reason: import_zod3.z.enum(["SESSION_BUDGET_SPENT", "RATE_LIMITED", "PROVIDER_UNAVAILABLE", "KYC_PROVIDER_UNAVAILABLE", "SERVICE_UNAVAILABLE", "INVALID_REQUEST"]),
  recovery: import_zod3.z.enum(["RETRY", "REQUOTE", "NONE"])
};
var $fault2 = obj3(faultFields);
var CoinbaseFaultSchema = $fault2;
var $errorBody2 = obj3({
  ...faultFields,
  errorCode: $nonEmpty2,
  errorMsg: import_zod3.z.string(),
  reqId: import_zod3.z.string().optional(),
  retryAfterSeconds: import_zod3.z.number().int().positive().optional()
});
var CoinbaseErrorBodySchema = $errorBody2;

// src/providers/stripe.ts
var STRIPE_ENDPOINTS = {
  next: "POST /fiat/next"
};

// src/providers/stripe.schemas.ts
var import_zod4 = require("zod");
var obj4 = (shape) => import_zod4.z.object(shape).strict();
var nonEmpty = import_zod4.z.string().refine((value) => value.trim().length > 0, "must not be blank");
var hasUniqueIds4 = (ids) => new Set(ids).size === ids.length;
var retryAfterMs = import_zod4.z.number().int().positive().max(6e4);
var usdAmount = import_zod4.z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/, "must be a USD amount in cents").refine((amount) => Number(amount) > 0, "must be positive");
var kycValues = import_zod4.z.record(KycFieldIdSchema, import_zod4.z.string());
var instant = import_zod4.z.string().datetime({ offset: true });
var checkout = obj4({
  amount: obj4({ currency: import_zod4.z.literal("USD"), amount: usdAmount }),
  destination: obj4({ asset: nonEmpty, network: nonEmpty }),
  paymentMethod: import_zod4.z.literal("apple_pay")
});
var StripeCheckoutSchema = checkout;
var contextFields2 = { checkout };
var requestContext = obj4(contextFields2);
var StripeRequestContextSchema = requestContext;
var mintedOrderId = import_zod4.z.string().regex(/^sto_[A-Za-z0-9_-]{22}$/, "must be an order id a placeOrder answer minted");
var heldOrder = { orderId: mintedOrderId.optional() };
var observeFields2 = { action: import_zod4.z.literal("observe"), ...heldOrder };
var consentFields2 = {
  action: import_zod4.z.literal("consent"),
  acceptances: import_zod4.z.array(TermsDocumentAcceptanceSchema).min(1).refine((acceptances) => hasUniqueIds4(acceptances.map((acceptance) => acceptance.documentId)), "each document is accepted once"),
  ...heldOrder
};
var sessionFields = { action: import_zod4.z.literal("session"), ...heldOrder };
var authorizeConsentedFields = {
  action: import_zod4.z.literal("authorize"),
  linkAuthIntentId: nonEmpty,
  outcome: import_zod4.z.literal("Consented"),
  customerId: nonEmpty,
  ...heldOrder
};
var authorizeDeclinedFields = { action: import_zod4.z.literal("authorize"), linkAuthIntentId: nonEmpty, outcome: import_zod4.z.enum(["Denied", "Cancelled"]), ...heldOrder };
var correctionRound = import_zod4.z.number().int().nonnegative();
var kycFields2 = { action: import_zod4.z.literal("kyc"), correctionRound, values: kycValues, ...heldOrder };
var placeOrderFields2 = { action: import_zod4.z.literal("placeOrder"), orderId: mintedOrderId, cryptoPaymentToken: nonEmpty };
var checkoutFields = { action: import_zod4.z.literal("checkout"), orderId: mintedOrderId, callbackId: import_zod4.z.string().regex(/^[A-Za-z0-9_-]{1,200}$/) };
var orderFields2 = { action: import_zod4.z.literal("order"), orderId: mintedOrderId };
var observeRequest = obj4({ ...contextFields2, ...observeFields2 });
var consentRequest = obj4({ ...contextFields2, ...consentFields2 });
var sessionRequest = obj4({ ...contextFields2, ...sessionFields });
var authorizeRequest = import_zod4.z.union([obj4({ ...contextFields2, ...authorizeConsentedFields }), obj4({ ...contextFields2, ...authorizeDeclinedFields })]);
var kycRequest = obj4({ ...contextFields2, ...kycFields2 });
var placeOrderRequest = obj4({ ...contextFields2, ...placeOrderFields2 });
var checkoutRequest = obj4({ ...contextFields2, ...checkoutFields });
var orderRequest = obj4({ ...contextFields2, ...orderFields2 });
var StripeObserveRequestSchema = observeRequest;
var StripeConsentRequestSchema = consentRequest;
var StripeSessionRequestSchema = sessionRequest;
var StripeAuthorizeRequestSchema = authorizeRequest;
var StripeKycRequestSchema = kycRequest;
var StripePlaceOrderRequestSchema = placeOrderRequest;
var StripeCheckoutRequestSchema = checkoutRequest;
var StripeOrderRequestSchema = orderRequest;
var request = import_zod4.z.union([observeRequest, consentRequest, sessionRequest, authorizeRequest, kycRequest, placeOrderRequest, checkoutRequest, orderRequest]);
var StripeRequestSchema = request;
var envelope2 = { provider: import_zod4.z.literal("STRIPE"), geo: FiatGeoSchema, ...contextFields2 };
var nextRequest = import_zod4.z.union([
  obj4({ ...envelope2, ...observeFields2 }),
  obj4({ ...envelope2, ...consentFields2 }),
  obj4({ ...envelope2, ...sessionFields }),
  obj4({ ...envelope2, ...authorizeConsentedFields }),
  obj4({ ...envelope2, ...authorizeDeclinedFields }),
  obj4({ ...envelope2, ...kycFields2 }),
  obj4({ ...envelope2, ...placeOrderFields2 }),
  obj4({ ...envelope2, ...checkoutFields }),
  obj4({ ...envelope2, ...orderFields2 })
]);
var StripeNextRequestSchema = nextRequest;
var price = obj4({ total: FiatAmountSchema, fees: import_zod4.z.array(FeeLineSchema), cryptoAmount: nonEmpty });
var StripePriceSchema = price;
var paySheet = obj4({
  destinationCurrency: nonEmpty,
  destinationNetwork: nonEmpty,
  walletAddress: nonEmpty,
  merchantCountryCode: import_zod4.z.literal("US"),
  currencyCode: import_zod4.z.literal("USD"),
  amount: usdAmount,
  label: nonEmpty
});
var StripePaySheetSchema = paySheet;
var linkAuthToken = obj4({ clientSecret: nonEmpty, expiresAt: instant });
var StripeLinkAuthTokenSchema = linkAuthToken;
var reask = obj4({
  requirements: import_zod4.z.array(KycFieldIdSchema).min(1).refine(hasUniqueIds4, "requirements must be unique"),
  reason: import_zod4.z.enum(["REJECTED"]).nullable()
});
var StripeReaskSchema = reask;
var consentShape = obj4({ next: import_zod4.z.literal("consent"), documents: import_zod4.z.array(TermsDocumentSchema).min(1) });
var sessionNextAction = obj4({ next: import_zod4.z.literal("session") });
var authorizeNextAction = obj4({ next: import_zod4.z.literal("authorize"), linkAuthIntentId: nonEmpty, expiresAt: instant });
var kycShape = obj4({
  next: import_zod4.z.literal("kyc"),
  round: import_zod4.z.enum(["ACCOUNT", "IDENTITY"]),
  tier: import_zod4.z.enum(["l0", "l1"]),
  correctionRound,
  fields: import_zod4.z.array(FormFieldSchema),
  heldValues: kycValues,
  verifiedEmail: nonEmpty.nullable(),
  linkAuthToken: linkAuthToken.nullable(),
  fieldErrors: import_zod4.z.array(obj4({ fieldId: nonEmpty, message: nonEmpty })).min(1).optional(),
  reask: reask.nullable()
});
var verifyIdentityNextAction = obj4({ next: import_zod4.z.literal("verifyIdentity"), linkAuthToken: linkAuthToken.nullable() });
var waitNextAction = obj4({ next: import_zod4.z.literal("wait"), retryAfterMs });
var placeOrderNextAction = obj4({
  next: import_zod4.z.literal("placeOrder"),
  orderId: mintedOrderId,
  price,
  paySheet,
  linkAuthToken: linkAuthToken.nullable()
});
var payNextAction = obj4({ next: import_zod4.z.literal("pay"), orderId: mintedOrderId, sessionId: nonEmpty, linkAuthToken: linkAuthToken.nullable() });
var checkoutSecretNextAction = obj4({ next: import_zod4.z.literal("checkoutSecret"), clientSecret: nonEmpty });
var orderPendingNextAction = obj4({
  next: import_zod4.z.literal("orderPending"),
  orderId: mintedOrderId,
  retryAfterMs,
  order: FiatStepResponseSchema.nullable()
});
var checkConsent3 = (nextAction, context2) => {
  if (!hasUniqueIds4(nextAction.documents.map((document) => document.id))) {
    context2.addIssue({ code: "custom", path: ["documents"], message: "document ids must be unique" });
  }
};
var checkKyc3 = (nextAction, context2) => {
  const fieldIds = nextAction.fields.map((field) => field.id);
  if (!hasUniqueIds4(fieldIds)) {
    context2.addIssue({ code: "custom", path: ["fields"], message: "field ids must be unique" });
  }
  if (nextAction.fieldErrors?.some((error) => !fieldIds.includes(error.fieldId))) {
    context2.addIssue({ code: "custom", path: ["fieldErrors"], message: "a field error must name a field in this next action" });
  }
  if (nextAction.reask?.requirements.some((requirement) => !fieldIds.includes(requirement))) {
    context2.addIssue({ code: "custom", path: ["reask"], message: "a kyc reask must name fields in this next action" });
  }
  if (nextAction.round === "ACCOUNT" !== (nextAction.verifiedEmail !== null)) {
    context2.addIssue({ code: "custom", path: ["verifiedEmail"], message: "only the account round carries the verified email" });
  }
};
var checkPlaceOrder = (nextAction, context2) => {
  if (nextAction.paySheet.amount !== nextAction.price.total.amount) {
    context2.addIssue({ code: "custom", path: ["paySheet", "amount"], message: "the sheet charges the price shown" });
  }
};
var StripeConsentNextActionSchema = consentShape.superRefine(checkConsent3);
var StripeSessionNextActionSchema = sessionNextAction;
var StripeAuthorizeNextActionSchema = authorizeNextAction;
var StripeKycNextActionSchema = kycShape.superRefine(checkKyc3);
var StripeVerifyIdentityNextActionSchema = verifyIdentityNextAction;
var StripeWaitNextActionSchema = waitNextAction;
var StripePlaceOrderNextActionSchema = placeOrderNextAction.superRefine(checkPlaceOrder);
var StripePayNextActionSchema = payNextAction;
var StripeCheckoutSecretNextActionSchema = checkoutSecretNextAction;
var StripeOrderPendingNextActionSchema = orderPendingNextAction;
var checkNextAction3 = (response, context2) => {
  if (response.next === "consent") checkConsent3(response, context2);
  if (response.next === "kyc") checkKyc3(response, context2);
  if (response.next === "placeOrder") checkPlaceOrder(response, context2);
};
var nextActionOptions = [
  consentShape,
  sessionNextAction,
  authorizeNextAction,
  kycShape,
  verifyIdentityNextAction,
  waitNextAction,
  placeOrderNextAction,
  payNextAction,
  orderPendingNextAction
];
var anyNextAction = import_zod4.z.discriminatedUnion("next", [...nextActionOptions]).superRefine(checkNextAction3);
var StripeNextActionSchema = anyNextAction;
var done = obj4({ next: import_zod4.z.literal("done"), order: FiatStepResponseSchema });
var StripeDoneSchema = done;
var refused = import_zod4.z.union([
  obj4({
    next: import_zod4.z.literal("refused"),
    reason: import_zod4.z.enum(["NOT_ELIGIBLE", "KYC_REJECTED", "FINAL_REJECTION", "TOTAL_MISMATCH"]),
    recovery: import_zod4.z.enum(["REQUOTE", "NONE"])
  }),
  obj4({
    next: import_zod4.z.literal("refused"),
    reason: import_zod4.z.literal("LIMITS_EXCEEDED"),
    recovery: import_zod4.z.literal("REQUOTE"),
    maxAmount: FiatAmountSchema.nullable()
  })
]);
var StripeRefusedSchema = refused;
var stepResponse = import_zod4.z.union([import_zod4.z.discriminatedUnion("next", [...nextActionOptions, done]), refused]).superRefine(checkNextAction3);
var StripeStepResponseSchema = stepResponse;
var checkoutResponse = import_zod4.z.union([import_zod4.z.discriminatedUnion("next", [...nextActionOptions, done, checkoutSecretNextAction]), refused]).superRefine(checkNextAction3);
var StripeCheckoutResponseSchema = checkoutResponse;
var orderResponse = import_zod4.z.discriminatedUnion("next", [done, orderPendingNextAction]);
var StripeOrderResponseSchema = orderResponse;
var StripeResponseSchemaFor = {
  observe: StripeStepResponseSchema,
  consent: StripeStepResponseSchema,
  session: StripeStepResponseSchema,
  authorize: StripeStepResponseSchema,
  kyc: StripeStepResponseSchema,
  placeOrder: StripeStepResponseSchema,
  checkout: StripeCheckoutResponseSchema,
  order: StripeOrderResponseSchema
};
var faultFields2 = {
  reason: import_zod4.z.enum(["SESSION_BUDGET_SPENT", "RATE_LIMITED", "PROVIDER_UNAVAILABLE", "KYC_PROVIDER_UNAVAILABLE", "SERVICE_UNAVAILABLE", "INVALID_REQUEST"]),
  recovery: import_zod4.z.enum(["RETRY", "REQUOTE", "NONE"])
};
var fault = obj4(faultFields2);
var StripeFaultSchema = fault;
var errorBody = obj4({
  ...faultFields2,
  errorCode: nonEmpty,
  errorMsg: import_zod4.z.string(),
  reqId: import_zod4.z.string().optional(),
  retryAfterSeconds: import_zod4.z.number().int().nonnegative().optional()
});
var StripeErrorBodySchema = errorBody;

// src/providers/moonpay-guest.schemas.ts
var import_zod5 = require("zod");
var context = { checkout: MoonPayCheckoutSchema, destinationAsset: DestinationAssetSchema.optional() };
var obj5 = (shape) => import_zod5.z.object(shape).strict();
var nonEmpty2 = import_zod5.z.string().refine((value) => value.trim().length > 0, "must not be blank");
var actions = [
  { action: import_zod5.z.literal("observe") },
  { action: import_zod5.z.literal("session") },
  { action: import_zod5.z.literal("consent"), acceptances: import_zod5.z.array(TermsDocumentAcceptanceSchema).min(1).refine((values) => new Set(values.map((v) => v.documentId)).size === values.length, "each document is accepted once") },
  { action: import_zod5.z.literal("order"), orderId: nonEmpty2, quotedAmount: FiatAmountSchema, transactionId: nonEmpty2.optional() },
  { action: import_zod5.z.literal("phone"), phoneNumber: import_zod5.z.string().regex(/^\+[1-9]\d{1,14}$/) },
  { action: import_zod5.z.literal("phone"), resend: nonEmpty2 },
  { action: import_zod5.z.literal("phoneCode"), verificationRef: nonEmpty2, otpCode: import_zod5.z.string().regex(/^\d{6}$/) },
  { action: import_zod5.z.literal("decline"), reason: MoonPayGuestDeclineReasonSchema }
];
var MoonPayGuestObserveRequestSchema = obj5({ ...context, ...actions[0] });
var MoonPayGuestSessionRequestSchema = obj5({ ...context, ...actions[1] });
var MoonPayGuestConsentRequestSchema = obj5({ ...context, ...actions[2] });
var MoonPayGuestOrderRequestSchema = obj5({ ...context, ...actions[3] });
var MoonPayGuestPhoneNumberRequestSchema = obj5({ ...context, ...actions[4] });
var MoonPayGuestPhoneResendRequestSchema = obj5({ ...context, ...actions[5] });
var MoonPayGuestPhoneCodeRequestSchema = obj5({ ...context, ...actions[6] });
var MoonPayGuestDeclineRequestSchema = obj5({ ...context, ...actions[7] });
var MoonPayGuestPhoneRequestSchema = import_zod5.z.union([MoonPayGuestPhoneNumberRequestSchema, MoonPayGuestPhoneResendRequestSchema]);
var MoonPayGuestRequestSchema = import_zod5.z.union([
  MoonPayGuestObserveRequestSchema,
  MoonPayGuestSessionRequestSchema,
  MoonPayGuestConsentRequestSchema,
  MoonPayGuestOrderRequestSchema,
  MoonPayGuestPhoneNumberRequestSchema,
  MoonPayGuestPhoneResendRequestSchema,
  MoonPayGuestPhoneCodeRequestSchema,
  MoonPayGuestDeclineRequestSchema
]);
var MoonPayGuestNextRequestSchema = import_zod5.z.union([
  obj5({ provider: import_zod5.z.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[0] }),
  obj5({ provider: import_zod5.z.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[1] }),
  obj5({ provider: import_zod5.z.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[2] }),
  obj5({ provider: import_zod5.z.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[3] }),
  obj5({ provider: import_zod5.z.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[4] }),
  obj5({ provider: import_zod5.z.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[5] }),
  obj5({ provider: import_zod5.z.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[6] }),
  obj5({ provider: import_zod5.z.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[7] })
]);
var MoonPayGuestStepResponseSchema = import_zod5.z.union([
  MoonPayConsentNextActionSchema,
  MoonPaySessionNextActionSchema,
  MoonPayPhoneNextActionSchema,
  MoonPayPhoneCodeNextActionSchema,
  MoonPayPayNextActionSchema,
  obj5({ next: import_zod5.z.literal("refused"), reason: import_zod5.z.enum(["NOT_ELIGIBLE", "FINAL_REJECTION"]), recovery: import_zod5.z.enum(["REQUOTE", "NONE"]) })
]);
var MoonPayGuestResponseSchema = import_zod5.z.union([MoonPayGuestStepResponseSchema, MoonPayOrderResponseSchema]);
