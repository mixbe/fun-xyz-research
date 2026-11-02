/** Base URL for token/chain icons hosted on the SDK CDN. */
export const SDK_CDN_IMAGES_URL = 'https://sdk-cdn.fun.xyz/images'

export const toChainCdnKey = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Derives the SDK CDN icon URL for a chain from its display name. */
export const getChainIconUrl = (chainName: string): string =>
  `${SDK_CDN_IMAGES_URL}/${toChainCdnKey(chainName)}.svg`
