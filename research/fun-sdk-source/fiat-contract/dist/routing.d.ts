/**
 * The routing table: `POST /fiat/routing/table` and `POST /fiat/routing/quote`.
 *
 * The client loads the table when the sheet opens. For each payment method it lists every amount
 * interval and the providers that serve it, best first, each with what it needs from the buyer next.
 * The client then shows min, max, provider and the Continue label for any amount with no call, and
 * quotes only the interval's first provider, and the next one after a fall-through refusal
 * (`FiatRoutingQuoteErrorBody`).
 *
 * The table is advisory: every routing quote checks the named provider's eligibility again. Refetch it
 * at `expiresAt`, on `refreshLimits: true`, and after auth, KYC or a `REQUOTE` refusal.
 *
 * Provider inputs are optional; see `FiatRoutingTableMoonPayInputs` for credential handling.
 * Malformed inputs and unknown keys return 400. Deploy backend support before new provider keys.
 *
 * Changes to both routes only add fields and enum values. Map an unknown `next` to the generic
 * Continue label.
 *
 * Zero runtime dependencies, so production React Native code can import it. The zod schemas are
 * exported from the package root. Like every schema in the package they are strict: a request with
 * an extra key or a blank string fails them, so send only the declared fields.
 */
import type { CountryCode, FiatCurrencyCode, PaymentMethodCategory } from './codes';
import type { FiatAmount, DestinationAsset, FiatProvider, QuoteLimitRange } from './types';
export declare const ROUTING_ENDPOINTS: {
    readonly table: "POST /fiat/routing/table";
    /** Temporary: `POST /fiat/next` replaces it for each provider that moves there. */
    readonly quote: "POST /fiat/routing/quote";
};
/**
 * MoonPay SDK access token (`client.getCredentials().accessToken`). The backend uses the
 * authenticated quote's remaining limits, bounded by corridor limits. Missing, expired or
 * provider-rejected tokens use corridor limits. Omit blank tokens. Sent in the body; never logged.
 */
export interface FiatRoutingTableMoonPayInputs {
    accessToken?: string;
}
/** Provider-specific inputs, keyed by `RoutingProvider`. All keys and fields are optional. */
export interface FiatRoutingTableProviderInputs {
    MOONPAY?: FiatRoutingTableMoonPayInputs;
}
/**
 * The body of `POST /fiat/routing/table`. `country` and `region` are the geo endpoint's `alpha2`
 * and `region`, held to the `POST /fiat/quote` geo rules: a US buyer's `region` must be a
 * `UsStateCode`, and an empty `region` counts as absent.
 */
export interface FiatRoutingTableRequest {
    /** Defaults to `USD`. */
    fiatCurrencyCode?: FiatCurrencyCode;
    cryptoCurrencyCode: string;
    chainId: string;
    country: CountryCode;
    region?: string;
    /** At least one. The response lists each once, in this order. */
    methods: PaymentMethodCategory[];
    /** Optional provider-specific inputs. */
    providers?: FiatRoutingTableProviderInputs;
    /**
     * The asset the user receives. Always sent; the backend adds a conversion only when it differs
     * from the partner's configured asset. Optional so an older client still parses.
     */
    destinationAsset?: DestinationAsset;
    /**
     * The wallet that receives the purchased crypto, on the delivery chain the backend derives from
     * the quote. A mode-2 (`FUN_OTP`) partner's client sends it on every routing-table request; the
     * backend treats it as the recipient. A mode-1 client omits it; if sent, it must equal the
     * asserted recipient. Carries no chain id. It may arrive before sign-in and only shapes the table
     * (conversion routes, fee subsidy); placing an order still requires a Fun session.
     */
    depositAddress?: string;
}
/** What a provider needs from this buyer before it can take the payment. */
export type RoutingNextStep = 'READY' | 'AUTH' | 'DECLARATIVE_KYC' | 'DOCUMENTARY_KYC' | 'PENDING_REVIEW';
/** How much past `next` the backend can see: the whole picture, part of it, or nothing before auth. */
export type RoutingVisibility = 'COMPLETE' | 'PARTIAL' | 'AUTH_GATED';
/**
 * Why a method has no interval. Present only when `intervals` is empty, and absent there too when the
 * cause is unknown. `NOT_SERVED`: every provider was ruled out for reasons that depend on neither the
 * buyer nor provider health: it does not offer the corridor, currency, method or asset, or config has
 * not enabled it.
 */
