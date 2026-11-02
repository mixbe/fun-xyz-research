/**
 * fiat-contract — recorded fixtures + loader.
 *
 * Every `.json` file in this directory records a step response from the source named in its
 * metadata. `screen-04-order-review.json` is the one payload published *by reference*
 * ("quote: <same shape as Screen 1, refreshed>"): its quote is Screen 1's payload verbatim.
 * They are
 * already synthetic (`q_8f2`, `o_31c`, `eyJ…`, `"…"` placeholders); the redaction rule applies to
 * fixtures too, so never replace a fake session token, bank field, or PII value with a real one.
 *
 * Every fixture is a full step response (`state` + `provider` + `transitions`). The contract doc's worked
 * example elides `provider` in its prose; the three `worked-example-*` fixtures add
 * `"provider": "TRANSAK"` so they validate as real responses — `provider` is always present on the
 * wire, and the contract has no half-response shape.
 */
import type { StateKey } from '../table';
/** `IDENTITY_DOC` is the Fun identity design that specifies `FUN_AUTH` and the Fun session. */
export type FixtureSource = 'FE_DOC' | 'CONTRACT_DOC' | 'KYC_DOC' | 'IDENTITY_DOC';
export interface FixtureMeta {
    id: string;
    file: string;
    source: FixtureSource;
    /** Where in the source doc this step response is published. */
    docRef: string;
    /** FE doc screen number, when the fixture comes from a screen card. */
    screen?: number;
    stateKey: StateKey;
    notes?: readonly string[];
}
export declare const FIXTURES: readonly FixtureMeta[];
/**
 * State entries with no published step response to record. Declared so missing coverage is visible
 * instead of silent — the fixture test asserts coverage equals (all state keys − these).
 */
export declare const FIXTURE_COVERAGE_GAPS: readonly {
    stateKey: StateKey;
    reason: string;
}[];
export declare const fixtureMeta: (id: string) => FixtureMeta;
/**
 * Raw step response — deliberately `unknown`, so callers validate before use.
 *
 * Reads from the generated `data.ts`: no filesystem, so this works under React Native, in a
 * browser, and in both CJS and ESM output. A fresh deep copy each call, so a consumer mutating a
 * fixture in one test cannot poison another.
 */
export declare function loadFixture(id: string): unknown;
export interface LoadedFixture {
    meta: FixtureMeta;
    json: unknown;
}
export declare function loadFixtures(): LoadedFixture[];
