export function isSafari(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.userAgent !== 'undefined' &&
    /Version\/([0-9._]+).*Safari/.test(navigator.userAgent) // Source: https://github.com/DamonOehlman/detect-browser/blob/master/src/index.ts
  )
}

function isArc(): boolean {
  return (
    typeof document !== 'undefined' &&
    getComputedStyle(document.body).getPropertyValue('--arc-palette-focus') !==
      ''
  )
}

/**
 * Safely checks if a URL is valid.
 * Falls back to new URL() for older browsers that don't support URL.canParse.
 */
export function isValidUrl(url: string | undefined = ''): boolean {
  try {
    return URL.canParse?.(url) ?? !!new URL(url)
  } catch {
    return false
  }
}

export enum BrowserType {
  Arc = 'Arc',
  Brave = 'Brave',
  Browser = 'Browser',
  Chrome = 'Chrome',
  Edge = 'Edge',
  Firefox = 'Firefox',
  Opera = 'Opera',
  Safari = 'Safari',
}

export function getBrowser(): BrowserType {
  // bail out if `navigator` or `navigator.userAgent` is not available
  if (typeof navigator === 'undefined') {
    return BrowserType.Browser
  }
  const ua = navigator.userAgent?.toLowerCase()
  // @ts-expect-error - brave is not in the navigator type
  if (navigator.brave?.isBrave) {
    return BrowserType.Brave
  }
  if (ua?.indexOf('edg/') > -1) {
    return BrowserType.Edge
  }
  if (ua?.indexOf('op') > -1) {
    return BrowserType.Opera
  }
  if (isArc()) {
    return BrowserType.Arc
  }
  if (ua?.indexOf('chrome') > -1) {
    return BrowserType.Chrome
  }
  if (ua?.indexOf('firefox') > -1) {
    return BrowserType.Firefox
  }
  if (isSafari()) {
    return BrowserType.Safari
  }
  return BrowserType.Browser
}

export function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/**
 * `undefined` when storage is unavailable, denied, or the key is unset.
 * Storage access failures are passed to `onError`; errors from that callback
 * propagate to the caller.
 */
export function safeGetLocalStorage(
  key: string,
  onError?: (e: unknown) => void,
): string | undefined {
  // The probe sits inside the try: Safari with all cookies blocked throws on
  // the `localStorage` getter itself.
  try {
    if (!isLocalStorageAvailable()) {
      return undefined
    }
    return localStorage.getItem(key) ?? undefined
  } catch (e) {
    onError?.(e)
    return undefined
  }
}

/**
 * Storage access failures are passed to `onError`, making persistence
 * best-effort unless that callback throws.
 */
export function safeSetLocalStorage(
  key: string,
  value: string,
  onError?: (e: unknown) => void,
): void {
  try {
    if (!isLocalStorageAvailable()) {
      return
    }
    localStorage.setItem(key, value)
  } catch (e) {
    onError?.(e)
  }
}
