import {
  FormOfPaymentType,
  type SavedFormOfPayment,
  type SwappedFormOfPayment,
} from '@funkit/api-base'

/**
 * Preset quick-select deposit amounts — the embed's "amount pills". The key
 * names are the embed's contract, so they stay four discrete fields.
 */
export interface SwappedPillAmounts {
  pillAmount1: number
  pillAmount2: number
  pillAmount3: number
  pillAmount4: number
}

/**
 * The destination token the embed shows under the amount ("of DOGE" + icon).
 * Field names are the embed's contract (`SWAPPED_THEME` → `data.buyingCrypto*`).
 * Omitting both hides the row; the SDK does so when the integrator opts out
 * via `showFiatDestinationToken: false` or the token is incomplete.
 */
export interface SwappedBuyingCrypto {
  /** Ticker shown next to the amount, e.g. `DOGE`. */
  buyingCrypto: string
  /** Icon URL for the ticker. */
  buyingCryptoSrc: string
}

/**
 * Ref: https://www.notion.so/Fun-Parameter-Styling-Guide-312966ea6e398011bbc6c14e976e281d#63dcdd77ea2d488084a980cda4c63d08
 *
 * The shape of the theme payload sent to the embedded Swapped flow. Kept here
 * because both the web theme builder (`packages/connect/src/utils/swapped.ts`)
 * and any future RN builder produce this exact shape. The pill amounts ride
 * along optionally — the embed's config arrives over this one message.
 */
export interface SwappedTheme
  extends Partial<SwappedPillAmounts>, Partial<SwappedBuyingCrypto> {
  colors: Record<string, string>
  radii: Record<string, string>
  headerHeight: string
  headerFontWeight: string
  buttonFontWeight: string
  modalBottomBarButtonHeight: string
  iframeBackground: string
  paddingPrimary?: string
  paddingPrimaryX?: string
  paddingPrimaryY?: string
  paddingSecondary: string
  paddingTertiary: string
  baseFont?: string
  secondaryFont?: string
  topbarIconColor?: string
  topbarIconHoverColor?: string
  headerIconWrapperSize?: string
  headerIconSize?: string
  topbarTextFontSize?: string
  contentPadding?: string
  boxPaddingY?: string
  boxPaddingX?: string
  paymentMethodLightLogos?: boolean
  topbarPaddingX?: string
  topbarPaddingY?: string
}

/**
 * The theme payload for Swapped's v2 design. `design: 'v2'` turns the design
 * on; every other field overrides one of v2's own defaults, so only what the
 * host means to restyle is sent and the layout fields stay the widget's.
 */
export interface SwappedV2Theme extends Partial<SwappedTheme> {
  design: 'v2'
  colors: Record<string, string>
  radii: Record<string, string>
}

export const SWAPPED_CARD_BRANDS: Record<
  string,
  { displayName: string; iconImageUrl: string }
> = {
  visa: {
    displayName: 'Visa',
    iconImageUrl: 'https://sdk-cdn.fun.xyz/images/swapped/visa.svg',
  },
  mastercard: {
    displayName: 'Mastercard',
    iconImageUrl: 'https://sdk-cdn.fun.xyz/images/swapped/mastercard.svg',
  },
  cartes_bancaires: {
    displayName: 'Cartes Bancaires',
    iconImageUrl: 'https://sdk-cdn.fun.xyz/images/swapped/cartes_bancaires.svg',
  },
  jcb: {
    displayName: 'JCB',
    iconImageUrl: 'https://sdk-cdn.fun.xyz/images/swapped/jcb.svg',
  },
  unionpay: {
    displayName: 'UnionPay',
    iconImageUrl: 'https://sdk-cdn.fun.xyz/images/swapped/unionpay.svg',
  },
}

