/**
 * fiat-contract — types
 *
 * The published contract between `fun-backend` (emits step responses) and
 * `funkit`/`connect-core` (renders them). Zero runtime logic lives here.
 *
 * Sources of truth (do not extend this file from anywhere else):
 *  - Contract doc: Fiat Client Contract — Step-Driven Flow & Endpoint Schematics
 *    https://app.notion.com/p/3b9fc3b2a002815eb270fa4c818268cc
 *    §"The fiat step response" · §"Conformance package — concrete spec"
 *    §"Proposal (2026-08-13): split InputSpec → params + inputs + expects" (ACCEPTED)
 *  - FE doc: Fiat Frontend — State Machine & Screen Map
 *    https://app.notion.com/p/3bbfc3b2a00281c994c2cebd17b1d6d3
 *    §"✅ Decisions" · per-screen "State details" · §"Event bindings per flow state"
 *
 * Litmus rules encoded here:
 *  - errors are fields, never states (`error?: FailureReason` on every fallible state)
 *  - `params` = server literals · `inputs` = collected FieldSpecs · `expects` = injected surface results
 *  - terminality comes from the table (`src/table.ts`), never from `transitions.length`
 */
import type { FiatCurrencyCode, PaymentMethodCategory } from './codes';
/**
 * JSON value. `params` carry these — opaque literals the client spreads verbatim.
 * Named `JsonValue` rather than `Json` because this package's surface is re-exported wholesale;
 * a bare `Json` is a generic name to put in a consumer's import scope for no benefit.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
/**
 * The harness parses the verb off the endpoint string — SUBMIT is not "POST".
 *
 * Defined locally on purpose: neither the TS lib nor `@types/node` publishes an HTTP-method union
 * (`http.METHODS` is a runtime `string[]`), and the one in `fun-backend`'s `backend-utils`
 * (`GET | PATCH | POST | PUT | DELETE`) is not exported from that package's root — and depending on
 * the backend would invert this package's direction anyway. Deliberately two members, not five: the
 * `/fiat/*` surface uses only these, and a wider union would let the backend emit a verb the
 * harness has no path for.
 */
export type HttpVerb = 'GET' | 'POST';
/**
 * Endpoint strings as emitted: `"POST /fiat/session/verify"`, `"GET /fiat/orders/o_31c"`.
 *
 * A **bounded** union of the documented `/fiat/*` surface (contract §Endpoints), not the open
 * `` `${HttpVerb} /fiat/${string}` `` it started as: bounded catches a typo'd endpoint family
 * (`POST /fiat/orderz`) at compile time, and measured *cheaper* than the open pattern
 * (77,680 vs 77,688 types across this package).
 *
 * On the fun-backend#3984 hazard (unbounded pattern prefixes OOM'd every build at 1.1M types):
 * that blowup came from pattern types keying **mapped types**, where every `keyof` and indexed
 * access re-expands across all members. This type is only ever a field value — never in `keyof`,
 * never a `Record` key, never a mapped-type key — so assignability is a single match per member.
 * Keep it that way: `Record<FiatEndpoint, …>` is the shape that would make this expensive.
 *
 * Per-order paths stay patterns because the id is runtime data (`o_31c`); TS template literals
 * cannot express "no slash", so `GET /fiat/orders/${string}` also admits sub-paths. Precision at
 * that level is the table's job (`allowedTransitions` + `endpointMatches`), not the type's.
 */
export type FiatEndpoint = 'GET /fiat/payment-methods' | 'POST /fiat/quote' | 'POST /fiat/auth' | 'POST /fiat/auth/verify' | 'POST /fiat/auth/refresh' | 'POST /fiat/auth/revoke' | 'POST /fiat/payment-session' | 'POST /fiat/session' | 'POST /fiat/session/verify' | `GET /fiat/quotes/${string}` | 'POST /fiat/kyc/form' | 'POST /fiat/kyc/capture' | 'POST /fiat/kyc/sdk-token' | 'POST /fiat/kyc/document' | 'POST /fiat/instruments' | 'POST /fiat/orders' | `GET /fiat/orders/${string}` | `GET /fiat/delivery/${string}` | `GET /fiat/orders/${string}/instructions` | `POST /fiat/orders/${string}/confirm-payment` | `POST /fiat/orders/${string}/reference` | `POST /fiat/orders/${string}/cancel` | `POST /fiat/orders/${string}/surface-result`;
/**
 * Routing metadata, not sequencing policy. Reserved values may be emitted only after their adapter
 * and conformance fixture land.
 */
export type FiatProvider = 'TRANSAK' | 'SWAPPED' | 'BANXA' | 'MOONPAY' | 'MOONPAY_GUEST' | 'STRIPE' | 'COINBASE' | 'CROSSMINT';
/**
 * The order status vocabulary. Monotonic ranks, no backwards moves. Terminal outcomes are
 * OrderStatus, never FlowState kinds.
 *
 * **This package is the source of truth** (Charles, review 2026-08-14): `fun-backend` should
 * reference these values for the `fiat_orders` table rather than declaring its own copy, so the
 * enum cannot drift between the wire contract and the database.
 *
 * The enum mirrors the backend's real statuses as closely as possible; presentation mapping is the
 * client's job (Jeremy, same thread) — the FE may collapse several of these into one visual state,
 * but the contract does not pre-collapse them.
 */
