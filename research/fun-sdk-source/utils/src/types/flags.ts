/**
 * Remember that these values show up in our logs
 * Make sure the enum values are unique
 * Once we ship a feature flag, we can't change the key.
 */
export enum FlagKey {
  /** @deprecated Moved to Statsig - Which countries should be blocked for Funkit Checkout. Reference Alpha-2 Code format https://www.iban.com/country-codes. */
  BlockedCountries = 'blocked_countries',
  /** @deprecated Moved to Statsig - Which users/addresses should be blocked for Funkit Checkout */
  AddressBlacklist = 'address_blacklist',
  /** @deprecated Moved to statsig - Whether to show the [Powered by Fun.xyz] tagline at the bottom of the checkout modal. */
  ShowPoweredTagline = 'show_powered_tagline',
  /** @deprecated Moved to statsig - Whether to enable Token Transfer as a payment method. */
  EnableTokenTransfer = 'enable_token_transfer',
  /** @deprecated Moved to statsig - Token Transfer payment method accepted source chain and assets */
  TokenTransferSourceChainsAndAssets = 'token_transfer_source_chains_and_assets',
  /** @deprecated Moved to statsig - Token Transfer universal deposit address */
  EnableTokenTransferUniversalDepositAddress = 'enable_token_transfer_universal_deposit_address',
  /** @deprecated Moved to statsig - Maximum usd amount that can be checked out. */
  MaxCheckoutUsd = 'max_checkout_usd',
  /** @deprecated Moved to statsig - Time estimate overrides */
  CheckoutTimeEstimateOverrides = 'checkout_time_estimate_overrides',
  /** @deprecated Moved to statsig - Default chain ID used in Token transfer (Direct deposit) screen */
  TokenTransferDefaultChainId = 'token_transfer_default_chain_id',
  /** @deprecated Moved to statsig - Set default token(s) in dropdown - prioritized in sorted list */
  TokenTransferDefaultTokens = 'token_transfer_default_tokens',
  /** @deprecated Moved to Statsig - Controls whether the checkout is activated or totally disabled */
  IsCheckoutActivated = 'is_checkout_activated',
  /** @deprecated Moved to statsig */
  ShowInfoBanner = 'show_info_banner',
  /** @deprecated - Moved to Statsig - Controls refresh interval to show the checkout notifications */
  CheckoutNotificationsRefreshInterval = 'checkout_notifications_refresh_interval',
  /** @deprecated - Moved to Statsig - Tokens for which to show the "New" badge in transfers */
  TokenTransferNewTokens = 'token_transfer_new_tokens',
  /** @deprecated - Moved to Statsig - Whether to show the Newly supported deposits banner in asset selection */
  NewTokenAssetSelectionBanner = 'new_token_asset_selection_banner',
  /** @deprecated Whether Relay bypass is enabled */
  IsRelayBypassEnabled = 'is_relay_bypass_enabled',
  /** @deprecated Relay bypass accepted source chain and assets */
  RelayBypassSourceChainsAndAssets = 'relay_bypass_source_chains_and_assets',
  /** @deprecated Relay bypass accepted target chain and assets */
  RelayBypassTargetChainsAndAssets = 'relay_bypass_target_chains_and_assets',
  /** @deprecated Moved to Statsig */
  EnableFiatDeposit = 'enable_fiat_deposit',
  /** @deprecated */
  EnableCard = 'enable_card',
  /** @deprecated */
  EnableBrokerage = 'enable_brokerage',
  /** @deprecated Moved to Statsig */
  EnableBluvoBrokerage = 'enable_bluvo_brokerage',
  /** @deprecated Moved to Statsig - Whether to use Meld as card payment */
  EnableMeldPayment = 'enable_meld_payment',
  /** @deprecated Moved to Statsig */
  MeldQuickOptions = 'meld_quick_options',
  /** @deprecated Moved to Statsig - Specifies the minimum value permitted for a token transfer. */
  MinTokenTransferValue = 'min_token_transfer_value',
  /** @deprecated - Moved to Statsig - Exclude certain tokens from withdrawal. */
  WithdrawalExcludeTokens = 'withdrawal_exclude_tokens',
  /** @deprecated Moved to Statsig - Accepted chains and assets for withdrawal */
  WithdrawalChainsAndAssets = 'withdrawal_chains_and_assets',
  /** @deprecated Moved to Statsig -  Chain ID sort order */
  ChainIdSortOrder = 'chain_id_sort_order',
  /** Whether to enable Bitcoin as a payment method. */
  /** @deprecated enable bitcoin directly instead as everybody now has SDK version that supports it  */
  EnableBitcoin = 'enable_bitcoin',
  /** @deprecated Moved to Statsig - Renders info banners for the currently selected chain */
  ChainInfoBanners = 'chain_info_banners',
  /** @deprecated */
  Permit2Tokens = 'permit2_tokens',
}
