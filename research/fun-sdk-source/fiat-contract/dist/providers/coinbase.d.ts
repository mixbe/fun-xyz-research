/**
 * The Coinbase flow on `POST /fiat/next`.
 *
 * A response names the next action in `next`; the client's request names it in `action`. `observe` answers the
 * current next action. `wait` has no request: send `observe` after it. `pay` and `orderPending` are answered by `order`.
 * Identity comes from the verified partner assertion or the Fun session; the deposit wallet from the assertion or,
 * for a mode-2 partner, from the body's `depositAddress` (see `FiatNextRequest`).
 *
 * A retry sends the same request and gets the current response. A fault is a 4xx/5xx whose body is
 * `CoinbaseErrorBody`; anything the buyer can act on is a 200.
 *
 * Zero runtime dependencies, so production React Native code can import it. The zod schemas are in
 * `./coinbase.schemas`, exported from the package root only.
 */
import type { FiatTermsRequest, TermsDocument } from '../terms';
import type { DestinationAsset, FeeLine, FiatAmount, FiatGeo, FiatStepResponse, FormField, KycFieldId } from '../types';
export declare const COINBASE_ENDPOINTS: {
    readonly next: "POST /fiat/next";
};
/** The checkout terms, sent on every request. No routing quote: the backend mints the order id on `placeOrder`. */
export interface CoinbaseCheckout {
    /** Coinbase serves USD only. */
    amount: FiatAmount & {
        currency: 'USD';
    };
    /** The asset and its network, as the routing table or `/fiat/quote` named them. */
    destination: {
        asset: string;
        network: string;
    };
    paymentMethod: 'apple_pay';
}
/**
 * On every request. `destinationAsset` is the asset the user receives at the end, as on every `FiatNextRequest`;
 * `checkout.destination` stays the asset Coinbase delivers.
 */
export type CoinbaseRequestContext = {
    checkout: CoinbaseCheckout;
    destinationAsset?: DestinationAsset;
};
/** No next action of its own: the answer is the current next action. Writes nothing. */
export type CoinbaseObserveRequest = {
    action: 'observe';
};
/** Coinbase's terms first. Later, before the first `kyc`, Fun's KYC consent if the buyer has not accepted it. */
export type CoinbaseConsentNextAction = {
    next: 'consent';
    documents: TermsDocument[];
};
/** The `POST /fiat/terms` items, recorded under the same rules. */
export type CoinbaseConsentRequest = {
    action: 'consent';
    acceptances: FiatTermsRequest['acceptances'];
};
/** Ask for the buyer's phone. `CODE_EXPIRED`: the last code's ten minutes ran out, or five wrong codes ended it. */
export type CoinbaseSessionNextAction = {
    next: 'session';
    error: 'CODE_EXPIRED' | null;
};
/** Text a code to `phoneNumber` (E.164), or send a new code to the phone of the live challenge `resend` names. */
export type CoinbaseSessionRequest = {
    action: 'session';
    phoneNumber: string;
} | {
    action: 'session';
    resend: string;
};
/** Ask for the code Coinbase texted. `expiresAt` is ISO-8601. `CODE_INVALID`: the last code sent was wrong. */
export type CoinbaseOtpNextAction = {
    next: 'otp';
    verificationRef: string;
    expiresAt: string;
    error: 'CODE_INVALID' | null;
};
/** `otpCode` is six digits. Named so request logs redact it. */
export type CoinbaseOtpRequest = {
    action: 'otp';
    verificationRef: string;
    otpCode: string;
};
/** A reason on one field of a `kyc` next action. `fieldId` names a field in that next action. */
export interface CoinbaseFieldError {
    fieldId: string;
    message: string;
}
/** Why a re-ask asks again. Treat an unknown code like `null`: adding a code is a minor contract change. */
export type CoinbaseReaskReason = 'REJECTED';
/** Fields of the `kyc` form the buyer gave before that Coinbase asks for again. `requirements` is never empty. */
export type CoinbaseReask = {
    requirements: KycFieldId[];
    reason: CoinbaseReaskReason | null;
};
/** Show the shared form for Coinbase's limit upgrade. */
export type CoinbaseKycNextAction = {
    next: 'kyc';
    fields: FormField[];
    fieldErrors?: CoinbaseFieldError[];
    reask: CoinbaseReask | null;
};
/** Keyed by the ids of the next action's fields. */
export type CoinbaseKycRequest = {
    action: 'kyc';
    values: Partial<Record<KycFieldId, string>>;
};
/** Coinbase is reviewing, or cannot be read right now. No request of its own: send `observe` after the delay. */
export type CoinbaseWaitNextAction = {
    next: 'wait';
    retryAfterMs: number;
};
/** The order's price: Coinbase's own totals, never Fun's, and the fee subsidy Fun decided on them. */
export interface CoinbasePrice {
    total: FiatAmount;
    fees: FeeLine[];
    cryptoAmount: string;
    /**
     * The fee the partner reimburses after settlement, as on `Quote.feeSubsidy`. Absent when this deposit is not
     * subsidized. A prediction: settlement decides again.
     */
    feeSubsidy?: FiatAmount;
}
/**
 * Coinbase priced the checkout. `orderId` is minted for this answer: send it back on `placeOrder`, and on every
 * `order` after it. A retry with the same `orderId` places nothing new.
 */
