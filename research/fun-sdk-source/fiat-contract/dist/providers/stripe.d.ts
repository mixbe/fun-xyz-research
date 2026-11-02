/**
 * The Stripe flow on `POST /fiat/next`.
 *
 * A response names the next action in `next`; the client's request names it in `action`. `observe` answers the
 * current next action. `wait` and `verifyIdentity` have no request: send `observe` after them. `orderPending` is
 * answered by `order`. Identity, the verified email and the deposit wallet come from the verified partner assertion,
 * never from a request body.
 *
 * A retry sends the same request and gets the current response. A fault is a 4xx/5xx whose body is
 * `StripeErrorBody`; anything the buyer can act on is a 200.
 *
 * Zero runtime dependencies, so production React Native code can import it. The zod schemas are in
 * `./stripe.schemas`, exported from the package root only.
 */
import type { FiatTermsRequest, TermsDocument } from '../terms';
import type { FeeLine, FiatAmount, FiatGeo, FiatStepResponse, FormField, KycFieldId } from '../types';
export declare const STRIPE_ENDPOINTS: {
    readonly next: "POST /fiat/next";
};
/**
 * The checkout terms, sent on every request. No routing quote: the backend mints the order id on `placeOrder`. After
 * `placeOrder`, `checkout` and `order` read the order as it was placed and ignore this copy, and a `placeOrder`
 * retried under the same `orderId` places nothing new.
 */
