export enum RailConfigType {
  FIAT_TO_CRYPTO = 'FIAT_TO_CRYPTO',
  CRYPTO_TO_FIAT = 'CRYPTO_TO_FIAT',
  CRYPTO_TO_CRYPTO = 'CRYPTO_TO_CRYPTO',
}

interface ClientUserContext {
  userId: string
  countryCode: string
}

interface PaymentCheckoutLimitsCriteria {
  /**
   * **WARNING! Unlike most of our system, this amount is in EUR** (as expected by Swapped)
   */
  defaultMinAmount: number
  /**
   * Optional max sell amount, **also in EUR** (see {@link defaultMinAmount}).
   * Best-effort cap from the user's balance so Swapped's UI can pre-empt over-asks.
   */
  defaultMaxAmount?: number
}

export interface SwappedFiatToCryptoRailConfig extends ClientUserContext {
  type: RailConfigType.FIAT_TO_CRYPTO
  fiatCurrencyCode: string
  recipientTargets: RecipientTarget[]
  /** Fiat currency to prefill; overrides the region-derived currency. */
  baseCurrencyCode?: string
  /** Prevent editing the prefilled amount. Requires baseCurrencyAmount. */
  lockAmount?: boolean
  /** Prevent changing the prefilled fiat currency. */
  lockBaseCurrency?: boolean
  thirdPartyPaymentConfigs?: ThirdPartyPaymentConfigs
  // Technically not required by backend schema, but we never want not to pass it
  checkoutLimitsCriteria: PaymentCheckoutLimitsCriteria
  /**
   * Prefills the fiat amount input in the Swapped on-ramp widget, denominated in
   * {@link baseCurrencyCode} when provided, otherwise {@link fiatCurrencyCode}.
   * Max 2 decimals; the backend strips malformed values instead of failing the request.
   */
  baseCurrencyAmount?: number
}

export interface SwappedCryptoToFiatRailConfig extends ClientUserContext {
  type: RailConfigType.CRYPTO_TO_FIAT
  fiatCurrencyCode: string
  sourceToken: {
    chainId: string
    address: string
  }
  thirdPartyPaymentConfigs?: ThirdPartyPaymentConfigs
  checkoutLimitsCriteria?: PaymentCheckoutLimitsCriteria
}

export interface SwappedCryptoToCryptoRailConfig extends ClientUserContext {
  type: RailConfigType.CRYPTO_TO_CRYPTO
  recipientTargets: RecipientTarget[]
  baseCurrencyCode: string
  thirdPartyPaymentConfigs?: ThirdPartyPaymentConfigs
  // Technically not required by backend schema, but we never want not to pass it
  checkoutLimitsCriteria: PaymentCheckoutLimitsCriteria
}

export type RailConfig =
  | SwappedFiatToCryptoRailConfig
  | SwappedCryptoToFiatRailConfig
  | SwappedCryptoToCryptoRailConfig

/**
 * Request parameters for fetching forms of payment (FOP).
 */
export interface GetFopsParams {
  /** @deprecated Required by schema but ignored when railConfigs is present. For on-ramp, use railConfigs[].recipientTargets. Not used for off-ramp. */
  recipientAddress: string
  /** Unique identifier for the user */
  userId: string
  /** @deprecated Required by schema but ignored when railConfigs is present. For on-ramp, use railConfigs[].recipientTargets. For off-ramp, use railConfigs[].sourceToken. */
  destinationToken: {
    chainId: string
    address: string
  }
  /** @deprecated Use railConfigs[].fiatCurrencyCode instead. */
  fiatCurrencyCode?: string
  /** @deprecated Use railConfigs[].countryCode instead. */
  countryCode?: string
  /** @deprecated Use railConfigs[].thirdPartyPaymentConfigs instead. */
  thirdPartyPaymentConfigs?: ThirdPartyPaymentConfigs
  /** @deprecated For on-ramp only. Use railConfigs[].recipientTargets instead. */
  recipientTargets?: RecipientTarget[]
  /** Criteria for checkout limits based on target chain and asset */
  checkoutLimitsCriteria?: {
    defaultMinAmount: number
  }
  /** Typed rail configurations for on-ramp/off-ramp — will eventually become required. */
  railConfigs?: RailConfig[]
}

