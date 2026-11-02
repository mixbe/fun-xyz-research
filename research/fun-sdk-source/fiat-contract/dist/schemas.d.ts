/**
 * fiat-contract — zod schemas
 *
 * zod is the single runtime validator: TypeScript cannot validate at the boundary, and the
 * table (`src/table.ts`) cannot reject a *malformed* step response — only an illegal *sequence*.
 *
 * Every object schema is `.strict()`: an undeclared key is a contract violation, not extra data.
 *
 * The accepted params/inputs/expects split is enforced structurally here — `params` values are
 * `JsonValue` literals and are *rejected* if they carry a `FieldSpec`-shaped `type`, while `inputs`
 * values must be `FieldSpec` objects. The old double-duty bug is unrepresentable, not discouraged.
 *
 * ## Why every export is annotated `z.ZodType<T>`
 *
 * Left un-annotated, tsc bakes the *structural* zod type into the emitted `.d.ts`
 * (`ZodObject<…, $strip>`, `z.core.$ZodEnum<…>`, object-form `ZodEnum`). Those internals differ
 * between zod majors, so declarations built against zod 4 resolve to errors — or, under the
 * `skipLibCheck: true` that both consumer repos use, silently to `any` — for a consumer on zod 3.
 * Annotating with `z.ZodType<T>` makes the declarations name nothing but `z.ZodType`, which exists
 * with the same 1-argument form in every supported major.
 *
 * The cost: consumers get `.parse` / `.safeParse` / `.optional()`, not `.shape` / `.extend`. That
 * is deliberate — this is a contract to validate against, not a base to compose from.
 *
 * The internal `$`-prefixed consts keep their inferred structural types so the mirror assertions at
 * the bottom of this file still prove the schemas match the hand-written types in `types.ts`.
 * They are module-private, so none of it reaches the published declarations.
 */
