/**
 * The MoonPay flow on `POST /fiat/next`.
 *
 * Each action has one name and two types. A response names the next action in `next` and carries what
 * the client needs to do it. The client's request names it in `action` and carries the result. Every
 * response is the next action, `done`, or `refused` (`MoonPayResponseFor`). `observe` carries no
 * result and answers the current next action. `wait` has no request: the client sends `observe` after it.
 * `orderPending` answers only `order` and has no request either: the client follows its order body's `delivery`
 * transition when it offers one, and otherwise sends the same `order` after it.
 *
 * Guest checkout uses provider `MOONPAY_GUEST` and its separate contract in `./moonpay-guest`.
 * The phone and pay primitives below are shared MoonPay wire types, outside this provider's request and response unions.
 *
 * The body is `MoonPayNextRequest`: `provider`, the shared `geo`, a mode-2 client's `depositAddress`,
 * the context (`checkout`, and `credentials` after `connect`), and the action's result. Identity comes
 * from the verified partner assertion or the Fun session; the deposit wallet from the assertion or,
 * for a mode-2 partner, from `depositAddress` (see `FiatNextRequest`).
 *
 * A retry sends the same request. Each write is idempotent on data the request carries, and every
 * call, a retry too, returns the current response.
 *
 * A fault is a 4xx/5xx whose body is `MoonPayErrorBody`. Anything the user can act on is a 200.
 *
 * Zero runtime dependencies, so production React Native code can import it. The zod schemas are in
 * `./moonpay.schemas`, exported from the package root.
 */
import type { FiatCurrencyCode } from '../codes';
import type { FiatTermsRequest, TermsDocument } from '../terms';
import type { FiatAmount, DestinationAsset, FiatGeo, FiatStepResponse, FormField, KYCProvider, KycFieldId, KycSdkResultReport } from '../types';
export declare const MOONPAY_ENDPOINTS: {
    readonly next: "POST /fiat/next";
};
export type MoonPayAction = 'observe' | 'consent' | 'session' | 'connect' | 'phone' | 'phoneCode' | 'pay' | 'decline' | 'kyc' | 'prepareCapture' | 'capture' | 'wait' | 'order';
/** The checkout terms. The client holds them and sends them on every request. */
export interface MoonPayCheckout {
    amount: FiatAmount;
    /** The quote's `crypto.currency` and `crypto.network`, unchanged. */
    destination: {
        asset: string;
        network: string;
    };
    paymentMethod: 'apple_pay';
}
/** From the SDK's `active` connection. `accessToken` is a credential: the backend never logs it. */
export interface MoonPaySdkCredentials {
    customerId: string;
    accessToken: string;
}
/**
 * On every request, not part of the result. `credentials` is present after `connect`.
 * `destinationAsset` is the asset the user receives at the end; `checkout.destination` stays the quote's
 * asset, which MoonPay delivers.
 */
export type MoonPayRequestContext = {
    checkout: MoonPayCheckout;
    credentials?: MoonPaySdkCredentials;
    destinationAsset?: DestinationAsset;
};
/**
 * The parameters for the device `client.getQuote`, not a quote. The backend builds them because the
 * wallet must be the verified one and MoonPay's currency codes differ by environment.
 */
export interface MoonPayQuoteInput {
    source: {
        asset: {
            code: FiatCurrencyCode;
        };
        amount: string;
    };
    destination: {
        asset: {
            code: string;
        };
    };
    wallet: {
        address: string;
    };
    paymentMethod: {
        type: 'apple_pay';
    };
    feeBehavior: 'inclusive';
}
/** No next action of its own: the answer is the current next action. Writes nothing. */
export type MoonPayObserveRequest = {
    action: 'observe';
};
/** MoonPay's terms first. Later, before `kyc`, Fun's KYC consent if the buyer has not accepted it. */
export type MoonPayConsentNextAction = {
    next: 'consent';
    documents: TermsDocument[];
};
/** The `POST /fiat/terms` items, recorded under the same rules. */
export type MoonPayConsentRequest = {
    action: 'consent';
    acceptances: FiatTermsRequest['acceptances'];
};
/**
 * Send `session` so the backend mints a MoonPay SDK session token. Each request mints a new token and
 * spends one from the per-login session budget; once it is spent the fault is `SESSION_BUDGET_SPENT`.
 */
export type MoonPaySessionNextAction = {
    next: 'session';
};
/** Answered with `connect` carrying the new `sessionToken`. */
export type MoonPaySessionRequest = {
    action: 'session';
};
/**
 * Run MoonPay's connection check with `sessionToken`, the token `session` minted; it asks for an OTP
 * only if the hidden check fails. `resetConnection`: the device's connection is another buyer's, so
 * reset it first.
 */