export interface RecipientTarget {
  /** The wallet address that will receive the crypto */
  recipientAddress: string
  /** The destination token with chain ID and address */
  destinationToken: {
    chainId: string
    address: string
  }
}

export interface ThirdPartyPaymentConfigs {
  swapped?: SwappedConfig
}

export interface SwappedConfig {
  email?: string
  /** Theme configuration for the embedded flow iframe (key-value pairs for URL params) */
  themeConfig?: Record<string, string>
}

export enum FormOfPaymentType {
  APPLE_PAY = 'APPLE_PAY',
  ASET = 'ASET',
  ASTROPAY = 'ASTROPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  BLIK = 'BLIK',
  BOLETO = 'BOLETO',
  BOOSTPAY = 'BOOSTPAY',
  BYBIT = 'BYBIT',
  CAIXA = 'CAIXA',
  CARDS = 'CARDS',
  COINBASE_EXCHANGE = 'COINBASE_EXCHANGE',
  DANA = 'DANA',
  DOKU = 'DOKU',
  EPAY = 'EPAY',
  FLASH_VOUCHER = 'FLASH_VOUCHER',
  GCASH = 'GCASH',
  GOOGLE_PAY = 'GOOGLE_PAY',
  GOPAY = 'GOPAY',
  GRABPAY = 'GRABPAY',
  HAVALE = 'HAVALE',
  INTERAC = 'INTERAC',
  LOCAL_BANK_TRANSFER = 'LOCAL_BANK_TRANSFER',
  MAYA = 'MAYA',
  MERCADOPAGO = 'MERCADOPAGO',
  MOBILE_MONEY = 'MOBILE_MONEY',
  MOMO = 'MOMO',
  NETELLER = 'NETELLER',
  OVO = 'OVO',
  PAYPAL = 'PAYPAL',
  PAYSAFECARD = 'PAYSAFECARD',
  PIX = 'PIX',
  QR_GOTYME = 'QR_GOTYME',
  RAPID_TRANSFER = 'RAPID_TRANSFER',
  REVOLUT_PAY = 'REVOLUT_PAY',
  SKRILL = 'SKRILL',
  SPEI = 'SPEI',
  TOUCHNGO = 'TOUCHNGO',
  UPI = 'UPI',
  VIETQR = 'VIETQR',
  VIETTEL = 'VIETTEL',
  VIPPS = 'VIPPS',
  ZALO = 'ZALO',
}

