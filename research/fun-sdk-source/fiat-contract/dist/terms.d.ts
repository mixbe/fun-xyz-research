/**
 * The platform terms route: `POST /fiat/terms`, shared by every provider.
 *
 * A checkout shows the user documents to accept. `CHECKOUT` documents are the constants below;
 * `KYC` documents arrive in a provider flow's consent next action. The user's Continue tap is the
 * acceptance, and the client records it here before the next provider call. A repeat writes nothing.
 *
 * Zero runtime dependencies, so production React Native code can import it. The zod schemas are
 * exported from the package root.
 */
import type { FiatProvider } from './types';
export declare const FIAT_TERMS_ENDPOINT: "POST /fiat/terms";
export type TermsDocumentKind = 'PROVIDER_TERMS' | 'FUN_KYC_COLLECTION' | 'PROVIDER_KYC_SHARING';
/** `CHECKOUT` documents gate the provider session; `KYC` documents gate the first KYC write. */
export type TermsStage = 'CHECKOUT' | 'KYC';
export interface TermsDocument {
    id: string;
    kind: TermsDocumentKind;
    stage: TermsStage;
    /** Opaque to the client; echoed in the acceptance. */
    version: string;
    /** Opaque to the client; echoed in the acceptance, so a dispute names the text the user saw. */
    contentDigest: string;
    /** What the screen links to. At least one, each an `https` URL. */
    links: {
        label: string;
        url: string;
    }[];
}
export interface TermsDocumentAcceptance {
    documentId: string;
    version: string;
    contentDigest: string;
    /** ISO-8601 with an offset, stamped by the client at the tap. The backend refuses one older than 5 minutes. */
    acceptedAt: string;
}
export interface FiatTermsRequest {
    provider: FiatProvider;
    /** One per document the screen showed, each document at most once. */
    acceptances: TermsDocumentAcceptance[];
}
/** The recorded document ids. The client then calls `POST /fiat/next`. */
export interface FiatTermsResponse {
    recorded: string[];
}
/**
 * `STALE_TERMS`: an unpublished version, a wrong digest, or an `acceptedAt` older than 5 minutes
 * (400). `INVALID_REQUEST`: a bad body (400).
 * `RATE_LIMITED`: the per-login terms budget is spent (429). `PROVIDER_UNAVAILABLE`: the KYC service
 * or a store is down (503); nothing is recorded, so retry.
 */
export type FiatTermsFaultReason = 'STALE_TERMS' | 'INVALID_REQUEST' | 'RATE_LIMITED' | 'PROVIDER_UNAVAILABLE';
/** `RETRY` sends the same request again. `REQUOTE` goes back to `POST /fiat/quote`. `NONE` ends the flow. */
export type FiatTermsRecovery = 'RETRY' | 'REQUOTE' | 'NONE';
/** The 4xx/5xx body of `POST /fiat/terms`: the shared error body plus `reason` and `recovery`. */
export interface FiatTermsErrorBody {
    errorCode: string;
    errorMsg: string;
    reqId?: string;
    reason: FiatTermsFaultReason;
    recovery: FiatTermsRecovery;
}
/** Each provider's current `CHECKOUT` documents, shown next to Continue on the amount screen. */
export declare const PROVIDER_CHECKOUT_DOCUMENTS: Readonly<Partial<Record<FiatProvider, readonly TermsDocument[]>>>;
/** Each provider's current `KYC` documents, which its consent next action shows before the first KYC write. */
export declare const PROVIDER_KYC_DOCUMENTS: Readonly<Partial<Record<FiatProvider, readonly TermsDocument[]>>>;
export type FunKycConsentLocale = 'en' | 'es' | 'fr' | 'ja' | 'ko' | 'ru' | 'tr' | 'zh';
/** Fun's KYC consent, one digest per locale the KYC intro screen shows. It counts under any provider. */
export declare const FUN_KYC_CONSENT_DOCUMENTS: Readonly<Record<FunKycConsentLocale, TermsDocument>>;
/**
 * Every version and locale ever published. Append a new version here and keep the old one: the
 * backend accepts any entry, so a client that ships an older version can still check out.
 */
export declare const PUBLISHED_TERMS_DOCUMENTS: readonly TermsDocument[];
