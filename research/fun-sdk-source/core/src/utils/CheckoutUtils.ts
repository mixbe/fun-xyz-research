import { randomBytes } from './ChainUtils'

export function generateRandomCheckoutSalt() {
  return BigInt(randomBytes(32))
}

export function roundToNearestBottomTenth(n: number) {
  return Math.floor(n / 10) * 10
}
