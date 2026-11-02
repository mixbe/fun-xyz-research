/**
 * fiat-contract — the published contract between `fun-backend` (emits step responses) and
 * `funkit`/`connect-core` (renders them). Types + zod schemas + the transition table as data +
 * recorded fixtures + assertion helpers. No runtime logic beyond validation and assertion.
 *
 * The package version IS the capability handshake's table version (`TABLE_VERSION`).
 */
export * from './types';
export * from './codes';
export * from './schemas';
export * from './table';
export * from './assert';
export * from './terms';
export * from './routing';
export * from './providers/moonpay';
export * from './providers/moonpay.schemas';
export * from './providers/coinbase';
export * from './providers/coinbase.schemas';
export * from './providers/stripe';
export * from './providers/stripe.schemas';
export { FIXTURES, FIXTURE_COVERAGE_GAPS, fixtureMeta, loadFixture, loadFixtures, type FixtureMeta, type FixtureSource, type LoadedFixture, } from './fixtures/index';
export * from './providers/moonpay-guest';
export * from './providers/moonpay-guest.schemas';