export type RoutingUnavailableReason = 'USER_LIMIT' | 'KYC_REJECTED' | 'PROVIDER_OUTAGE' | 'NOT_SERVED';
/** The providers the backend can route and take an order through. */
export type RoutingProvider = Extract<FiatProvider, 'TRANSAK' | 'BANXA' | 'MOONPAY' | 'MOONPAY_GUEST' | 'STRIPE' | 'COINBASE'>;
export interface RoutingTableProvider {
    provider: RoutingProvider;
    next: RoutingNextStep;
    visibility: RoutingVisibility;
    /**
     * The most this buyer can spend at this provider now, without another auth or KYC step, in the
     * table's currency. `null` when unknown. The interval edges are the most after every step on offer.
     */
    currentLimit: string | null;
}
/**
 * A `QuoteLimitRange` with two decimals (`"20.00"`) and the providers that serve it. The next
 * interval starts one cent above `max`. Adjacent intervals always rank differently.
 */
export interface RoutingTableInterval extends QuoteLimitRange {
    /** Best first; never empty. Quote the first, and the next one after a decline. */
    providers: RoutingTableProvider[];
}
/**
 * One requested payment method. An amount in no interval has no provider: show the nearest edges
 * ("Minimum $X", "Maximum $Y", or both around a gap), never a blocked state while `intervals` is not
 * empty. With no interval at all, show `unavailableReason` instead of the amount picker.
 */
export interface RoutingTableMethod {
    method: PaymentMethodCategory;
    unavailableReason?: RoutingUnavailableReason;
    /** Sorted and non-overlapping. */
    intervals: RoutingTableInterval[];
}
export interface FiatRoutingTableResponse {
    /** ISO-8601. The earliest of 60 s after the build and the expiry of any limit, coverage or provider session behind it. */
    expiresAt: string;
    /** In request order, duplicates removed. */
    methods: RoutingTableMethod[];
    /**
     * Whether this buyer's next order in the table's corridor has its fee reimbursed: show the fee as FREE
     * when `subsidized`, before and after an amount is entered. A priced `Quote.feeSubsidy` is the exact
     * amount and wins. Absent when the backend could not decide: treat it as not subsidized. A prediction:
     * settlement decides again.
     */
    feeSubsidy?: {
        subsidized: boolean;
    };
}
/** The purchase terms and optional host restriction, independent of the current ordered candidates. */
export interface FiatRoutingQuoteTerms {
    fiatCurrency: FiatCurrencyCode;
    /** A positive decimal string with no leading zero, exponent or sign (`"20"`, `"20.5"`). */
    fiatAmount: string;
    cryptoCurrencyCode: string;
    chainId: string;
    paymentMethodId: PaymentMethodCategory;
    /**
     * The Fun geo endpoint's response, forwarded as is. An empty `region` or `ip` counts as absent, a
     * US buyer's `region` must be a `UsStateCode`, and `city` is ignored.
     */
    geo: {
        alpha2: CountryCode;
        region?: string;
        ip?: string;
        city?: string;
    };
    prepareSessionAuth?: boolean;
    /** Host allowlist, retained for later KYC rerouting. Omitted allows every eligible provider. */
    routingOverrides?: {
        providers: RoutingProvider[];
    };
    /**
     * The asset the user receives. Always sent; the backend adds a conversion only when it differs
     * from the partner's configured asset. Optional so an older client still parses.
     */
    destinationAsset?: DestinationAsset;
    /**
     * The wallet that receives the purchased crypto, on the delivery chain the backend derives from
     * the quote. A mode-2 (`FUN_OTP`) partner's client sends it on every quote request; the backend
     * treats it as the recipient. A mode-1 client omits it; if sent, it must equal the asserted
     * recipient. Carries no chain id. It may arrive before sign-in and only shapes the quote
     * (conversion routes, fee subsidy); placing an order still requires a Fun session.
     */
    depositAddress?: string;
}
/**
 * `POST /fiat/routing/quote`: the terms plus which providers to price, in one of two forms.
 *
 * - `providers`: the interval's providers, best first. The backend prices the first, and falls
 *   through to the next on a refusal that is that provider's alone (a `FiatNoRouteError` of any
 *   `reason`, or either amount error), as the client did before. It answers the first provider that
 *   prices, or the last provider's refusal. Any other refusal stops at once.
 * - `provider`: one provider only, with no fall-through. Kept for clients that fall through themselves.
 *
 * The response is the same `FiatStepResponse` as `POST /fiat/quote`, and its `provider` names the
 * one that priced. A refusal is a `FiatRoutingQuoteErrorBody`.
 */