import { z } from 'zod';
import type { UsStateCode } from './codes';
import type { BlockedReason, CryptoAmount, FailureReason, FeeLine, FiatAmount, FiatEndpoint, FiatProvider, FiatAuthRefreshRequest, FiatAuthRefreshResponse, FiatAuthRevokeRequest, FiatAuthStartRequest, FiatAuthVerifyRequest, FiatSession, FiatStepResponse, FieldSpec, FlowState, FormDescriptor, FormField, FormFieldType, InstructionField, Instructions, Instrument, JsonValue, KYCProvider, KycReviewDuration, OrderRef, OrderStatus, OrderSummary, PollSpec, PreparedPayment, PaymentSurface, Quote, QuoteLimitRange, QuoteLimits, Recovery, Refund, ReportSpec, SelectOption, StatusHistoryEntry, Surface, PreferredIdentityDocument, KycFieldId, ClientExecutedDelivery, KycSdkResultReport, SurfaceKind, SurfaceProvider, TermsAcceptance, Transition, TransitionInputs, TransitionParams, Tx, DestinationAsset, FiatGeo, FiatNextRequest } from './types';
import type { FiatTermsErrorBody, FiatTermsRequest, FiatTermsResponse, TermsDocument, TermsDocumentAcceptance } from './terms';
import type { FiatRoutingQuoteErrorBody, FiatRoutingQuoteRequest, FiatRoutingQuoteTerms, FiatRoutingTableErrorBody, FiatRoutingTableRequest, FiatRoutingTableResponse } from './routing';
export declare const JsonSchema: z.ZodType<JsonValue>;
export declare const HTTP_VERBS: readonly ["GET", "POST"];
/** `"POST /fiat/session/verify"`, `"GET /fiat/orders/o_31c"` — the verb rides the string. */
export declare const ENDPOINT_PATTERN: RegExp;
export declare const FiatEndpointSchema: z.ZodType<FiatEndpoint>;
export declare const UsStateCodeSchema: z.ZodType<UsStateCode>;
export declare const FiatProviderSchema: z.ZodType<FiatProvider>;
export declare const KYCProviderSchema: z.ZodType<KYCProvider>;
export declare const SurfaceProviderSchema: z.ZodType<SurfaceProvider>;
export declare const OrderStatusSchema: z.ZodType<OrderStatus>;
export declare const RecoverySchema: z.ZodType<Recovery>;
export declare const FailureReasonSchema: z.ZodType<FailureReason>;
export declare const FiatAmountSchema: z.ZodType<FiatAmount>;
export declare const CryptoAmountSchema: z.ZodType<CryptoAmount>;
export declare const FeeLineSchema: z.ZodType<FeeLine>;
export declare const QuoteSchema: z.ZodType<Quote>;
export declare const QuoteLimitRangeSchema: z.ZodType<QuoteLimitRange>;
export declare const QuoteLimitsSchema: z.ZodType<QuoteLimits>;
export declare const InstrumentSchema: z.ZodType<Instrument>;
export declare const OrderRefSchema: z.ZodType<OrderRef>;
export declare const OrderSummarySchema: z.ZodType<OrderSummary>;
export declare const StatusHistoryEntrySchema: z.ZodType<StatusHistoryEntry>;
export declare const TxSchema: z.ZodType<Tx>;
export declare const RefundSchema: z.ZodType<Refund>;
export declare const SurfaceKindSchema: z.ZodType<SurfaceKind>;
export declare const PreferredIdentityDocumentSchema: z.ZodType<PreferredIdentityDocument>;
export declare const STANDARD_KYC_FIELD_IDS: readonly ["LEGAL_FIRST_NAME", "LEGAL_MIDDLE_NAME", "LEGAL_LAST_NAME", "DATE_OF_BIRTH", "COUNTRY_OF_BIRTH", "CITY_OF_BIRTH", "NATIONALITY", "EMAIL_ADDRESS", "EMAIL_OWNERSHIP_VERIFICATION", "PHONE_NUMBER", "PHONE_OWNERSHIP_VERIFICATION", "RESIDENTIAL_ADDRESS_LINE_1", "RESIDENTIAL_ADDRESS_LINE_2", "RESIDENTIAL_ADDRESS_CITY", "RESIDENTIAL_ADDRESS_REGION", "RESIDENTIAL_ADDRESS_POSTAL_CODE", "RESIDENTIAL_ADDRESS_COUNTRY", "TAX_IDENTIFIER", "US_SSN_LAST_FOUR", "TAX_RESIDENCE_COUNTRY", "EMPLOYMENT_STATUS", "OCCUPATION_INDUSTRY", "OCCUPATION_TITLE", "SOURCE_OF_FUNDS_DECLARATION", "SOURCE_OF_INCOME_DECLARATION", "SOURCE_OF_WEALTH_DECLARATION", "PURPOSE_OF_SERVICE", "PURPOSE_OF_TRANSACTION", "CUSTOMER_CATEGORY"];
export declare const KYC_ACKNOWLEDGEMENT_FIELD_IDS: readonly ["RISK_ACKNOWLEDGEMENT", "COOLING_OFF_ACKNOWLEDGEMENT", "TERMS_ACCEPTANCE"];
export declare const KycFieldIdSchema: z.ZodType<KycFieldId>;
export declare const ClientExecutedDeliverySchema: z.ZodType<ClientExecutedDelivery>;
export declare const SurfaceSchema: z.ZodType<Surface>;
export declare const PaymentSurfaceSchema: z.ZodType<PaymentSurface>;
export declare const InstructionFieldSchema: z.ZodType<InstructionField>;
export declare const InstructionsSchema: z.ZodType<Instructions>;
export declare const SelectOptionSchema: z.ZodType<SelectOption>;
export declare const FormFieldTypeSchema: z.ZodType<FormFieldType>;
export declare const FormFieldSchema: z.ZodType<FormField>;
export declare const FormDescriptorSchema: z.ZodType<FormDescriptor>;
export declare const FIELD_SPEC_TYPES: readonly ["TEXT", "DATE", "COUNTRY", "FILE", "SELECT", "HOSTED_LINK", "FORM_VALUES", "TERMS_ACCEPTANCE"];
export declare const FieldSpecSchema: z.ZodType<FieldSpec>;
/** The value a `TERMS_ACCEPTANCE` input yields. */
export declare const TermsAcceptanceSchema: z.ZodType<TermsAcceptance>;
/**
 * True when a `params` value is wearing a `FieldSpec`'s clothes — i.e. the exact defect the
 * accepted split exists to kill (a spec object spread into a request body as if it were a value).
 */