export type CoinbasePlaceOrderNextAction = {
    next: 'placeOrder';
    price: CoinbasePrice;
    orderId: string;
};
/** Creates the Coinbase order under `orderId` and answers `pay`. */
export type CoinbasePlaceOrderRequest = {
    action: 'placeOrder';
    orderId: string;
};
/** Open `paymentLink`, then send `order`. The link is a credential: never stored, never logged, never sent twice. */
export type CoinbasePayNextAction = {
    next: 'pay';
    orderId: string;
    price: CoinbasePrice;
    paymentLink: {
        url: string;
    };
    environment: 'sandbox' | 'production';
};
/** Reads Coinbase and moves the order `orderId` forward. */
export type CoinbaseOrderRequest = {
    action: 'order';
    orderId: string;
};
/**
 * The order exists and is not terminal. `order` is its current body, or `null` before the order is recorded.
 * Do not open a payment link. After `retryAfterMs`, send `order`.
 */
export type CoinbaseOrderPendingNextAction = {
    next: 'orderPending';
    orderId: string;
    retryAfterMs: number;
    order: FiatStepResponse | null;
};
export type CoinbaseRequest = CoinbaseRequestContext & (CoinbaseObserveRequest | CoinbaseConsentRequest | CoinbaseSessionRequest | CoinbaseOtpRequest | CoinbaseKycRequest | CoinbasePlaceOrderRequest | CoinbaseOrderRequest);
/**
 * Every `action` a Coinbase request names, derived from the requests. Unlike `MoonPayAction` it leaves out `wait`:
 * `wait` is a next action the client answers by sending `observe` again, never a request action.
 */
export type CoinbaseAction = CoinbaseRequest['action'];
/**
 * The wire body. The orchestrator reads `provider`, `geo` and `depositAddress` (as on every
 * `FiatNextRequest`); Coinbase's action schemas read the rest.
 */
export type CoinbaseNextRequest = {
    provider: 'COINBASE';
    geo: FiatGeo;
    depositAddress?: string;
} & CoinbaseRequest;
export type CoinbaseNextAction = CoinbaseConsentNextAction | CoinbaseSessionNextAction | CoinbaseOtpNextAction | CoinbaseKycNextAction | CoinbaseWaitNextAction | CoinbasePlaceOrderNextAction | CoinbasePayNextAction | CoinbaseOrderPendingNextAction;
/** The order is terminal. `order` is its body, which the shared order screen renders. */
export type CoinbaseDone = {
    next: 'done';
    order: FiatStepResponse;
};
/**
 * Read `recovery`, never derive it from the reason. `REQUOTE` goes back to routing; `NONE` ends the flow.
 * `LIMITS_EXCEEDED` carries the cap that refused as `maxAmount` when that cap is an amount.
 */
export type CoinbaseStepRefusal = 'NOT_ELIGIBLE' | 'KYC_UPGRADE_REJECTED' | 'FINAL_REJECTION' | 'TOTAL_MISMATCH';
export type CoinbaseRefused = {
    next: 'refused';
    reason: CoinbaseStepRefusal;
    recovery: 'REQUOTE' | 'NONE';
} | {
    next: 'refused';
    reason: 'LIMITS_EXCEEDED';
    recovery: 'REQUOTE';
    maxAmount: FiatAmount | null;
};
/** Every action but `order`. An open order answers `orderPending` and a terminal one `done`, whichever action asked. */
export type CoinbaseStepResponse = CoinbaseNextAction | CoinbaseDone | CoinbaseRefused;
/** `order` never refuses: it runs after the buyer may have paid. */
export type CoinbaseOrderResponse = CoinbaseDone | CoinbaseOrderPendingNextAction;
export type CoinbaseResponseFor = {
    observe: CoinbaseStepResponse;
    consent: CoinbaseStepResponse;
    session: CoinbaseStepResponse;
    otp: CoinbaseStepResponse;
    kyc: CoinbaseStepResponse;
    placeOrder: CoinbaseStepResponse;
    order: CoinbaseOrderResponse;
};
/** `RETRY` sends the same request again. `REQUOTE` goes back to routing. `NONE` ends the flow. */
export type CoinbaseRecovery = 'RETRY' | 'REQUOTE' | 'NONE';
/**
 * `SESSION_BUDGET_SPENT`: the per-login code budget `session` spends (429). `RATE_LIMITED`: the action's request
 * budget (429). `PROVIDER_UNAVAILABLE`: Coinbase is down (503). `KYC_PROVIDER_UNAVAILABLE`: the KYC provider is down
 * (503). `SERVICE_UNAVAILABLE`: one of Fun's own stores is down (503). `INVALID_REQUEST`: a bad body (400).
 */
export type CoinbaseFaultReason = 'SESSION_BUDGET_SPENT' | 'RATE_LIMITED' | 'PROVIDER_UNAVAILABLE' | 'KYC_PROVIDER_UNAVAILABLE' | 'SERVICE_UNAVAILABLE' | 'INVALID_REQUEST';
/** The fields a Coinbase fault adds to the shared error body. */
export interface CoinbaseFault {
    reason: CoinbaseFaultReason;
    recovery: CoinbaseRecovery;
}
/** The route's 4xx/5xx body: the shared error body plus `CoinbaseFault`. A 429 adds `retryAfterSeconds`. */
export type CoinbaseErrorBody = CoinbaseFault & {
    errorCode: string;
    errorMsg: string;
    reqId?: string;
    retryAfterSeconds?: number;
};
/** Coinbase's user agreement, the version the legacy flow records under `COINBASE`. */
export declare const COINBASE_TERMS: TermsDocument;