export interface StripeCheckout {
    /** Stripe serves USD only. */
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
export type StripeRequestContext = {
    checkout: StripeCheckout;
};
/**
 * The last id a `placeOrder` answer minted, on every step request once the client holds one: a step-up after
 * `placeOrder`, and a reopened app, reach that order instead of minting another.
 */
export type StripeHeldOrder = {
    orderId?: string;
};
/** No next action of its own: the answer is the current next action. Writes nothing. */
export type StripeObserveRequest = {
    action: 'observe';
} & StripeHeldOrder;
/** Fun's KYC consent, before the first `kyc` round, if the buyer has not accepted it. */
export type StripeConsentNextAction = {
    next: 'consent';
    documents: TermsDocument[];
};
/** The `POST /fiat/terms` items, recorded under the same rules. */
export type StripeConsentRequest = {
    action: 'consent';
    acceptances: FiatTermsRequest['acceptances'];
} & StripeHeldOrder;
/** Send `session`. The backend asks Stripe for a Link sign-in for the assertion's verified email. */
export type StripeSessionNextAction = {
    next: 'session';
};
export type StripeSessionRequest = {
    action: 'session';
} & StripeHeldOrder;
/** Run the SDK's `authorize(linkAuthIntentId)` before `expiresAt` (ISO-8601), then send `authorize` with its outcome. */
export type StripeAuthorizeNextAction = {
    next: 'authorize';
    linkAuthIntentId: string;
    expiresAt: string;
};
/** The SDK's outcome. `Consented` carries the customer the SDK names; the other outcomes carry none. */
export type StripeAuthorizeRequest = ({
    action: 'authorize';
    linkAuthIntentId: string;
    outcome: 'Consented';
    customerId: string;
} | {
    action: 'authorize';
    linkAuthIntentId: string;
    outcome: 'Denied' | 'Cancelled';
}) & StripeHeldOrder;
/** Signs the device in to Link without a code. Give `clientSecret` to the SDK before `expiresAt` (ISO-8601). */
export type StripeLinkAuthToken = {
    clientSecret: string;
    expiresAt: string;
};
/** A reason on one field of a `kyc` next action. `fieldId` names a field in that next action. */
export interface StripeFieldError {
    fieldId: string;
    message: string;
}
/** Why a re-ask asks again. Treat an unknown code like `null`: adding a code is a minor contract change. */
export type StripeReaskReason = 'REJECTED';
/** Fields of the `kyc` form the buyer gave before that Stripe asks for again. `requirements` is never empty. */
export type StripeReask = {
    requirements: KycFieldId[];
    reason: StripeReaskReason | null;
};
/**
 * Show the shared form, prefilled with `heldValues`. `ACCOUNT`: call `registerLinkUser` with the values and
 * `verifiedEmail`. `IDENTITY`: sign in with `linkAuthToken`, then call `attachKycInfo` with the values. Then send `kyc`
 * with `correctionRound`, which names this form: how many `l1` forms Stripe was handed before it. `linkAuthToken` is
 * `null` when the backend could not mint one: the device pushes under the Link session `authorize` left it.
 */
export type StripeKycNextAction = {
    next: 'kyc';
    round: 'ACCOUNT' | 'IDENTITY';
    tier: 'l0' | 'l1';
    correctionRound: number;
    fields: FormField[];
    heldValues: Partial<Record<KycFieldId, string>>;
    verifiedEmail: string | null;
    linkAuthToken: StripeLinkAuthToken | null;
    fieldErrors?: StripeFieldError[];
    reask: StripeReask | null;
};
/**
 * `values` is keyed by the ids of the next action's fields: the values the device gave Stripe. `correctionRound` is the
 * next action's, unchanged. A form that is no longer current writes nothing and answers the current next action, so a
 * resent form counts once.
 */
export type StripeKycRequest = {
    action: 'kyc';
    correctionRound: number;
    values: Partial<Record<KycFieldId, string>>;
} & StripeHeldOrder;
/** Sign in with `linkAuthToken`, run the SDK's `verifyIdentity`, then send `observe`. */
export type StripeVerifyIdentityNextAction = {
    next: 'verifyIdentity';
    linkAuthToken: StripeLinkAuthToken | null;
};
/** Stripe is reviewing, or a sign-in is settling. No request of its own: send `observe` after the delay. */
export type StripeWaitNextAction = {
    next: 'wait';
    retryAfterMs: number;
};
/** The order's price: the checkout's amount, with Stripe's own fees and delivered amount for it. */
export interface StripePrice {
    total: FiatAmount;
    fees: FeeLine[];
    cryptoAmount: string;
}
/** What the Apple Pay sheet shows and where Stripe delivers. `amount` is the charge, the checkout's own string. */
export interface StripePaySheet {
    destinationCurrency: string;
    destinationNetwork: string;
    walletAddress: string;
    merchantCountryCode: 'US';
    currencyCode: 'USD';
    amount: string;
    label: string;
}
/**
 * Show `price` and the Apple Pay button. The tap signs in with `linkAuthToken`, runs `registerWalletAddress`,
 * `collectPaymentMethod` and `createCryptoPaymentToken` with `paySheet`, then sends `placeOrder`. `orderId` is minted for
 * this answer: send it back on `placeOrder`, and on every `checkout` and `order` after it.
 */
export type StripePlaceOrderNextAction = {
    next: 'placeOrder';
    orderId: string;
    price: StripePrice;
    paySheet: StripePaySheet;
    linkAuthToken: StripeLinkAuthToken | null;
};
/**
 * Creates the Stripe session under `orderId` with the payment token and answers `pay`. A retry with the same `orderId`
 * places nothing new. `cryptoPaymentToken` is named so request logs redact it.
 */
export type StripePlaceOrderRequest = {
    action: 'placeOrder';
    orderId: string;
    cryptoPaymentToken: string;
};
/**
 * Sign in with `linkAuthToken`, then run the SDK's `performCheckout(sessionId)`. Inside its callback send `checkout`;
 * after it resolves, send `order`.
 */
export type StripePayNextAction = {
    next: 'pay';
    orderId: string;
    sessionId: string;
    linkAuthToken: StripeLinkAuthToken | null;
};
/**
 * Sent from inside `performCheckout`'s callback, which supplies no id. Create a fresh `callbackId` per invocation and
 * reuse it only for transport retries of that invocation.
 */
export type StripeCheckoutRequest = {
    action: 'checkout';
    orderId: string;
    callbackId: string;
};
/** Return `clientSecret` to the SDK's callback. It is a credential: never stored, never logged. */
export type StripeCheckoutSecretNextAction = {
    next: 'checkoutSecret';
    clientSecret: string;
};
/** Reads Stripe and moves the order `orderId` forward. */
export type StripeOrderRequest = {
    action: 'order';
    orderId: string;
};
/**
 * The order exists and is not terminal. `order` is its current body, or `null` before the order is recorded.
 * Do not open a payment sheet. After `retryAfterMs`, send `order`.
 */
export type StripeOrderPendingNextAction = {
    next: 'orderPending';
    orderId: string;
    retryAfterMs: number;
    order: FiatStepResponse | null;
};
export type StripeRequest = StripeRequestContext & (StripeObserveRequest | StripeConsentRequest | StripeSessionRequest | StripeAuthorizeRequest | StripeKycRequest | StripePlaceOrderRequest | StripeCheckoutRequest | StripeOrderRequest);
/** Every `action` a Stripe request names. `wait` and `verifyIdentity` are next actions the client answers with `observe`. */
export type StripeAction = StripeRequest['action'];
/** The wire body. The orchestrator reads `provider` and `geo`; Stripe's action schemas read the rest. */
export type StripeNextRequest = {
    provider: 'STRIPE';
    geo: FiatGeo;
} & StripeRequest;
/** Every next action but `checkoutSecret`, which only `checkout` answers. */
export type StripeNextAction = StripeConsentNextAction | StripeSessionNextAction | StripeAuthorizeNextAction | StripeKycNextAction | StripeVerifyIdentityNextAction | StripeWaitNextAction | StripePlaceOrderNextAction | StripePayNextAction | StripeOrderPendingNextAction;
/** The order is terminal. `order` is its body, which the shared order screen renders. */
export type StripeDone = {
    next: 'done';
    order: FiatStepResponse;
};
/**
 * Read `recovery`, never derive it from the reason. `REQUOTE` goes back to routing; `NONE` ends the flow.
 * `LIMITS_EXCEEDED` carries the cap that refused as `maxAmount` when that cap is an amount.
 */
export type StripeStepRefusal = 'NOT_ELIGIBLE' | 'KYC_REJECTED' | 'FINAL_REJECTION' | 'TOTAL_MISMATCH';
export type StripeRefused = {
    next: 'refused';
    reason: StripeStepRefusal;
    recovery: 'REQUOTE' | 'NONE';
} | {
    next: 'refused';
    reason: 'LIMITS_EXCEEDED';
    recovery: 'REQUOTE';
    maxAmount: FiatAmount | null;
};
/** Every action but `checkout` and `order`. An open order answers `orderPending` and a terminal one `done`. */
export type StripeStepResponse = StripeNextAction | StripeDone | StripeRefused;
/** The secret, or the current step when none can be given: return `null` to the SDK's callback and act on the step. */
export type StripeCheckoutResponse = StripeCheckoutSecretNextAction | StripeStepResponse;
/** `order` never refuses: it runs after the buyer may have paid. */
export type StripeOrderResponse = StripeDone | StripeOrderPendingNextAction;
/** Every answer Stripe's `/fiat/next` gives. */
export type StripeResponse = StripeCheckoutResponse | StripeOrderResponse;
export type StripeResponseFor = {
    observe: StripeStepResponse;
    consent: StripeStepResponse;
    session: StripeStepResponse;
    authorize: StripeStepResponse;
    kyc: StripeStepResponse;
    placeOrder: StripeStepResponse;
    checkout: StripeCheckoutResponse;
    order: StripeOrderResponse;
};
/** `RETRY` sends the same request again. `REQUOTE` goes back to routing. `NONE` ends the flow. */
export type StripeRecovery = 'RETRY' | 'REQUOTE' | 'NONE';
/**
 * `SESSION_BUDGET_SPENT`: the per-login sign-in budget `session` spends (429). `RATE_LIMITED`: the action's request
 * budget (429). `PROVIDER_UNAVAILABLE`: Stripe is down (503). `KYC_PROVIDER_UNAVAILABLE`: the KYC provider is down
 * (503). `SERVICE_UNAVAILABLE`: one of Fun's own stores is down (503). `INVALID_REQUEST`: a bad body (400).
 */
export type StripeFaultReason = 'SESSION_BUDGET_SPENT' | 'RATE_LIMITED' | 'PROVIDER_UNAVAILABLE' | 'KYC_PROVIDER_UNAVAILABLE' | 'SERVICE_UNAVAILABLE' | 'INVALID_REQUEST';
/** The fields a Stripe fault adds to the shared error body. */
export interface StripeFault {
    reason: StripeFaultReason;
    recovery: StripeRecovery;
}
/** The route's 4xx/5xx body: the shared error body plus `StripeFault`. A 429 adds `retryAfterSeconds`. */
export type StripeErrorBody = StripeFault & {
    errorCode: string;
    errorMsg: string;
    reqId?: string;
    retryAfterSeconds?: number;
};
