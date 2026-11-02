export enum MeldServiceProvider {
  ALCHEMYPAY = 'ALCHEMYPAY',
  BANXA = 'BANXA',
  BILIRA = 'BILIRA',
  BINANCECONNECT = 'BINANCECONNECT',
  BLOCKCHAINDOTCOM = 'BLOCKCHAINDOTCOM',
  BTCDIRECT = 'BTCDIRECT',
  COINBASEPAY = 'COINBASEPAY',
  MOONPAY = 'MOONPAY',
  FONBNK = 'FONBNK',
  GUARDARIAN = 'GUARDARIAN',
  KOYWE = 'KOYWE',
  MERCURYO = 'MERCURYO',
  MESH = 'MESH',
  MESO = 'MESO',
  ONMETA = 'ONMETA',
  ONRAMPMONEY = 'ONRAMPMONEY',
  PAYBIS = 'PAYBIS',
  PAYPAL = 'PAYPAL',
  RAMP = 'RAMP',
  REVOLUT = 'REVOLUT',
  ROBINHOOD = 'ROBINHOOD',
  SARDINE = 'SARDINE',
  SHIFT4 = 'SHIFT4',
  SIMPLEX = 'SIMPLEX',
  SKRILLCRYPTO = 'SKRILLCRYPTO',
  STRIPE = 'STRIPE',
  TOPPER = 'TOPPER',
  TRANSAK = 'TRANSAK',
  TRANSFI = 'TRANSFI',
  UNLIMIT = 'UNLIMIT',
  YELLOWCARD = 'YELLOWCARD',
  SWAPPED = 'SWAPPED',
  KRYPTONIM = 'KRYPTONIM',
}

export const MELD_PROVIDER_CATEGORIES = [
  'BANK_LINKING',
  'CRYPTO_ONRAMP',
  'CRYPTO_OFFRAMP',
  'CRYPTO_TRANSFER',
  'FIAT_PAYMENTS',
] as const

export type MeldFiatCurrency = {
  /** fiat code. e.g. USD/EUR */
  currencyCode: string
  /** fiat name. e.g. United State Dollar */
  name: string
  /** image URL for the currency symbol provided by meld */
  symbolImageUrl: string
}

export type MeldDefaultFiatCurrency = {
  /** Two-letter code (ISO 3166-1 alpha-2) for the Country. */
  countryCode: string
  /** fiat code. e.g. USD/EUR */
  defaultCurrencyCode: string
  /** The identifier for the Payment Method */
  defaultPaymentMethods: MeldQuote['paymentMethodType'][]
}

export type MeldCreateCryptoQuoteParams = {
  /**
   * Two-letter country code (ISO 3166-1 alpha-2)
   */
  countryCode: string

  /**
   * Meld generated unique identifier for your customer. This should be used to track customer activity.
   */
  customerId?: string

  /**
   * The cryptocurrency the customer is buying (e.g. BTC, ETH).
   */
  destinationCurrencyCode: string

  /**
   * Your unique identifier for your customer. If maintaining your own customer management system this can also be used for tracking customer activity.
   */
  externalCustomerId?: string

  /**
   * Payment Method Type or SubType
   */
  paymentMethodType?: string

  /**
   * An optional list of Strings representing the Service Providers for this Quote
   */
  serviceProviders?: MeldServiceProvider[]

  /**
   * The amount of source currency your customer wants tosend in this transaction (e.g., 50.05)
   */
  sourceAmount: `${number}`

  /**
   * The fiat currency the user is buying crypto with (e.g. USD, EUR)
   */
  sourceCurrencyCode: string

  /**
   * Subdivision is a optional parameter Only applicable if the country code is US or CA (e.g. US-CA).
   */
  subdivision?: string

  /**
   * Your customer's wallet address
   */
  walletAddress?: `0x${string}`
}

export type MeldQuote = {
  /**
   * Two-letter country code (ISO 3166-1 alpha-2)
   */
  countryCode: string

  /**
   * A numerical score representing the expectation a Customer will convert
   */
  customerScore?: number

  /**
   * Destination currency amount to be received for this quote
   */
  destinationAmount: number

  /**
   * Code of currency being quoted: BTC, ETH, ...
   */
  destinationCurrencyCode: string

  /**
   * The exchange rate at the time the request is sent
   */
  exchangeRate: number

  /**
   * The fiat amount exchanged when buying or selling crypto, excluding fees
   */
  fiatAmountWithoutFees: number

  /**
   * The name of the institution or broker used for this quote, if present
   */
  institutionName?: string | null

  /**
   * LowKYC indicates if the quote amount is below the provider's low KYC threshold, meaning the user may not need to upload documents, which can increase conversion.
   */
  lowKyc?: boolean | null

  /**
   * The network fee applied to a crypto transaction
   */
  networkFee?: number | null

  /**
   * The fee amount charged by the partner to process your customer's purchase
   */
  partnerFee?: number | null

  /**
   * Payment Method Type used for this quote
   */
  paymentMethodType: 'APPLE_PAY' | 'MASTERCARD' | 'SEPA' | 'VISA'

  /**
   * The service provider used for this transaction
   */
  serviceProvider: MeldServiceProvider

  /**
   * Amount requested + fees
   */
  sourceAmount: number

  /**
   * The fiat currency the user is buying crypto with (e.g. USD, EUR)
   */
  sourceCurrencyCode: string

  /**
   * The total amount of fees that will be charged
   */
  totalFee?: number | null

  /**
   * The fee amount charged by the service provider to process your customer's purchase
   */
  transactionFee?: number | null

  /**
   * The type of crypto transaction
   */
  transactionType: 'CRYPTO_PURCHASE' // | 'CRYPTO_SELL', but only care about buying atm
}