export type MoonPayConnectNextAction = {
    next: 'connect';
    sessionToken: string;
    quoteInput: MoonPayQuoteInput;
    resetConnection?: true;
};
export type MoonPayConnectRequest = {
    action: 'connect';
    customerId: string;
    accessToken: string;
};
/**
 * The guest path asks for the buyer's phone before `session`. `CODE_EXPIRED`: the last code's time ran out, or five
 * wrong codes ended it. The same shape as Coinbase's `session` next action.
 */
export type MoonPayPhoneNextAction = {
    next: 'phone';
    error: 'CODE_EXPIRED' | null;
};
/**
 * Text a code to `phoneNumber` (E.164), or send a new code to the phone of the live challenge `resend` names. Spends
 * one unit of the per-login code budget only when a code is sent. The same shapes as Coinbase's `session` request.
 */
export type MoonPayPhoneRequest = {
    action: 'phone';
    phoneNumber: string;
} | {
    action: 'phone';
    resend: string;
};
/**
 * Ask for the code just texted. `expiresAt` is ISO-8601. `CODE_INVALID`: the last code sent was wrong. The same
 * shape as Coinbase's `otp` next action.
 */
export type MoonPayPhoneCodeNextAction = {
    next: 'phoneCode';
    verificationRef: string;
    expiresAt: string;
    error: 'CODE_INVALID' | null;
};
/** `otpCode` is six digits. Named so request logs redact it. A correct code answers `session`. */
export type MoonPayPhoneCodeRequest = {
    action: 'phoneCode';
    verificationRef: string;
    otpCode: string;
};
/**
 * The guest path's answer to `session`. Run the hidden connection check with `sessionToken`. When it returns
 * `connectionRequired` with `capabilities.guestCheckout` and no `mismatch`, get the device quote from
 * `quoteInput`. When that quote is executable with no `challenge`, mount Apple Pay with
 * `externalTransactionId = orderId`, then send `order`. Otherwise send `decline`. Every `pay` answer carries a new
 * `orderId`, so after a retried `session` the device must use the `orderId` of the latest `pay`.
 */
export type MoonPayPayNextAction = {
    next: 'pay';
    sessionToken: string;
    orderId: string;
    quoteInput: MoonPayQuoteInput;
};
/**
 * Why the device cannot pay as a guest. `NOT_OFFERED`: the check did not offer guest checkout. `MISMATCH`: the
 * check named a `mismatch`. `OVER_LIMIT`: the device quote was not executable or carried a `challenge`.
 */
export type MoonPayGuestDeclineReason = 'NOT_OFFERED' | 'MISMATCH' | 'OVER_LIMIT';
/** Request-only, after `pay`, before any charge. Answered `refused NOT_ELIGIBLE / REQUOTE`. */
export type MoonPayDeclineRequest = {
    action: 'decline';
    reason: MoonPayGuestDeclineReason;
};
/** Another MoonPay customer already holds the value; only a different one goes through. */
export type MoonPayFieldErrorCode = 'PHONE_IN_USE' | 'TAX_ID_IN_USE';
/**
 * A reason on one field of a `kyc` next action. `fieldId` names a field in that next action. `code` is set
 * only for a refusal the client words itself: `PHONE_IN_USE` on `PHONE_NUMBER`, `TAX_ID_IN_USE` on `TAX_IDENTIFIER`.
 */
export interface MoonPayFieldError {
    fieldId: string;
    message: string;
    code?: MoonPayFieldErrorCode;
}
/**
 * Show the shared form. Empty `fields` means nothing for the buyer to type: the client sends
 * `{ action: 'kyc', values: {} }` at once and the backend shares the KYC data it already holds.
 * `reask` names fields of this form the buyer gave before and MoonPay asks for again; `null` otherwise.
 */
export type MoonPayKycNextAction = {
    next: 'kyc';
    fields: FormField[];
    fieldErrors?: MoonPayFieldError[];
    reask: MoonPayReask | null;
};
/**
 * Keyed by the ids of the next action's fields; there is no form id. `values` is empty when the next
 * action's `fields` is. Needs `credentials`: the backend reads the customer.
 */
export type MoonPayKycRequest = {
    action: 'kyc';
    credentials: MoonPaySdkCredentials;
    values: Partial<Record<KycFieldId, string>>;
};
/**
 * Sumsub must change the applicant before capture: move it to the capture level, or reset an expired
 * proof of address. Send `prepareCapture` at once; the buyer types nothing.
 */