export type OrderStatus = 'CREATING' | 'AWAITING_PAYMENT' | 'PAYMENT_VERIFYING' | 'PROCESSING' | 'PENDING_DELIVERY' | 'ON_HOLD' | 'CRYPTO_SENT'
/**
 * The provider's crypto reached the deposit address. Terminal for the order. When the order is one leg
 * of a delivery with more legs after it (a crypto conversion into the `destinationAsset`), it offers
 * the `delivery` transition here, and the purchase continues in `DELIVERY`.
 */
 | 'SETTLED' | 'EXPIRED' | 'CANCELLED' | 'FAILED' | 'REFUNDED'
/**
 * A capture that never became an order — the pull-rail orphan (contract Flow A's
 * capture-then-order topology: the component yields a `requestId`, then `createOrder` runs).
 *
 * Added from Charles's review (2026-08-14): it exists in the backend's status set and was missing
 * here. Encoded as a first-class value rather than pre-mapped to `PROCESSING`, because the enum
 * should mirror the source of truth and let the client collapse it for display.
 *
 * TODO(open-decision): its semantics, its position in the monotonic ranks, and its recovery are
 * not published in either doc — `domains/fiat` has not landed in `fun-backend` yet. Treated as
 * NON-terminal here (see `TERMINAL_ORDER_STATUSES`), which is the safe default: a client that
 * wrongly thinks the flow is over stops polling, while one that keeps polling lets the reconciler
 * resolve it. Confirm against the backend's rank map when it lands.
 */
 | 'CAPTURE_ORPHANED';
export type FailureCategory = 'PAYMENT_DECLINED' | 'KYC_REJECTED' | 'PROVIDER_OUTAGE' | 'USER_ERROR' | 'CANCELLED' | 'EXPIRED';
/**
 * Recovery affordance the client renders. Contract spelling is `CONTACT_SUPPORT`
 * (the FE doc's Screen 11 note writes `SUPPORT` as shorthand — same value).
 */
export type Recovery = 'REQUOTE' | 'RETRY_PAYMENT' | 'CONTACT_SUPPORT' | 'NONE';
/** Three expiries, three recoveries (contract §The fiat step response, FailureReason comment). */
export type ExpiredWhich = 'QUOTE' | 'PAYMENT_WINDOW' | 'INSTRUCTIONS';
/**
 * `code?` is a copy key (e.g. `BAD_CODE`), not an error code to branch on.
 * TODO(open-decision): contract OQ7 — the failure/partial-payment enumeration is incomplete.
 * This is the taxonomy as published; new categories land with OQ7.
 */
export type FailureReason = {
    category: Exclude<FailureCategory, 'EXPIRED'>;
    retryable: boolean;
    recovery: Recovery;
    code?: string;
} | {
    category: 'EXPIRED';
    which: ExpiredWhich;
    retryable: boolean;
    recovery: Recovery;
    code?: string;
};
/**
 * Amounts are decimal strings in the docs' step responses ("100.00") — never numbers.
 * Named to pair with `CryptoAmount`: every use site is a `fiat:` field.
 * `currency` is ISO 4217 — see `./codes`.
 */
export interface FiatAmount {
    currency: FiatCurrencyCode;
    amount: string;
}
/** `currency` is the token's ticker symbol (e.g. `"USDC"`) — no ISO-4217-style registry exists for tickers. */
export interface CryptoAmount {
    currency: string;
    network: string;
    amount: string;
}
/** `id` is the client's localization lookup key; `labelFallback` renders for unknown ids. */
export interface FeeLine {
    id: string;
    labelFallback: string;
    amount: string;
}
/**
 * `expiresAt` is BE-stamped, not a provider passthrough (contract §Quote semantics).
 * All v1 quotes are estimates as a global fact, not a field.
 * `paymentMethod` is closed to `PaymentMethodCategory` — see `./codes`.
 */
export interface Quote {
    quoteRef: string;
    fiat: FiatAmount;
    crypto: CryptoAmount;
    rate: string;
    totalFee: string;
    feeBreakdown: FeeLine[];
    paymentMethod: PaymentMethodCategory;
    expiresAt: string;
    /**
     * The fee the partner reimburses after settlement. Absent when this deposit is not subsidized.
     * A prediction: settlement decides again.
     */
    feeSubsidy?: FiatAmount;
}
/** One inclusive amount interval the current routing set can actually serve. */
export interface QuoteLimitRange {
    min: string;
    max: string;
}
/**
 * Input bounds for the quote screen. Decimal strings in the quote currency.
 *
 * `min`/`max` remain the bounding envelope for clients on contract <=0.9. A routing set can have
 * gaps (one path serves a low interval and another a higher interval), so new emitters also carry
 * the exact sorted, non-overlapping intervals in `serviceableRanges`. The field is optional only so
 * an upgraded client can cold-render an older recorded response during a rolling deployment.
 */
