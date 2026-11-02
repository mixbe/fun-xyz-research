import type {
  MoonPayQuoteInput,
  MoonPayStepResponse,
} from '@fun-xyz/fiat-contract/moonpay'

/** What the device quote says about paying now. */
export interface MoonPayDeviceQuote {
  /** The Apple Pay button's `quote` prop. */
  signature: string
  executable: boolean
  /** MoonPay wants the buyer in its challenge frame before this quote can be paid. */
  challengeUrl?: string
}

/** A device quote, with the parameters it priced. */
export interface PricedDeviceQuote {
  input: MoonPayQuoteInput
  quote: MoonPayDeviceQuote
}

/** The backend builds the parameters, so the same ones always serialize the same way. */
export function sameQuoteInput(
  a: MoonPayQuoteInput,
  b: MoonPayQuoteInput,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * The one rule for showing the Apple Pay button: our backend prompts `order`, MoonPay's quote for
 * that prompt's parameters can be paid with no challenge, and the button has drawn.
 */
export function revealGate({
  response,
  deviceQuote,
  painted,
}: {
  response: MoonPayStepResponse | undefined
  deviceQuote: PricedDeviceQuote | undefined
  painted: boolean
}): boolean {
  return (
    response?.next === 'order' &&
    deviceQuote !== undefined &&
    sameQuoteInput(deviceQuote.input, response.quoteInput) &&
    deviceQuote.quote.executable &&
    deviceQuote.quote.challengeUrl === undefined &&
    painted
  )
}