export declare const looksLikeFieldSpec: (value: unknown) => boolean;
export declare const TransitionParamsSchema: z.ZodType<TransitionParams>;
export declare const TransitionInputsSchema: z.ZodType<TransitionInputs>;
export declare const PollSpecSchema: z.ZodType<PollSpec>;
export declare const ReportSpecSchema: z.ZodType<ReportSpec>;
export declare const KycSdkResultReportSchema: z.ZodType<KycSdkResultReport>;
export declare const TransitionSchema: z.ZodType<Transition>;
export declare const PreparedPaymentSchema: z.ZodType<PreparedPayment>;
/** `Extract` keeps each per-state export pinned to the union member it validates. */
type State<K extends FlowState['kind'], P = never> = [P] extends [never] ? Extract<FlowState, {
    kind: K;
}> : Extract<FlowState, {
    kind: K;
    phase: P;
}>;
export declare const QuoteStateSchema: z.ZodType<State<'QUOTE'>>;
export declare const FunAuthStateSchema: z.ZodType<State<'FUN_AUTH'>>;
export declare const FiatSessionSchema: z.ZodType<FiatSession>;
export declare const SessionAuthStateSchema: z.ZodType<State<'SESSION_AUTH'>>;
export declare const KycCaptureStateSchema: z.ZodType<State<'KYC', 'CAPTURE'>>;
export declare const KycInputRequiredStateSchema: z.ZodType<State<'KYC', 'INPUT_REQUIRED'>>;
export declare const KycReviewDurationSchema: z.ZodType<KycReviewDuration>;
export declare const KycNoActionRequiredStateSchema: z.ZodType<State<'KYC', 'NO_ACTION_REQUIRED'>>;
export declare const PendingOrderStateSchema: z.ZodType<State<'PENDING_ORDER'>>;
export declare const BlockedReasonSchema: z.ZodType<BlockedReason>;
export declare const BlockedStateSchema: z.ZodType<State<'BLOCKED'>>;
export declare const PaymentCaptureStateSchema: z.ZodType<State<'PAYMENT', 'CAPTURE'>>;
export declare const PaymentInstructStateSchema: z.ZodType<State<'PAYMENT', 'INSTRUCT'>>;
export declare const OrderAwaitingConfirmationStateSchema: z.ZodType<State<'ORDER', 'AWAITING_CONFIRMATION'>>;
export declare const OrderCreatedStateSchema: z.ZodType<State<'ORDER', 'CREATED'>>;
export declare const DeliveryStateSchema: z.ZodType<State<'DELIVERY'>>;
export declare const FlowStateSchema: z.ZodType<FlowState>;
export declare const TermsDocumentSchema: z.ZodType<TermsDocument>;
export declare const TermsDocumentAcceptanceSchema: z.ZodType<TermsDocumentAcceptance>;
export declare const FiatTermsRequestSchema: z.ZodType<FiatTermsRequest>;
export declare const FiatTermsResponseSchema: z.ZodType<FiatTermsResponse>;
export declare const FiatTermsErrorBodySchema: z.ZodType<FiatTermsErrorBody>;
export declare const DestinationAssetSchema: z.ZodType<DestinationAsset>;
export declare const FiatRoutingTableRequestSchema: z.ZodType<FiatRoutingTableRequest>;
export declare const FiatRoutingTableResponseSchema: z.ZodType<FiatRoutingTableResponse>;
export declare const FiatRoutingQuoteTermsSchema: z.ZodType<FiatRoutingQuoteTerms>;
export declare const FiatRoutingQuoteRequestSchema: z.ZodType<FiatRoutingQuoteRequest>;
export declare const FiatRoutingTableErrorBodySchema: z.ZodType<FiatRoutingTableErrorBody>;
export declare const FiatRoutingQuoteErrorBodySchema: z.ZodType<FiatRoutingQuoteErrorBody>;
export declare const FiatGeoSchema: z.ZodType<FiatGeo>;
export declare const FiatNextRequestSchema: z.ZodType<FiatNextRequest>;
export declare const FiatAuthStartRequestSchema: z.ZodType<FiatAuthStartRequest>;
export declare const FiatAuthVerifyRequestSchema: z.ZodType<FiatAuthVerifyRequest>;
export declare const FiatAuthRefreshRequestSchema: z.ZodType<FiatAuthRefreshRequest>;
export declare const FiatAuthRefreshResponseSchema: z.ZodType<FiatAuthRefreshResponse>;
export declare const FiatAuthRevokeRequestSchema: z.ZodType<FiatAuthRevokeRequest>;
export declare const FiatStepResponseSchema: z.ZodType<FiatStepResponse>;
export {};