export interface QuoteLimits {
    min: string;
    max: string;
    serviceableRanges?: QuoteLimitRange[];
}
/** Deferred to the credit-card iteration (FE doc port ledger) — optional wherever it appears. */
export interface Instrument {
    brandLabel: string;
    last4: string;
}
/** Payload of `PENDING_ORDER` (contract: `OrderRef`). */
export interface OrderRef {
    orderId: string;
    fiat: FiatAmount;
    crypto: CryptoAmount;
    method: PaymentMethodCategory;
    createdAt: string;
    status: OrderStatus;
}
/**
 * Payload of `ORDER{CREATED}` (FE doc Screens 7 · 13 · 14 · 15).
 * `crypto` is optional because the Screen 14/15 responses omit it (fiat-only failure/refund views).
 */
export interface OrderSummary {
    orderId: string;
    fiat: FiatAmount;
    crypto?: CryptoAmount;
    method: PaymentMethodCategory;
    createdAt: string;
    instrument?: Instrument;
}
/**
 * TODO(open-decision): the element shape of `statusHistory` is not defined in either doc
 * (FE doc Screen 7 lists the key; the FE sketch renders `<StatusTimeline history={…}/>`).
 * Encoding the documented minimum — the status only — rather than inventing timestamps.
 */
export interface StatusHistoryEntry {
    status: OrderStatus;
}
export interface Tx {
    chainId: number;
    hash: string;
}
export interface Refund {
    currency: FiatCurrencyCode;
    amount: string;
    expectedBy: string;
}
/** What the user sees, and therefore where it can be placed. */
export type SurfaceKind = 'URL_REDIRECT' | 'KYC_SDK' | 'PCI_COMPONENT' | 'PAY_SHEET' | 'ACH_COMPONENT' | 'AUTH_COMPONENT';
/**
 * Identity vendors Fun verifies into. Its own axis rather than a `FiatProvider` value, because
 * Fun is the KYC-of-record in its own tenant — an identity surface is never the onramp's to mint.
 * `SUMSUB` alone at 0.7; adding a value later is additive, and a vendor with no installed adapter
 * lands on the client's existing unsupported screen.
 */
export type KYCProvider = 'SUMSUB';
/**
 * Which adapter renders the surface. Can differ from `FiatStepResponse.provider`: an identity
 * surface is Fun's to mint, not the onramp's.
 *
 * A routing key only — it never narrows the shape of `params`.
 */
export type SurfaceProvider = FiatProvider | KYCProvider;
/**
 * Carried as data in `QUOTE` (inline in the entry screen's primary slot) and in the CAPTURE
 * phases (a screen of its own). Δ2 unchanged: the CLIENT_SURFACE transition carries only
 * `report`, so a surface is never described twice.
 *
 * `params` is the adapter's vocabulary — opaque here, narrowed at the adapter boundary, and
 * honoured verbatim. A provider's own `environment` value lives here and is never normalised:
 * Transak's is `LOCAL | DEVELOPMENT | STAGING | PRODUCTION`, Banxa's is `sandbox | production`,
 * and URL surfaces carry none, so a Fun-owned enum could only be lossy.
 *
 * `params` values are secrets by default. Client redaction defaults every key closed and opens
 * only names that are safe under *any* provider's vocabulary.
 */
interface SurfaceBase {
    provider: SurfaceProvider;
    params: Record<string, JsonValue>;
    /**
     * When the provider stops honouring the session, if it says so. Lets a client re-quote before
     * the button goes dead; absent, the surface lives as long as the quote that carried it.
     */
    expiresAt?: string;
}
/**
 * Identity-document kinds the Sumsub adapter may prefer for the `IDENTITY` step.
 *
 * These are the Sumsub identity spellings understood by the capture adapter. Adding a new kind is
 * a contract change: the client adapter must know how to pass it to the identity SDK and every
 * relying provider must either map or explicitly decline it.
 */