export type MoonPayPrepareCaptureNextAction = {
    next: 'prepareCapture';
};
/** Makes that change and answers `capture`. Needs `credentials`: the backend reads the customer. */
export type MoonPayPrepareCaptureRequest = {
    action: 'prepareCapture';
    credentials: MoonPaySdkCredentials;
};
/** A document the Sumsub SDK captures for MoonPay. No shared type names documents, so this one does. */
export type MoonPayCaptureDocument = 'IDENTITY_DOCUMENT' | 'SELFIE' | 'PROOF_OF_ADDRESS' | 'PROOF_OF_INCOME';
/** What a re-ask names: a declarative value by its `KycFieldId`, or a captured document. */
export type MoonPayReaskRequirement = KycFieldId | MoonPayCaptureDocument;
/**
 * Why a re-ask asks again, as a code: the backend sends no display text, and the client owns every word.
 * `EXPIRED`: the document on file is too old. `POOR_QUALITY`: the upload could not be read. `MISMATCH`: the
 * data or the selfie does not match. `REJECTED`: any other retryable rejection. Treat an unknown code like
 * `null`: adding a code is a minor contract change.
 */
export type MoonPayReaskReason = 'EXPIRED' | 'POOR_QUALITY' | 'MISMATCH' | 'REJECTED';
/**
 * Something the buyer gave before is asked again: `requirements`, never empty, on the `kyc` form or in the
 * `capture`. One shape for every cause, so the client shows each the same way and may ignore `reason`
 * (`null` when there is no code). Not `fieldErrors`: those check the value this request just submitted.
 */
export type MoonPayReask = {
    requirements: MoonPayReaskRequirement[];
    reason: MoonPayReaskReason | null;
};
/**
 * Open the Sumsub SDK with `accessToken` to capture what MoonPay still needs (an ID, a selfie, a
 * proof of address). `reask` is `null` on a first capture; on a retake it names documents only. To refresh
 * an expired token, send `observe`.
 */
export type MoonPayCaptureNextAction = {
    next: 'capture';
    kycProvider: KYCProvider;
    accessToken: string;
    /** ISO-8601. */
    expiresAt: string;
    reask: MoonPayReask | null;
};
/** When the SDK closes. A report only: the backend reads Sumsub itself. */
export type MoonPayCaptureRequest = {
    action: 'capture';
    credentials: MoonPaySdkCredentials;
    result: KycSdkResultReport;
};
/** MoonPay or Sumsub is reviewing. No request of its own: send `observe` after the delay. */
export type MoonPayWaitNextAction = {
    next: 'wait';
    retryAfterMs: number;
};
/** Get the device quote from `quoteInput`, mount Apple Pay with `externalTransactionId = orderId`. */
export type MoonPayOrderNextAction = {
    next: 'order';
    orderId: string;
    quoteInput: MoonPayQuoteInput;
};
/**
 * After every charge attempt, a failed one too. `quotedAmount` is the fiat amount the device quote
 * showed. `transactionId` is from the Apple Pay event when it has one; without it the backend
 * records the failed charges MoonPay lists for `orderId`.
 */
export type MoonPayOrderRequest = {
    action: 'order';
    orderId: string;
    quotedAmount: FiatAmount;
    transactionId?: string;
};
/**
 * The charge is made or in flight and its order is not terminal yet. `order` is the order's current body
 * (status, and the settlement transaction once observed) for the client to show, or `null` while MoonPay
 * does not list or price the charge and no order exists yet. Do not mount Apple Pay. When `order` offers the
 * `delivery` transition, follow it to `GET /fiat/delivery/:deliveryId` and stop sending `order`. Otherwise,
 * after `retryAfterMs`, send the same `order` request again: each one reads MoonPay and moves the order forward.
 */
export type MoonPayOrderPendingNextAction = {
    next: 'orderPending';
    orderId: string;
    retryAfterMs: number;
    order: FiatStepResponse | null;
};
export type MoonPayRequest = MoonPayRequestContext & (MoonPayObserveRequest | MoonPayConsentRequest | MoonPaySessionRequest | MoonPayConnectRequest | MoonPayKycRequest | MoonPayPrepareCaptureRequest | MoonPayCaptureRequest | MoonPayOrderRequest);
/**
 * The wire body. The orchestrator reads `provider`, `geo` and `depositAddress` (as on every
 * `FiatNextRequest`); MoonPay's action schemas read the rest.
 */
export type MoonPayNextRequest = {
    provider: 'MOONPAY';
    geo: FiatGeo;
    depositAddress?: string;
} & MoonPayRequest;
/**
 * Read `recovery`, never derive it from the reason. `NOT_ELIGIBLE` and `DOCUMENTS_REQUIRED` carry
 * `REQUOTE` when another provider can serve the buyer, and `NONE` when a requote would only route
 * back here (no verified email, or documents this flow cannot capture). The others are always `NONE`.
 */