export type FiatRoutingQuoteRequest = FiatRoutingQuoteTerms & ({
    providers: RoutingProvider[];
    provider?: never;
} | {
    provider: RoutingProvider;
    providers?: never;
});
/** One serviceable range of the named provider. `userMax` is this buyer's own ceiling inside it, `null` when unmeasured. */
export interface RoutingServiceableRange {
    min: FiatAmount;
    max: FiatAmount;
    userMax?: FiatAmount | null;
}
/**
 * Why the named provider cannot price the request. `NO_CANDIDATE`: it does not serve this corridor,
 * method or amount. `PROVIDER_DECLINED`: it priced and then declined this buyer. `PROVIDER_OUTAGE`:
 * it is down, so `retryable` is true. `KYC_REJECTED`: it refused this buyer's identity for good.
 * `USER_LIMIT`: this buyer's limits at it do not allow the amount.
 */
export type RoutingNoRouteReason = 'NO_CANDIDATE' | 'PROVIDER_DECLINED' | 'PROVIDER_OUTAGE' | 'KYC_REJECTED' | 'USER_LIMIT';
/** The shared fields of every `/fiat/*` error body. */
interface ErrorBodyFields {
    errorMsg: string;
    reqId?: string;
}
/** 404, or 400 for `USER_LIMIT`, which alone carries `code` and `recovery`. The same body `POST /fiat/quote` sends. */
export type RoutingNoRouteErrorBody = ErrorBodyFields & {
    errorCode: 'FiatNoRouteError';
    serviceableRanges: RoutingServiceableRange[];
    retryable: boolean;
} & ({
    reason: Exclude<RoutingNoRouteReason, 'USER_LIMIT'>;
} | {
    reason: 'USER_LIMIT';
    code: 'LIMITS_EXCEEDED';
    recovery: 'REQUOTE';
});
/** 400: the amount is outside the named provider's bounds. */
export type RoutingAmountErrorBody = ErrorBodyFields & {
    fiatCurrencyCode: FiatCurrencyCode;
} & ({
    errorCode: 'FiatAmountBelowMinimumError';
    minFiatAmount: string;
} | {
    errorCode: 'FiatAmountAboveMaximumError';
    maxFiatAmount: string;
});
/** 429: the per-login budget is spent. Retry after `retryAfterSeconds`. */
export type RoutingRateLimitedErrorBody = ErrorBodyFields & {
    errorCode: 'TooManyRequestsError';
    retryAfterSeconds?: number;
};
/** Any other fault: a bad request (400), a missing assertion (401) or a server error (5xx). `errorCode` is the error's name. */
export type RoutingFaultErrorBody = ErrorBodyFields & {
    errorCode: string;
};
/** Error bodies for the routing table endpoint (POST and deprecated GET). */
export type FiatRoutingTableErrorBody = RoutingRateLimitedErrorBody | RoutingFaultErrorBody;
/**
 * `POST /fiat/routing/quote` refusals. A `FiatNoRouteError` (any `reason`) or either amount error is
 * the named provider's alone, so the next provider may still price: with `providers` the backend
 * tries it, with `provider` the client does. Anything else stops the fall-through: a validation or
 * auth refusal, a 5xx, or no provider left to try.
 */
export type FiatRoutingQuoteErrorBody = RoutingNoRouteErrorBody | RoutingAmountErrorBody | RoutingFaultErrorBody;
export {};