export type KycIdentityDocumentType = 'PASSPORT' | 'ID_CARD' | 'DRIVERS' | 'RESIDENCE_PERMIT' | 'VISA';
/** Provider-native document definition understood by the selected KYC adapter. */
export interface PreferredIdentityDocument {
    idDocType: KycIdentityDocumentType;
    /** ISO 3166-1 alpha-3 country code expected by the identity-vendor SDK. */
    country: string;
}
/** Canonical KYC values a declarative form or current-session delivery may name. */
export type StandardKycFieldId = 'LEGAL_FIRST_NAME' | 'LEGAL_MIDDLE_NAME' | 'LEGAL_LAST_NAME' | 'DATE_OF_BIRTH' | 'COUNTRY_OF_BIRTH' | 'CITY_OF_BIRTH' | 'NATIONALITY' | 'EMAIL_ADDRESS' | 'EMAIL_OWNERSHIP_VERIFICATION' | 'PHONE_NUMBER' | 'PHONE_OWNERSHIP_VERIFICATION' | 'RESIDENTIAL_ADDRESS_LINE_1' | 'RESIDENTIAL_ADDRESS_LINE_2' | 'RESIDENTIAL_ADDRESS_CITY' | 'RESIDENTIAL_ADDRESS_REGION' | 'RESIDENTIAL_ADDRESS_POSTAL_CODE' | 'RESIDENTIAL_ADDRESS_COUNTRY' | 'TAX_IDENTIFIER' | 'US_SSN_LAST_FOUR' | 'TAX_RESIDENCE_COUNTRY' | 'EMPLOYMENT_STATUS' | 'OCCUPATION_INDUSTRY' | 'OCCUPATION_TITLE' | 'SOURCE_OF_FUNDS_DECLARATION' | 'SOURCE_OF_INCOME_DECLARATION' | 'SOURCE_OF_WEALTH_DECLARATION' | 'PURPOSE_OF_SERVICE' | 'PURPOSE_OF_TRANSACTION' | 'CUSTOMER_CATEGORY';
export type KycAcknowledgementFieldId = 'RISK_ACKNOWLEDGEMENT' | 'COOLING_OFF_ACKNOWLEDGEMENT' | 'TERMS_ACCEPTANCE';
export type QuestionnaireKycFieldId = `QUESTIONNAIRE_RESPONSE:${string}:${string}`;
export type KycFieldId = StandardKycFieldId | KycAcknowledgementFieldId | QuestionnaireKycFieldId;
export interface ClientExecutedDelivery {
    channel: 'CLIENT_EXECUTED';
    /**
     * A hard security boundary: only values entered during this mounted session may be selected.
     * Backend-stored KYC values are never returned to the client through this contract.
     */
    source: 'CURRENT_SESSION_INPUTS';
    /** Server-declared canonical field ids the adapter may select; this carries no field values. */
    allowedFieldIds: KycFieldId[];
}
export type Surface = (SurfaceBase & {
    kind: 'KYC_SDK';
    provider: KYCProvider;
    /** Credentials and adapter configuration only; never backend-stored KYC field values. */
    params: Record<string, JsonValue>;
    preferredDocuments?: {
        IDENTITY: PreferredIdentityDocument;
    };
}) | (SurfaceBase & {
    kind: Exclude<SurfaceKind, 'KYC_SDK'>;
    provider: FiatProvider;
    /** Adapter-owned submission mechanics; the shared contract declares only the safe source. */
    delivery?: ClientExecutedDelivery;
});
/** Provider-owned surfaces that can execute a payment after the quote becomes executable. */
export type PaymentSurfaceKind = 'URL_REDIRECT' | 'PCI_COMPONENT' | 'PAY_SHEET' | 'ACH_COMPONENT';
export type PaymentSurface = Surface & {
    kind: PaymentSurfaceKind;
    provider: FiatProvider;
};
export interface InstructionField {
    id: string;
    labelFallback: string;
    value: string;
}
/**
 * Payload of `PAYMENT{INSTRUCT}` — push rails. Values are PII-adjacent: never logged.
 * TODO(open-decision): contract OQ1 lists `QR_IMAGE` as *deliberately not pre-declared* in the
 * v1 vocabulary while §The fiat step response's Instructions bullet enumerates it. Kept in the union
 * per that section (and the conformance-package spec); handshake-gate it if OQ1 lands the
 * other way.
 * TODO(open-decision): contract OQ7 — expired instructions have no documented recovery and no
 * re-issue endpoint exists.
 */
export type Instructions = {
    kind: 'DEEPLINK';
    url: string;
    /** TODO(open-decision): element shape undocumented (contract: "UPI deeplink ×4 app variants"). */
    appVariants: string[];
} | {
    kind: 'QR_IMAGE';
    url: string;
} | {
    kind: 'BANK_FIELDS';
    fields: InstructionField[];
    expiresAt?: string;
} | {
    kind: 'REFERENCE';
    code: string;
    expiresAt: string;
};
export interface SelectOption {
    id: string;
    labelFallback: string;
}
/** Field types inside a KYC form round. A new field TYPE is a client release (handshake-gated). */
export type FormFieldType = 'TEXT' | 'DATE' | 'SELECT' | 'COUNTRY' | 'FILE' | 'HOSTED_LINK';
interface FormFieldBase {
    id: KycFieldId;
    labelFallback: string;
    required: boolean;
}
/** Invalid property combinations (for example `options` on TEXT) are unrepresentable. */
export type FormField = (FormFieldBase & {
    type: 'TEXT';
    regex?: string;
}) | (FormFieldBase & {
    type: 'DATE';
}) | (FormFieldBase & {
    type: 'SELECT';
    options: SelectOption[];
}) | (FormFieldBase & {
    type: 'COUNTRY';
}) | (FormFieldBase & {
    type: 'FILE';
}) | (FormFieldBase & {
    type: 'HOSTED_LINK';
    url: string;
});
/** Payload of `KYC{INPUT_REQUIRED}`. One uniform renderer walks `fields`. */
export interface FormDescriptor {
    formId: string;
    fields: FormField[];
}
/**
 * A `FieldSpec` describes something the **client collects**. It never carries a value.
 * `FORM_VALUES` = "collect the values of the form already carried in `state.form`" — the
 * transition never re-carries the descriptor (the double-carry disease Δ2 killed).
 *
 * Note: the contract's illustrative list reads `'TEXT' | 'NUMBER' | …`; the conformance-package
 * spec closes the set at the eight below, so `NUMBER` is not declared here.
 */
