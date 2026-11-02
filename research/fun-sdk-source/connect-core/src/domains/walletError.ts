import { isSwitchChainError } from '../utils/signature'

/**
 * Why a wallet failed to execute, in terms a user can act on. Deposits and
 * withdrawals fail these two ways alike, hence no flow in the name.
 *
 * The classifying half of web's `toCheckoutConfirmationError`, which itself
 * can't be shared: it returns JSX, takes a wagmi `Config`, and probes the chain
 * to tell an out-of-gas revert from a plain one. What is platform-agnostic is
 * *which* failure this is — so that lives here and each SDK supplies its own
 * copy for the code.
 *
 * An unrecognised error is `generic` on purpose: a provider or RPC string is
 * for the logs and the host, never for the screen.
 */
export type WalletExecutionErrorCode =
  | 'insufficient-gas'
  | 'switch-chain'
  | 'generic'

// Intrinsic gas too low or an insufficient balance for gas, neither of which
// reaches the chain.
const INSUFFICIENT_GAS_RE =
  /gas too low|insufficient funds|exceeds the balance of the account/i

export function toWalletExecutionErrorCode(
  error: unknown,
): WalletExecutionErrorCode {
  if (isSwitchChainError(error)) {
    return 'switch-chain'
  }
  if (error instanceof Error && INSUFFICIENT_GAS_RE.test(error.message)) {
    return 'insufficient-gas'
  }
  return 'generic'
}