export const PaymentGroup = {
  [FormOfPaymentType.APPLE_PAY]: 'apple-pay',
  [FormOfPaymentType.ASET]: 'aset',
  [FormOfPaymentType.ASTROPAY]: 'astropay',
  [FormOfPaymentType.BANK_TRANSFER]: 'bank-transfer',
  [FormOfPaymentType.BLIK]: 'blik',
  [FormOfPaymentType.BOLETO]: 'boleto',
  [FormOfPaymentType.BOOSTPAY]: 'boostpay',
  [FormOfPaymentType.BYBIT]: 'bybit',
  [FormOfPaymentType.CAIXA]: 'caixa',
  [FormOfPaymentType.CARDS]: 'creditcard',
  [FormOfPaymentType.COINBASE_EXCHANGE]: 'coinbase',
  [FormOfPaymentType.DANA]: 'dana',
  [FormOfPaymentType.DOKU]: 'doku',
  [FormOfPaymentType.EPAY]: 'epay',
  [FormOfPaymentType.FLASH_VOUCHER]: 'flash-voucher',
  [FormOfPaymentType.GCASH]: 'gcash',
  [FormOfPaymentType.GOOGLE_PAY]: 'google-pay',
  [FormOfPaymentType.GOPAY]: 'gopay',
  [FormOfPaymentType.GRABPAY]: 'grabpay',
  [FormOfPaymentType.HAVALE]: 'havale',
  [FormOfPaymentType.INTERAC]: 'interac',
  [FormOfPaymentType.LOCAL_BANK_TRANSFER]: 'local-bank-transfer',
  [FormOfPaymentType.MAYA]: 'maya',
  [FormOfPaymentType.MERCADOPAGO]: 'mercadopago',
  [FormOfPaymentType.MOBILE_MONEY]: 'mobile-money',
  [FormOfPaymentType.MOMO]: 'momo',
  [FormOfPaymentType.NETELLER]: 'neteller',
  [FormOfPaymentType.OVO]: 'ovo',
  [FormOfPaymentType.PAYPAL]: 'paypal',
  [FormOfPaymentType.PAYSAFECARD]: 'paysafecard',
  [FormOfPaymentType.PIX]: 'pix',
  [FormOfPaymentType.QR_GOTYME]: 'qr-gotyme',
  [FormOfPaymentType.RAPID_TRANSFER]: 'rapid-transfer',
  [FormOfPaymentType.REVOLUT_PAY]: 'revolutpay',
  [FormOfPaymentType.SKRILL]: 'skrill',
  [FormOfPaymentType.SPEI]: 'spei',
  [FormOfPaymentType.TOUCHNGO]: 'touchngo',
  [FormOfPaymentType.UPI]: 'upi',
  [FormOfPaymentType.VIETQR]: 'vietqr',
  [FormOfPaymentType.VIETTEL]: 'viettel',
  [FormOfPaymentType.VIPPS]: 'vipps',
  [FormOfPaymentType.ZALO]: 'zalo',
} as const satisfies Record<FormOfPaymentType, string>

export type PaymentGroupType = (typeof PaymentGroup)[FormOfPaymentType]

interface FormOfPaymentMetadata {
  checkoutLimit: {
    minAmount?: {
      amount: number
      fiatCurrencyCode: string
    }
    maxAmount?: {
      amount: number
      fiatCurrencyCode: string
    }
  }
}

/**
 * Represents a single form of payment option.
 */
export interface GenericFormOfPayment {
  fopType: FormOfPaymentType
  /** Display name of the payment method (e.g., "Google Pay", "Apple Pay") */
  name: string
  /** URL to embedded flow for the payment provider */
  embeddedFlowUrl: string
  /** URL to the payment method's icon */
  iconImageUrl: string
  metadata: FormOfPaymentMetadata
  /** Distinguishes on-ramp (FIAT_TO_CRYPTO) from off-ramp (CRYPTO_TO_FIAT) FOPs */
  railType?: RailConfigType
}

/**
 * Represents a saved form of payment with card-specific details.
 */
export interface SavedFormOfPayment {
  /** Payment type */
  fopType: FormOfPaymentType
  /** Display name of saved payment method  "mastercard •••• 1897" */
  name: string
  /** Card brand (e.g., "Visa", "Mastercard") */
  cardBrand: string
  /** First six digits of the card number */
  cardBin: string
  /** Last four digits of the card number */
  cardLastFour: string
  /** Card expiry (e.g., "12/26") */
  cardExpiry: string
  /** Name on the card */
  cardholderName: string
  /** URL to the payment method's icon */
  iconImageUrl: string
  /** URL to embedded flow for the payment provider */
  embeddedFlowUrl: string
  metadata: FormOfPaymentMetadata
  /** Distinguishes on-ramp (FIAT_TO_CRYPTO) from off-ramp (CRYPTO_TO_FIAT) FOPs */
  railType?: RailConfigType
}

export type SwappedFormOfPayment = GenericFormOfPayment | SavedFormOfPayment

/**
 * Response from the /fops API endpoint.
 */
export interface GetFopsResponse {
  /** List of generic/available forms of payment */
  genericFormsOfPayments: GenericFormOfPayment[]
  /** List of saved/previously used forms of payment for the user */
  savedFormsOfPayments: SavedFormOfPayment[]
}
