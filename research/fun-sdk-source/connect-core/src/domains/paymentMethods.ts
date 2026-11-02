/**
 * Supported payment methods in FunkitConnect.
 *
 * The platform-agnostic enum lives here in `@funkit/connect-core` so domain
 * code (e.g. `checkoutNotifications`, transfer-status derivation) can compare
 * against it without dragging in web-only dependencies. The fuller
 * `PaymentMethodInfo` type tree — including the variants that reference
 * `BluvoExchangeType` and the `createPaymentMethodInfo` factory — stays in
 * `@funkit/connect` until the bluvo/icon deps are decoupled.
 */
export enum PaymentMethod {
  /** Meld - Credit / Debit Card **/
  CARD = 'card',
  /** Account Balance **/
  ACCOUNT_BALANCE = 'balance',
  /** Bluvo - Exchange / Brokerage **/
  BROKERAGE = 'brokerage',
  TOKEN_TRANSFER = 'token_transfer',
  BITCOIN_LIGHTNING = 'bitcoin_lightning',
  CASH_APP_LIGHTNING = 'cash_app_lightning',
  VIRTUAL_BANK = 'virtual_bank',
  SWAPPED_CARD = 'swapped_card',
  SEPA = 'sepa',
  SEPA_INSTANT = 'sepa_instant',
  VENMO = 'venmo',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  REVOLUT_PAY = 'revolut_pay',
}
