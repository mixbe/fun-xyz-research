/**
 * EIP-55 casing is only a checksum, so two spellings of one EVM address are
 * the same address.
 */
function isEVMAddressEquivalent({
  firstAddress,
  secondAddress,
}: {
  firstAddress: string
  secondAddress: string
}) {
  return (
    String(firstAddress).toLowerCase() === String(secondAddress).toLowerCase()
  )
}

/**
 * Base58 is case-significant, so two Solana addresses differing only in case
 * are two different accounts.
 */
function isSVMAddressEquivalent({
  firstAddress,
  secondAddress,
}: {
  firstAddress: string
  secondAddress: string
}) {
  return String(firstAddress) === String(secondAddress)
}

/** Base58 has no `0`, so a leading `0x` fully discriminates the two formats. */
function isHexAddress(address: string): boolean {
  return String(address).slice(0, 2).toLowerCase() === '0x'
}

/**
 * Compares two addresses whose format the call site does not fix. Mismatched
 * formats are never equal. EIP-55 casing is only a checksum so hex folds case;
 * base58 is case-significant, so Solana and Tron must match exactly.
 */
export function isAddressEquivalent({
  firstAddress,
  secondAddress,
}: {
  firstAddress: string
  secondAddress: string
}) {
  const first = String(firstAddress)
  const second = String(secondAddress)
  if (isHexAddress(first) !== isHexAddress(second)) {
    return false
  }
  return isHexAddress(first)
    ? isEVMAddressEquivalent({ firstAddress: first, secondAddress: second })
    : isSVMAddressEquivalent({ firstAddress: first, secondAddress: second })
}

export function isTokenEquivalent({
  firstTokenChainId,
  firstTokenAddress,
  secondTokenChainId,
  secondTokenAddress,
}: {
  firstTokenChainId: string
  firstTokenAddress: string
  secondTokenChainId: string
  secondTokenAddress: string
}) {
  return (
    String(firstTokenChainId) === String(secondTokenChainId) &&
    isAddressEquivalent({
      firstAddress: firstTokenAddress,
      secondAddress: secondTokenAddress,
    })
  )
}
