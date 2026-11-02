/**
 * fiat-contract — the transition table, as data. **This file IS the published contract.**
 *
 * Per state entry:
 *   (a) `allowedTransitions` — the legal transition set the state may carry
 *   (b) `mayReturn` — the legal states any call from it may return
 *       (source: FE doc §"Event bindings per flow state", column 4 "May receive back")
 *   (c) `terminal` — enumerated, never inferred. Empty transitions ≠ terminal: `KYC ON_HOLD`
 *       carries `transitions: []` and is NOT terminal.
 *
 * Rules the entries obey:
 *   - Terminality of `ORDER{CREATED}` rides `status`, because terminal outcomes are OrderStatus,
 *     never kinds (contract §The fiat step response). The set is enumerated below as
 *     `TERMINAL_ORDER_STATUSES` — clients read it, they never derive it.
 *   - `DELIVERY` is keyed by its `state`, like KYC by `reason`: its three states differ in
 *     terminality and in what they may carry.
 *   - A terminal *state* carries no transitions. A terminal *status* still can: `FAILED` with a
 *     retryable `failureReason` carries the recovery CTA (FE doc Screen 14).
 *   - The stale rule means any call may return any state. `mayReturn` is the conformance
 *     assertion on the *typical* server sequence — the client never uses it to gate rendering.
 */
import type { DeliveryState, FiatEndpoint, FlowState, OrderStatus, TransitionMode } from './types';
/**
 * The package version IS the capability handshake's table version (contract §Conformance
 * package → Versioning). Derived from `package.json#version` at build time so the two can
 * never drift — a version bump is one edit, in package.json. The test suite asserts the
 * wiring still resolves to the package version.
 */
export declare const TABLE_VERSION: string;
/**
 * State identity = kind + phase + the state's named discriminant (FE doc §Decisions).
 * The table keys on kind + phase (+ `reason` for KYC, whose three reasons differ in terminality
 * and in what they may carry; `DELIVERY` keys on its `state` for the same reason).
 */
export type StateKey = 'QUOTE' | 'FUN_AUTH' | 'SESSION_AUTH' | 'KYC/CAPTURE' | 'KYC/INPUT_REQUIRED' | 'KYC/NO_ACTION_REQUIRED:IN_REVIEW' | 'KYC/NO_ACTION_REQUIRED:ON_HOLD' | 'KYC/NO_ACTION_REQUIRED:REJECTED' | 'PENDING_ORDER' | 'BLOCKED' | 'PAYMENT/CAPTURE' | 'PAYMENT/INSTRUCT' | 'ORDER/AWAITING_CONFIRMATION' | 'ORDER/CREATED' | 'DELIVERY:PENDING' | 'DELIVERY:SUCCEEDED' | 'DELIVERY:FAILED';
/**
 * Terminal per the OrderStatus machine's monotonic ranks (contract §The fiat step response).
 *
 * `CAPTURE_ORPHANED` is deliberately absent — see the TODO(open-decision) on the value itself.
 * Non-terminal is the safe default for an unknown status: a client that wrongly believes the flow
 * is over stops polling and the order silently strands, whereas one that keeps polling lets the
 * reconciler resolve it. Revisit when the backend publishes its rank map.
 */
export declare const TERMINAL_ORDER_STATUSES: readonly ["SETTLED", "EXPIRED", "CANCELLED", "FAILED", "REFUNDED"];
export type TerminalOrderStatus = (typeof TERMINAL_ORDER_STATUSES)[number];
/** Every `FunAuthErrorCode`, as data. Each rides `FailureReason.code` with `category: 'USER_ERROR'`. */
export declare const FUN_AUTH_ERROR_CODES: readonly ["INVALID_EMAIL", "BAD_CODE", "CODE_EXPIRED", "TOO_MANY_ATTEMPTS", "OTP_DISPATCH_THROTTLED"];
/**
 * Endpoint template as written in the docs. Named `:` segments match one emitted path segment.
 */
