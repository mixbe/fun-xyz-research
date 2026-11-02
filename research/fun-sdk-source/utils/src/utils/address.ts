export function formatAddress(address: string): string {
  const leadingChars = 4
  const trailingChars = 4

  return address.length < leadingChars + trailingChars
    ? address
    : `${address.substring(0, leadingChars)}\u2026${address.substring(
        address.length - trailingChars,
      )}`
}

export function formatAddressLastFour(address: string): string {
  const trailingChars = 4
  return address.length < trailingChars
    ? address
    : `\u2026${address.substring(address.length - trailingChars)}`
}

export const truncateMiddleOfAddress = (
  value: string,
  truncateLengthThreshold = 13,
  leadingCharactersCount = 6,
  trailingCharactersCount = 4,
) => {
  if (!value) {
    return 'NA'
  }
  if (value.length < truncateLengthThreshold) {
    return value
  }

  return `${value.slice(0, leadingCharactersCount)}...${value.slice(-trailingCharactersCount)}`
}