export type MeldCreateCryptoQuoteResponse = {
  quotes: MeldQuote[]
}

export type MeldCreateCryptoWidgetParams = {
  /**
   * Meld generated unique identifier for your customer. This should be used to track customer activity.
   */
  customerId?: string

  /**
   * Your unique identifier for your customer. If maintaining your own customer management system this can also be used for tracking customer activity.
   */
  externalCustomerId?: string

  /**
   * Your reference Id for your widget session
   */
  externalSessionId?: string

  sessionData: {
    /**
     * Two-letter country code (ISO 3166-1 alpha-2)
     */
    countryCode: string

    /**
     * The cryptocurrency the customer is buying (e.g. BTC, ETH).
     */
    destinationCurrencyCode: string

    /**
     * If provided, the institution to bypass the institution selection screen in the service provider's widget. Currently this is only supported for MESH widget sessions.
     */
    institutionId?: string

    /**
     * Where supported by the Service Provider, Meld can help you lock the cryptocurrency and/or wallet address fields within the widget.
     */
    lockFields?: ('destinationCurrencyCode' | 'walletAddress')[]

    /**
     * Payment Method Type or SubType
     */
    paymentMethodType?: string

    /**
     * The url to redirect to following completion of the widget flow
     */
    redirectUrl?: string

    /**
     * The service provider used for this transaction
     */
    serviceProvider: MeldServiceProvider

    /**
     * The amount of source currency your customer wants to send in this transaction (e.g., 50.05)
     */
    sourceAmount: `${number}`

    /**
     * The fiat currency the user is buying crypto with (e.g. USD, EUR)
     */
    sourceCurrencyCode: string

    /**
     * Your customer's wallet address
     */
    walletAddress: `0x${string}`

    /**
     * Your customer's wallet tag/destination tag/memo. This field is required for certain cryptocurrencies.
     */
    walletTag?: string
  }

  sessionType: 'BUY' // | 'SELL' | 'TRANSFER' - We only care about BUY atm

  /**
   * For MESH only. Details about a previously authenticated crypto session or bank-linking connection.
   * If provided, the widget will not require the customer to authenticate again as long as the authentication is still valid.
   * The scope of these authentication bypass details are restricted to the same customer, service provider, and institution that were used in the original connection.
   */
  authenticationBypassDetails?: {
    /**
     * The widget type associated with the previously authenticated session/connection.
     */
    category: string

    /**
     * The Meld id of the crypto session or bank-linking connection in which the customer has already authenticated with their institution.
     * The auth tied to this session/connection will be used to bypass the authentication process for the current session, if it is still valid.
     * This id may pertain to the initial session/connection in which the customer authenticated, or any subsequent session that used this prior authentication successfully.
     */
    previouslyAuthenticatedId: string
  }
}

export type MeldCreateCryptoWidgetResponse = {
  /**
   * Meld generated unique identifier for your customer. This should be used to track customer activity.
   */
  customerId?: string | null

  /**
   * Your unique identifier for your customer. If maintaining your own customer management system this can also be used for tracking customer activity.
   */
  externalCustomerId?: string | null

  /**
   * Your reference Id for your widget session
   */
  externalSessionId?: string | null

  /**
   * Unique identifier for this session
   */
  id: string

  /**
   * The session token
   */
  token: string

  /**
   * The crypto widget URL
   */
  widgetUrl: string
}

export interface MeldError extends Error {
  /**
   * A categorization of the error
   */
  code: string

  /**
   * A user-friendly representation of the error code.
   * This may change over time and is not safe for programmatic use.
   */
  errors?: string[] | null

  /**
   * A developer-friendly representation of the error code.
   * This may change over time and is not safe for programmatic use.
   */
  message: string

  /**
   * The request Id
   */
  requestId: string

  /**
   * The date and time when the request was made (ISO)
   */
  timestamp: string | null
}

export interface MeldSupportedFiatResponse {
  currencies: MeldFiatCurrency[]
  /** Irrelevant */
  preferred: string[]
}

export type SearchDefaultFiatParams = {
  countries: string[]
  categories?: (typeof MELD_PROVIDER_CATEGORIES)[number][]
}

export interface MeldDefaultFiatResponse {
  currencies: MeldDefaultFiatCurrency[]
}

export interface GetCryptoPurchaseLimitsParams {
  /**
   * The two-letter country code (ISO 3166-1 alpha-2) to search for supported fiat currencies.
   * A comma separated list of countries.
   */
  countries: string[]

  /**
   * The crypto currencies to search for limits
   */
  cryptoCurrencies: string[]

  /**
   * The fiat currencies to search for limits
   */
  fiatCurrencies: string[]

  /**
   * The categories to search for limits
   */
  categories?: (typeof MELD_PROVIDER_CATEGORIES)[number][]
}

export interface MeldFiatCurrencyLimit {
  currencyCode: string
  defaultAmount: number | null
  minimumAmount: number
  maximumAmount: number
}

export interface MeldFiatLimitResponse {
  limits: MeldFiatCurrencyLimit[]
}