export type MoonPayStepRefusal = 'NOT_ELIGIBLE' | 'DOCUMENTS_REQUIRED' | 'FINAL_REJECTION' | 'CUSTOMER_MISMATCH';
/**
 * After a charge, always with `recovery: NONE`. `CUSTOMER_MISMATCH`: the transaction's customer is
 * not bound to this buyer. `WALLET_MISMATCH`: the transaction pays another wallet than the
 * assertion's. `UNRECORDABLE`: a charge no retry can record, held for refund review.
 */
export type MoonPayOrderRefusal = 'CUSTOMER_MISMATCH' | 'WALLET_MISMATCH' | 'UNRECORDABLE';
export type MoonPayNextAction = MoonPayConsentNextAction | MoonPaySessionNextAction | MoonPayConnectNextAction | MoonPayKycNextAction | MoonPayPrepareCaptureNextAction | MoonPayCaptureNextAction | MoonPayWaitNextAction | MoonPayOrderNextAction;
/**
 * The order is terminal. `order` is its body, which the shared order screen renders. Nothing is left to
 * send to `/fiat/next`. A converted order's `SETTLED` body offers the `delivery` transition: follow it.
 */
export type MoonPayDone = {
    next: 'done';
    order: FiatStepResponse;
};
/** Exit the provider flow. `REQUOTE` goes back to routing; `NONE` ends the flow. */
export type MoonPayRefused<R, V> = {
    next: 'refused';
    reason: R;
    recovery: V;
};
/** The answer to `observe`, `consent`, `session`, `connect`, `phone`, `phoneCode`, `decline`, `kyc`, `prepareCapture` and `capture`. */
export type MoonPayStepResponse = MoonPayNextAction | MoonPayRefused<MoonPayStepRefusal, 'REQUOTE' | 'NONE'>;
/**
 * The answer to `order`. `done` once the order is terminal. A failed charge is recorded too: `done` with
 * the order in `FAILED`, and the client requotes for a new `orderId`. `orderPending` while the order is
 * not terminal, or MoonPay does not list or price the transaction yet. When its `order` body offers the
 * `delivery` transition (the request carried a `destinationAsset`), the client follows it to
 * `GET /fiat/delivery/:deliveryId` and stops sending `order`; otherwise it polls by sending the same
 * `order` request, never `GET /fiat/orders/:orderId`. A refusal after a charge never requotes: that would
 * start a second payment.
 */
export type MoonPayOrderResponse = MoonPayDone | MoonPayOrderNextAction | MoonPayOrderPendingNextAction | MoonPayRefused<MoonPayOrderRefusal, 'NONE'>;
export type MoonPayResponseFor = {
    observe: MoonPayStepResponse;
    consent: MoonPayStepResponse;
    session: MoonPayStepResponse;
    connect: MoonPayStepResponse;
    kyc: MoonPayStepResponse;
    prepareCapture: MoonPayStepResponse;
    capture: MoonPayStepResponse;
    order: MoonPayOrderResponse;
};
/** `RETRY` sends the same request again. `REQUOTE` goes back to routing. `NONE` ends the flow. */
export type MoonPayRecovery = 'RETRY' | 'REQUOTE' | 'NONE';
/**
 * `SESSION_BUDGET_SPENT`: the per-login SDK session mint budget that `session` spends, or the per-login code budget
 * that `phone` spends (429).
 * `RATE_LIMITED`: the action's request budget (429). `PROVIDER_UNAVAILABLE`: MoonPay, or the phone code sender, is down (503).
 * `KYC_PROVIDER_UNAVAILABLE`: the KYC provider (Sumsub) is down (503). `SERVICE_UNAVAILABLE`: one of
 * Fun's own stores is down (503). `INVALID_REQUEST`: a bad body (400).
 */
export type MoonPayFaultReason = 'SESSION_BUDGET_SPENT' | 'RATE_LIMITED' | 'PROVIDER_UNAVAILABLE' | 'KYC_PROVIDER_UNAVAILABLE' | 'SERVICE_UNAVAILABLE' | 'INVALID_REQUEST';
/** The fields a MoonPay fault adds to the shared error body. */
export interface MoonPayFault {
    reason: MoonPayFaultReason;
    recovery: MoonPayRecovery;
}
/** The route's 4xx/5xx body: the shared error body plus `MoonPayFault`. */
export type MoonPayErrorBody = MoonPayFault & {
    errorCode: string;
    errorMsg: string;
    reqId?: string;
};