export type FieldSpec = {
    type: 'TEXT';
    length?: number;
    regex?: string;
    labelFallback?: string;
} | {
    type: 'DATE';
    labelFallback?: string;
} | {
    type: 'COUNTRY';
    labelFallback?: string;
} | {
    type: 'FILE';
    labelFallback?: string;
} | {
    type: 'SELECT';
    options?: SelectOption[];
    labelFallback?: string;
} | {
    type: 'HOSTED_LINK';
    url: string;
    labelFallback?: string;
} | {
    type: 'FORM_VALUES';
} | {
    type: 'TERMS_ACCEPTANCE';
    /** The document being accepted. The client shows it; the user cannot accept what they cannot read. */
    documentUrl: string;
    /**
     * Which revision of that document. Opaque to the client and echoed back verbatim, so a later
     * dispute names the text the user saw rather than whatever is at `documentUrl` today.
     */
    version: string;
    labelFallback?: string;
};
export type FieldSpecType = FieldSpec['type'];
/**
 * What a `TERMS_ACCEPTANCE` input collects. A bare timestamp answers "when" and nothing else; the
 * version is what ties the moment to the words, which is the only part a dispute turns on.
 */
export interface TermsAcceptance {
    /** Echoed from the `FieldSpec`, unmodified. */
    version: string;
    /** ISO-8601, stamped by the client when the user accepted. Never defaulted server-side. */
    acceptedAt: string;
}
/** Server literals — spread into the body verbatim, opaque to the client. */
export type TransitionParams = Record<string, JsonValue>;
/** Client-collected specs — the harness renders + locally validates, then merges values in. */
export type TransitionInputs = Record<string, FieldSpec>;
/**
 * Timing for an `AWAIT` poll.
 *
 * The numbers are bounded by `PollSpecSchema`, not by the type — TypeScript can't express a range.
 * The bounds are part of the contract, enforced on the emitter by conformance tests, so a client
 * can consume these fields directly and does not need to sanitize them:
 *
 * | field | bound |
 * | --- | --- |
 * | `intervalMs` | integer, `500 … 2^31-1` |
 * | `backoffFactor` | finite, `>= 1` (**not** an integer — 1.5 is the recorded value) |
 * | `maxIntervalMs` | integer, `500 … 2^31-1` |
 * | `giveUpAfterMs` | integer, `0 … 2^31-1` |
 *
 * `2^31-1` is the ceiling because a larger `setTimeout` delay is silently truncated to 0, which
 * hot-loops exactly as `intervalMs: 0` would.
 *
 * Two cross-field rules, both enforced by the schema:
 *
 * 1. **`maxIntervalMs` is required whenever `backoffFactor` is present.** A backoff with no ceiling
 *    reaches that same truncation by a slower route. The factor itself is deliberately not capped —
 *    only 1.5 has ever been recorded, so any cap would be arbitrary, whereas requiring the ceiling
 *    that already exists is not.
 * 2. **`maxIntervalMs >= intervalMs`.** A ceiling below the starting interval caps the poll at less
 *    than its own first delay.
 *
 * Note there is deliberately no `giveUpAfterMs >= intervalMs` rule: a deadline shorter than the
 * first interval means "give up without polling", which is coherent and legitimately emittable.
 */
export interface PollSpec {
    endpoint: FiatEndpoint;
    params?: TransitionParams;
    /** Integer, `500 … 2^31-1`. */
    intervalMs: number;
    /** Finite, `>= 1`. Not constrained to an integer: 1.5 is legitimate. Requires `maxIntervalMs`. */
    backoffFactor?: number;
    /** Integer, `500 … 2^31-1`. Required when `backoffFactor` is present. */
    maxIntervalMs?: number;
    /** Integer, `0 … 2^31-1`. */
    giveUpAfterMs?: number;
}
export interface ReportSpec {
    endpoint: FiatEndpoint;
    params?: TransitionParams;
    /**
     * Names the harness copies out of the surface result into the body (e.g. `["requestId"]`).
     * Declared so conformance can assert the surface actually yields them.
     */
    expects?: string[];
    /** Typed SDK result injected under `bodyKey`; mutually exclusive outcome shapes are below. */
    result?: {
        type: 'KYC_SDK_RESULT';
        bodyKey: string;
    };
}
/**
 * Client report for a KYC SDK launch. This reports SDK completion, not KYC eligibility: only the
 * backend's authoritative provider read can advance eligibility.
 */
export type KycSdkResultReport = {
    outcome: 'COMPLETED';
} | {
    outcome: 'FAILED';
    errorType: string;
};
export type TransitionMode = 'SUBMIT' | 'AWAIT' | 'CLIENT_SURFACE';
/**
 * Body assembly, harness-owned, one rule:
 *   `body = {…params, …collected(inputs), …injected(expects)}`
 * A key collision across the three sources is a contract violation (see `assertLegalEmission`),
 * never last-write-wins.
 *
 * `id` keys localization; `labelFallback` renders for ids the client doesn't recognize and rides
 * SUBMIT entries only — the user-visible ones.
 */
export type Transition = {
    id: string;
    mode: 'SUBMIT';
    endpoint: FiatEndpoint;
    params?: TransitionParams;
    inputs?: TransitionInputs;
    labelFallback?: string;
} | {
    id: string;
    mode: 'AWAIT';
    poll: PollSpec;
} | {
    id: string;
    mode: 'CLIENT_SURFACE';
    report: ReportSpec;
};
/**
 * A payment surface prepared ahead of the flow state that may execute it.
 *
 * This is inert response metadata, not an active transition. A client may warm the surface while
 * completing auth or KYC, but must expose or report it only after a later response makes the same
 * quote executable. `quoteRef` is explicit so that promotion never relies on provider-owned params.
 */
