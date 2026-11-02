import { toHex } from 'viem'

export function randomBytes(length: number) {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  return toHex(bytes)
}

export function generateRandomCheckoutSalt() {
  return toHex(BigInt(randomBytes(32)))
}