export type EndpointTemplate = FiatEndpoint;
export interface AllowedTransition {
    /**
     * The id observed in the docs' step responses. Informational: ids are localization keys and the
     * docs explicitly allow unknown ids (the client falls back to `labelFallback`), so
     * `assertLegalEmission` matches on `mode` + `endpoint`, not on `id`.
     */
    id: string;
    mode: TransitionMode;
    endpoint: EndpointTemplate;
    /** When this entry is emitted, if it is conditional. */
    when?: string;
    note?: string;
}
export interface TableEntry {
    key: StateKey;
    kind: FlowState['kind'];
    phase?: string;
    /** KYC `NO_ACTION_REQUIRED` only. */
    reason?: 'IN_REVIEW' | 'ON_HOLD' | 'REJECTED';
    /** `DELIVERY` only. */
    state?: DeliveryState;
    /** FE doc screen numbers that render this state. */
    screens: readonly number[];
    /**
     * `SPECIFIED` — the docs enumerate this state's legal transitions.
     * `UNSPECIFIED` — they do not; `assertLegalEmission` cannot judge emissions here and says so.
     */
    docStatus: 'SPECIFIED' | 'UNSPECIFIED';
    allowedTransitions: readonly AllowedTransition[];
    /** Absent when the docs publish no bindings row for this state. */
    mayReturn?: readonly StateKey[];
    /** Flow-terminal. Enumerated here so no SDK infers it. */
    terminal: boolean;
    /** `ORDER{CREATED}` only: the statuses that end the flow. */
    terminalStatuses?: readonly OrderStatus[];
    notes?: readonly string[];
}
export declare const TRANSITION_TABLE: Readonly<Record<StateKey, TableEntry>>;
export declare const STATE_KEYS: StateKey[];
/**
 * The `/fiat/*` surface. Informational data — emissions are checked against each state's
 * `allowedTransitions`, not against this list.
 *
 * Sourced from contract §Endpoints, with one deliberate divergence: `POST /fiat/payment-session` is
 * named by the table (QUOTE's capture-first entry) while the doc's endpoint table still lists no
 * session-minting call for that rail. The `/fiat/auth/*` routes come from the Fun identity design
 * that specifies `FUN_AUTH`.
 */
export declare const DOCUMENTED_ENDPOINTS: readonly ["GET /fiat/payment-methods", "POST /fiat/quote", "POST /fiat/auth", "POST /fiat/auth/verify", "POST /fiat/auth/refresh", "POST /fiat/auth/revoke", "POST /fiat/payment-session", "POST /fiat/session", "POST /fiat/session/verify", "GET /fiat/quotes/:quoteRef", "POST /fiat/kyc/form", "POST /fiat/kyc/capture", "POST /fiat/kyc/sdk-token", "POST /fiat/kyc/document", "POST /fiat/instruments", "POST /fiat/orders", "GET /fiat/orders/:id", "GET /fiat/delivery/:deliveryId", "GET /fiat/orders/:id/instructions", "POST /fiat/orders/:id/confirm-payment", "POST /fiat/orders/:id/reference", "POST /fiat/orders/:id/cancel", "POST /fiat/orders/:id/surface-result"];
/**
 * Documented endpoints no flow state offers, and why. Declared so an endpoint nothing can reach is
 * visible instead of silent — the table test asserts the unoffered set equals exactly these.
 */
export declare const UNOFFERED_ENDPOINTS: readonly {
    endpoint: EndpointTemplate;
    reason: string;
}[];
/**
 * States entered out-of-band rather than by returning from a call. Declared so an unreachable state
 * is visible instead of silent — the table test asserts reachability from QUOTE equals (all state
 * keys − these).
 */
export declare const UNREACHABLE_STATES: readonly {
    stateKey: StateKey;
    reason: string;
}[];
/**
 * The live answer to what `UNOFFERED_ENDPOINTS` declares: documented endpoints that no state's
 * `allowedTransitions` names. The table test asserts the two agree, so a new orphan and a stale
 * declaration both fail.
 */
export declare function unofferedEndpoints(): readonly EndpointTemplate[];
/**
 * The live answer to what `UNREACHABLE_STATES` declares: states no `mayReturn` path reaches from
 * `QUOTE`, the flow's entry. The table test asserts the two agree.
 *
 * `mayReturn` is the only edge set the contract publishes, so it is the only graph there is to walk
 * — a state absent from every one of them cannot be arrived at by following the contract.
 */
export declare function unreachableStates(from?: StateKey): readonly StateKey[];
/** State → its table key. The one place kind/phase/reason is flattened. */
export declare function stateKey(state: FlowState): StateKey;
export declare const tableEntry: (state: FlowState) => TableEntry;
/**
 * Flow-terminal, read from the table — never inferred from `transitions.length`.
 * `ORDER{CREATED}` is terminal when its status is in the entry's `terminalStatuses`.
 */
export declare function isTerminal(state: FlowState): boolean;
