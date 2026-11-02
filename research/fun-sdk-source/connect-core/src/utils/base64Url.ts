const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const BASE64URL_ALPHABET = `${BASE64_ALPHABET.slice(0, 62)}-_`

const MAX_ASCII_CODE = 0x7f

/**
 * Unpadded base64url of an ASCII string, such as an already URL-encoded query
 * string. Throws on any other character, which would need UTF-8 encoding first.
 */
export function encodeBase64UrlAscii(ascii: string): string {
  let encoded = ''
  for (let index = 0; index < ascii.length; index += 3) {
    const byteCount = Math.min(3, ascii.length - index)
    let chunk = 0
    for (let offset = 0; offset < 3; offset++) {
      const code = offset < byteCount ? ascii.charCodeAt(index + offset) : 0
      if (code > MAX_ASCII_CODE) {
        throw new Error(`not ASCII at index ${index + offset}`)
      }
      chunk = (chunk << 8) | code
    }
    for (let position = 0; position <= byteCount; position++) {
      encoded += BASE64URL_ALPHABET[(chunk >> (18 - 6 * position)) & 63]
    }
  }
  return encoded
}

// Hermes does not guarantee Buffer or atob.
export function decodeBase64Url(input: string): string {
  // JWT payloads are usually unpadded, but a host that pads is still emitting
  // valid base64url — and '=' is not in the alphabet below, so leaving it in
  // would throw and cost that host the real expiry.
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '')
  const bytes: number[] = []
  let buffer = 0
  let bits = 0
  for (const char of base64) {
    const value = BASE64_ALPHABET.indexOf(char)
    if (value === -1) {
      throw new Error('not base64url')
    }
    buffer = (buffer << 6) | value
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes.push((buffer >> bits) & 0xff)
    }
  }
  return utf8Decode(bytes)
}

function utf8Decode(bytes: number[]): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(new Uint8Array(bytes))
  }
  // JWT claim keys and numeric expiry values are ASCII.
  return String.fromCharCode(...bytes)
}