export interface PreparedPayment {
    quoteRef: string;
    surface: PaymentSurface;
    transition: Extract<Transition, {
        mode: 'CLIENT_SURFACE';
    }>;
}
/** Copy keys a `FUN_AUTH` error may carry in `FailureReason.code`. Every one is `category: 'USER_ERROR'`. */
export type FunAuthErrorCode = 'INVALID_EMAIL' | 'BAD_CODE' | 'CODE_EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'OTP_DISPATCH_THROTTLED';
/** Fun-issued login for a FUN_AUTH user. The SDK never inspects `refreshHandle`. */
export type FiatSession = {
    /** Bearer for every fiat call; verified by the backend by public key. Lifetime ≈ 1 h. */
    accessToken: string;
    /** Opaque; only the backend understands it. Rotates on every refresh. */
    refreshHandle: string;
    /** When `accessToken` stops being accepted (server clock, ms). */
    expiresAtMs: number;
};
/**
 * Body of `POST /fiat/auth`: an `email` from the `start` transition, or a `verificationRef` from
 * `resend`. `resend` carries the `verificationRef` the client holds, even one the server has dropped
 * (expired, too many attempts); the server starts a fresh challenge for the same email while it
 * still remembers the challenge (code expiry plus a short grace), and answers `IDENTIFIER` with
 * `CODE_EXPIRED` once it is forgotten.
 * Transitions carry `params.verificationRef`; the client merges params and inputs into one body.
 * Returns a `FiatStepResponse`: `FUN_AUTH` in phase `CODE`, or phase `IDENTIFIER` with `error` when
 * the start failed with a user-correctable error.
 */
export type FiatAuthStartRequest = {
    email: string;
} | {
    verificationRef: string;
};
/**
 * Body of `POST /fiat/auth/verify`. Returns a `FiatStepResponse`: `FUN_AUTH` in phase `VERIFIED`
 * with `session` for a Fun-run login, or phase `CODE` with `error`.
 */
export type FiatAuthVerifyRequest = {
    verificationRef: string;
    otpCode: string;
};
/**
 * Body of `POST /fiat/auth/refresh`. Returns 200 `FiatAuthRefreshResponse` with a rotated handle, or
 * 401 when the session is revoked, expired or unknown; the SDK then clears its store and re-enters
 * `FUN_AUTH`.
 */
export type FiatAuthRefreshRequest = {
    refreshHandle: string;
};
/** 200 body of `POST /fiat/auth/refresh`. */
export type FiatAuthRefreshResponse = {
    session: FiatSession;
};
/** Body of `POST /fiat/auth/revoke`. Returns 204, and is idempotent. */
export type FiatAuthRevokeRequest = {
    refreshHandle: string;
};
/**
 * The expected length of a provider's KYC review. `BRIEF`: the client stays on its current screen,
 * polling, for up to `holdMs` (at most 600000), then shows the in-review screen. `EXTENDED`: the
 * client shows the in-review screen at once.
 */
export type KycReviewDuration = {
    duration: 'BRIEF';
    holdMs: number;
} | {
    duration: 'EXTENDED';
};
/**
 * The semantic state. Three rules keep this union honest:
 *   1. sub-states are payload discriminants, never new kinds
 *   2. terminal outcomes are OrderStatus (after the order, the `DELIVERY` state), never kinds
 *   3. every fallible state carries `error?: FailureReason`
 */
