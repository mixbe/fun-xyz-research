/**
 * fiat-contract — assertion helpers. The only executable code in the package, and it does
 * exactly two things: validate shapes (zod) and judge emissions against the table.
 *
 * Test *suites* live in the consumer repos next to the code they test:
 *  - `fun-backend`: adapter conformance (every emission ∈ the legal set), outgoing step-response
 *    validation in dev/test, the scheduled provider drift run.
 *  - `connect-core`: exhaustive `computePage` table-walk, fixture-driven cold-render tests,
 *    harness units.
 */
import { type EndpointTemplate, type StateKey, type TableEntry } from './table';
import { type FixtureMeta } from './fixtures/index';
import type { FiatStepResponse, FlowState, Transition } from './types';
/** Thrown for anything the contract calls a violation — 4xx-class, never a user-facing state. */
export declare class ContractViolation extends Error {
    readonly issues: readonly string[];
    constructor(message: string, issues?: readonly string[]);
}
/** Validate a `/fiat/*` step response. Returns the parsed response; throws on violation. */
export declare function assertFiatStepResponse(json: unknown): FiatStepResponse;
/** `"POST /fiat/orders/:id/cancel"` matches `"POST /fiat/orders/o_31c/cancel"`. */
export declare function endpointMatches(template: EndpointTemplate, actual: string): boolean;
export interface EmissionCheck {
    state: StateKey;
    issues: readonly string[];
    /** True when the docs publish no legal transition set for this state. */
    unjudgeable: boolean;
}
/**
 * Every issue with `(state, transitions)` as an emission — the backend's conformance check.
 * Returns findings instead of throwing so adapters can report in bulk; `assertLegalEmission`
 * is the throwing wrapper.
 */
export declare function checkLegalEmission(state: FlowState, transitions: readonly Transition[]): EmissionCheck;
/** Throwing form of `checkLegalEmission` — the assertion adapters and harness tests use. */
export declare function assertLegalEmission(state: FlowState, transitions: readonly Transition[]): void;
/**
 * Assert a response's state is one the table says `from` may receive back.
 *
 * The stale rule means any call may in fact return any state, so this is a conformance
 * assertion on the server's *typical* sequence — never a client-side gate on rendering.
 * A state whose bindings row is unpublished (`mayReturn` absent) cannot be judged.
 */
export declare function assertLegalReturn(from: FlowState, to: FlowState): void;
/**
 * Visit every state entry exactly once. `connect-core`'s exhaustiveness test walks this to prove
 * every kind × phase resolves to a screen; `fun-backend` walks it to enumerate what it must emit.
 */
export declare function walkTable<T>(fn: (entry: TableEntry, key: StateKey) => T): T[];
export interface ValidatedFixture {
    meta: FixtureMeta;
    stepResponse: FiatStepResponse;
}
/** Load one fixture, validate its shape, and assert its emission is legal for its state. */
export declare function assertFixture(id: string): ValidatedFixture;
/** Validate every recorded fixture. Throws on the first violation. */
export declare function assertAllFixtures(): ValidatedFixture[];