const FUN_ICON_OVERRIDES: Partial<Record<FormOfPaymentType, string>> = {
  [FormOfPaymentType.CARDS]:
    'https://sdk-cdn.fun.xyz/images/swapped/card-payment.svg',
  [FormOfPaymentType.BANK_TRANSFER]:
    'https://sdk-cdn.fun.xyz/images/swapped/bank-transfer.svg',
  [FormOfPaymentType.REVOLUT_PAY]:
    'https://sdk-cdn.fun.xyz/images/swapped/revolut-pay.svg',
  [FormOfPaymentType.APPLE_PAY]:
    'https://sdk-cdn.fun.xyz/images/swapped/apple-pay.svg',
  [FormOfPaymentType.GOOGLE_PAY]:
    'https://sdk-cdn.fun.xyz/images/swapped/google-pay.svg',
  [FormOfPaymentType.PAYPAL]:
    'https://sdk-cdn.fun.xyz/images/swapped/paypal.svg',
}

export const isSavedFormOfPaymentType = (
  fop: SwappedFormOfPayment,
): fop is SavedFormOfPayment =>
  // String check, not just presence, so a malformed FOP falls back safely.
  typeof (fop as Partial<SavedFormOfPayment>).cardBrand === 'string' &&
  typeof (fop as Partial<SavedFormOfPayment>).cardLastFour === 'string'

export const getSavedFormOfPaymentDisplayName = (
  fop: SavedFormOfPayment,
): string => {
  const cardBrand = fop.cardBrand.replace(/ /g, '_').toLowerCase()
  const cardBrandInfo = SWAPPED_CARD_BRANDS[cardBrand]
  const cardDisplayName = cardBrandInfo?.displayName ?? fop.cardBrand
  return `${cardDisplayName} (...${fop.cardLastFour})`
}

export const getFormOfPaymentDisplayName = (
  fop: SwappedFormOfPayment,
): string =>
  isSavedFormOfPaymentType(fop)
    ? getSavedFormOfPaymentDisplayName(fop)
    : fop.name

// temp fn to get the CC brand icon until Swapped api supports this natively
export const getSavedFormOfPaymentIcon = (
  fop: SavedFormOfPayment,
): string | undefined => {
  const cardBrand = fop.cardBrand.replace(/ /g, '_').toLowerCase()
  const cardBrandInfo = SWAPPED_CARD_BRANDS[cardBrand]
  return cardBrandInfo?.iconImageUrl
}

export const getSwappedIcon = (
  fop: SwappedFormOfPayment,
  isDarkMode: boolean,
): string => {
  const iconUrl = fop.iconImageUrl
  const funIcon = FUN_ICON_OVERRIDES[fop.fopType]

  if (isSavedFormOfPaymentType(fop)) {
    const savedPaymentIcon = getSavedFormOfPaymentIcon(fop)
    if (savedPaymentIcon) {
      return savedPaymentIcon
    }
  }

  if (funIcon) {
    return isDarkMode ? funIcon.replace('.svg', '-light.svg') : funIcon
  }

  // Swapped provides transparent-background icons at /assets/fun/ instead of /assets/.
  // The backend returns the standard path, so we rewrite it client-side.
  const swappedIcon = iconUrl.replace('/assets/', '/assets/fun/')

  // for light icons Swapped appends "light" to the file name
  // https://www.notion.so/Can-the-swapped-payment-method-icon-urls-being-sent-back-have-transparent-background-31e966ea6e3980c9a8d5fd27b63b22ee?d=7bb966ea6e39833aa93c038f6243898e
  return isDarkMode ? swappedIcon.replace('.svg', 'light.svg') : swappedIcon
}

export function getSwappedOrigin(url: string): string | null {
  try {
    const { origin } = new URL(url)
    return isSwappedOrigin(origin) ? origin : null
  } catch {
    return null
  }
}

export function isSwappedOrigin(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin)
    // - https only: an http embed is a downgrade, never something we serve.
    // - The leading dot on the suffix checks is load-bearing — without it
    //   `evil-swapped.com` and friends match.
    return (
      protocol === 'https:' &&
      (hostname === 'swapped.com' ||
        hostname.endsWith('.swapped.com') ||
        hostname === 'swapped.dev' ||
        hostname.endsWith('.swapped.dev'))
    )
  } catch {
    return false
  }
}