export type FlowState = 
/**
 * `surface` present means the provider's own component IS the primary CTA, inline on the entry
 * screen — the placement Apple policy forces for a pay sheet, since no visible step may sit
 * between the Apple-branded tap and the sheet. Absent, the quote's SUBMITs drive our button.
 */
{
    kind: 'QUOTE';
    quote: Quote;
    limits: QuoteLimits;
    helper?: string;
    surface?: Surface;
    error?: FailureReason;
}
/**
 * Fun's own email one-time code, for a customer that sends no identity assertion. Entered
 * when the entry quote request (`POST /fiat/routing/quote` or `POST /fiat/quote`) of a Fun-run login carries no session: the server answers it in
 * phase IDENTIFIER with the `start` transition, whose `email` input the SDK collects.
 */
 | {
    kind: 'FUN_AUTH';
    /** Which code the user is asked for. SMS_OTP arrives with phone verification; email-only today. */
    channel: 'EMAIL_OTP' | 'SMS_OTP';
    /** IDENTIFIER collects the email (or phone); CODE collects the code; VERIFIED closes the step. */
    phase: 'IDENTIFIER' | 'CODE' | 'VERIFIED';
    /** CODE: when the outstanding code stops being accepted (server clock, ms). */
    expiresAtMs?: number;
    /** CODE: when `resend` becomes available (server clock, ms). Absent = available now. */
    resendAvailableAtMs?: number;
    /** CODE: wrong codes still accepted before the challenge is dropped. */
    attemptsRemaining?: number;
    error?: FailureReason;
} | {
    kind: 'SESSION_AUTH';
    channel: 'EMAIL_OTP' | 'SMS_OTP' | 'PROVIDER_RENDERED';
    surface?: Surface;
    error?: FailureReason;
}
/**
 * Pre-order KYC normally carries the routed quote so the entry screen can keep price visible.
 * `quote` may be absent when provider auth or activation gates pricing.
 */
 | {
    kind: 'KYC';
    phase: 'CAPTURE';
    quote?: Quote;
    surface: Surface;
    /**
     * Provider-authored guidance for correcting the previous verification attempt. Display-only:
     * clients must use the state and transitions, never this text, to decide whether retry is allowed.
     */
    correctionReason?: string;
    error?: FailureReason;
} | {
    kind: 'KYC';
    phase: 'INPUT_REQUIRED';
    quote?: Quote;
    form: FormDescriptor;
    error?: FailureReason;
} | {
    kind: 'KYC';
    phase: 'NO_ACTION_REQUIRED';
    quote?: Quote;
    /**
     * Note the deliberate name collision (Charles's nit, review 2026-08-14): `ON_HOLD` appears
     * here as a KYC reason *and* in `OrderStatus`. They are different things and both names come
     * from their own doc, so neither is renamed:
     *   - `KYC{NO_ACTION_REQUIRED, ON_HOLD}` = FCA cooling-off, pre-order, `retryAfter` set,
     *     empty transitions, NOT terminal.
     *   - `OrderStatus.ON_HOLD` = post-order compliance or amount mismatch, resolves to
     *     `PROCESSING` or `REFUNDED`.
     * They cannot be confused in code — different types, different positions in the response —
     * but they can be confused in conversation, so say which one you mean.
     */
    reason: 'IN_REVIEW' | 'ON_HOLD' | 'REJECTED';
    retryAfter?: string;
    /** How long the provider's review is expected to take. Set only with `reason: 'IN_REVIEW'`; absent means EXTENDED. */
    review?: KycReviewDuration;
    /**
     * REJECTED is reserved for an explicit non-retryable outcome and renders in place — it
     * never routes through `ORDER{CREATED, FAILED}`. Correctable outcomes return CAPTURE or
     * INPUT_REQUIRED; a provider-specific decline is handled by quote rerouting first.
     */
    failureReason?: FailureReason;
    error?: FailureReason;
}
/**
 * TODO(open-decision): removal proposed (contract §"Proposal: remove PENDING_ORDER").
 * Shipped in 0.1.0 so the current shape is representable; FE Screen 12 is frozen until the
 * decision lands. The removal targets the wizard-interstitial *kind*, not the pending-order
 * concept (which may re-land as an out-of-wizard PENDING_ORDERS view).
 */
 | {
    kind: 'PENDING_ORDER';
    order: OrderRef;
    error?: FailureReason;
} | {
    kind: 'BLOCKED';
    reason: BlockedReason;
    /** `null` renders "no comeback date" (FE doc Screen 16 emits it explicitly). */
    retryAfter?: string | null;
    error?: FailureReason;
} | {
    kind: 'PAYMENT';
    phase: 'CAPTURE';
    surface: Surface;
    error?: FailureReason;
} | {
    kind: 'PAYMENT';
    phase: 'INSTRUCT';
    /**
     * TODO(open-decision): `orderId` placement — beside `state` (contract §Worked example,
     * steps 4–5) vs inside state (FE doc v0, Screen 6). Both are accepted here; the FE doc's
     * in-state placement is the current shape, `FiatStepResponse.orderId` covers the other.
     */
    orderId?: string;
    instructions: Instructions;
    error?: FailureReason;
} | {
    kind: 'ORDER';
    phase: 'AWAITING_CONFIRMATION';
    quote: Quote;
    error?: FailureReason;
} | {
    kind: 'ORDER';
    phase: 'CREATED';
    /** Absent in the contract's terse worked-example responses, present in every FE screen. */
    order?: OrderSummary;
    status: OrderStatus;
    statusHistory?: StatusHistoryEntry[];
    tx?: Tx;
    refund?: Refund;
    failureReason?: FailureReason;
    error?: FailureReason;
}
/**
 * The whole purchase after the order is created, from `GET /fiat/delivery/:deliveryId`: the fiat
 * provider's leg and, on a converted order, the conversion after it. A request that carried a
 * `destinationAsset` gets the `delivery` transition from `ORDER{CREATED}` at creation and polls only
 * here. `PENDING` polls itself; each answer's `giveUpAfterMs` is the time left in one window that
 * starts at the order's creation. `SUCCEEDED` carries the transaction that paid the user. `FAILED`
 * offers no transition: the client offers no new payment from it, and when the buyer paid, support
 * recovers the funds.
 */
 | {
    kind: 'DELIVERY';
    state: 'PENDING';
} | {
    kind: 'DELIVERY';
    state: 'SUCCEEDED';
    txHash: string;
} | {
    kind: 'DELIVERY';
    state: 'FAILED';
};
export type FlowStateKind = FlowState['kind'];
export type DeliveryState = Extract<FlowState, {
    kind: 'DELIVERY';
}>['state'];
export type BlockedReason = 'REGION_UNSUPPORTED' | 'ASSET_UNSUPPORTED' | 'ALL_PROVIDERS_DECLINED' | 'AMOUNT_UNSERVABLE'
/** The installed client did not declare a capability required by every otherwise-viable route. */
 | 'CLIENT_UPGRADE_REQUIRED';
/**
 * Every `/fiat/*` response. `transitions: []` = nothing the wizard can do; whether the *flow*
 * is over is read from the table (`terminal`), never from array emptiness (ON_HOLD is the proof).
 */
type FiatStepResponseBase = {
    transitions: Transition[];
    /**
     * Stable identity for a routing continuation before provider pricing is observable.
     *
     * A quote-less CONTINUE/PENDING response carries this instead of fabricating a `Quote` or
     * `quoteRef`. It may remain present after a real quote is promoted so the backend can preserve
     * the committed provider path independently from the quote binding.
     */
    routingSessionRef?: string;
    /**
     * Short-lived provider credential the client redeems for a silent sign-in before it renders the
     * state. Absent means no silent path; the interactive `SESSION_AUTH` flow still applies.
     */
    providerAuthToken?: {
        clientSecret: string;
        expiresAt: string;
    };
    /** TODO(open-decision): `orderId` placement — see `PAYMENT{INSTRUCT}.orderId` above. */
    orderId?: string;
    /**
     * Best-effort: what this response did may have changed what the buyer can spend, so a cached
     * discovery ceiling is no longer trusted. Absent is not a promise that nothing changed, only
     * that this response is not reporting one, so a client must still tolerate a stale ceiling.
     *
     * Never `false`. A widened or dropped ceiling costs one discovery call; one left too low
     * refuses a purchase the backend would have served, so the uncertain direction is to send it.
     */
    refreshLimits?: true;
};
/**
 * Provider is absent only when routing ended before a provider could be selected. A BLOCKED response
 * may still name a provider for compatibility with provider-specific terminal decisions. `FUN_AUTH`
 * runs before any provider is chosen, so it may omit one too. Every other state is provider-bound
 * and therefore requires one.
 */
export type FiatStepResponse = (FiatStepResponseBase & {
    state: Extract<FlowState, {
        kind: 'BLOCKED';
    }>;
    provider?: FiatProvider;
}) | (FiatStepResponseBase & {
    state: Extract<FlowState, {
        kind: 'FUN_AUTH';
    }>;
    provider?: FiatProvider;
    /**
     * Present on a Fun-run login's VERIFIED response. Absent when the user already holds a customer
     * identity assertion and FUN_AUTH only verified an attribute (phone verification, later phase).
     */
    session?: FiatSession;
}) | (FiatStepResponseBase & {
    state: Exclude<FlowState, {
        kind: 'BLOCKED' | 'FUN_AUTH';
    }>;
    provider: FiatProvider;
    /** Optional future payment artifact; never one of this response's currently active transitions. */
    preparedPayment?: PreparedPayment;
    /**
     * The provider runs its own flow from here (`POST /fiat/next`). Present
     * only on a `QUOTE` selected for a provider-owned checkout flow; the response then
     * carries no transitions. The selected provider owns the flow on `/fiat/next`.
     */
    handoff?: {
        provider: FiatProvider;
    };
});
/**
 * The asset the user receives at the end of the purchase. The client always sends it. The backend
 * compares it with the partner's configured asset and adds a conversion only when they differ,
 * so its presence never turns a conversion on. Every request field that carries it is named
 * `destinationAsset`, optional only so a client that predates it still parses; a missing
 * `destinationAsset` means the partner's configured asset. The recipient always comes from the
 * verified partner assertion or, for a mode-2 partner, from the request's `depositAddress`, never from
 * this field.
 *
 * Split by VM, then by asset kind. Solana carries no chain id: the backend maps each VM to its own
 * chain ids in one place. `NON_FUNGIBLE` is reserved: the backend does not serve it yet and answers
 * it as unservable.
 */
export type DestinationAsset = {
    vm: 'EVM';
    /** The EVM chain id: `8453` for Base. */
    chainId: number;
    asset: {
        kind: 'FUNGIBLE';
        token: {
            type: 'NATIVE';
        } | {
            type: 'ERC20';
            address: `0x${string}`;
        };
    } | {
        kind: 'NON_FUNGIBLE';
        address: `0x${string}`;
        /** A decimal integer string, so a uint256 id keeps its precision. */
        tokenId: string;
    };
} | {
    vm: 'SOLANA';
    /** Every `address` is a base58 mint address. */
    asset: {
        kind: 'FUNGIBLE';
        token: {
            type: 'NATIVE';
        } | {
            type: 'SPL';
            address: string;
        };
    } | {
        kind: 'NON_FUNGIBLE';
        address: string;
    };
};
/** The geo endpoint's response, sent on every `/next` request. `alpha2` is ISO 3166-1 alpha-2. */
export type FiatGeo = {
    alpha2: string;
    region?: string;
    ip?: string;
};
/**
 * The body of every `POST /fiat/next`: `provider`, `geo`, the `destinationAsset`, a mode-2 client's
 * `depositAddress`, and the provider's own request, which names its `action`. Each provider defines
 * its actions and their fields (`./moonpay`).
 */
export type FiatNextRequest = {
    provider: FiatProvider;
    action: string;
    geo: FiatGeo;
    destinationAsset?: DestinationAsset;
    /**
     * The wallet that receives the purchased crypto, on the delivery chain the backend derives from
     * the quote. A mode-2 (`FUN_OTP`) partner's client sends it on every `/fiat/next` request; the
     * backend treats it as the recipient. A mode-1 client omits it; if sent, it must equal the
     * asserted recipient. Carries no chain id.
     */
    depositAddress?: string;
} & Record<string, unknown>;
export {};
