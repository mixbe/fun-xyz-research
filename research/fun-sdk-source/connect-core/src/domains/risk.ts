import {
  type FunAddress,
  type RiskValues,
  type SolanaAddress,
  getRiskAssessmentForAddress,
} from '@funkit/api-base'
import { SOLANA_MAINNET_CHAIN_ID, isLighterChainId } from '@funkit/chains'
import type { FunLogger } from '../utils/funLogger'

/** Chainalysis levels that block outright. */
export const BLOCKED_RISK_LEVELS: readonly RiskValues[] = ['Severe', 'High']

/** `null` — slot not screened. `undefined` — screened, no level came back. */
type ScreenedRisk = RiskValues | null | undefined

export interface AddressRiskScreening {
  isRisky: boolean
  /** Positional `[sender, recipient, solanaSender]`, as reported to the risk monitor. */
  risks: [ScreenedRisk, ScreenedRisk, ScreenedRisk]
}

/**
 * Determine whether the chainId is screenable.
 * Filter out the chainId for Lighter chain because address can be the lighter account index
 */
function screenableChainId(chainId?: string): string | undefined {
  return isLighterChainId(chainId) ? undefined : chainId
}

/**
 * Screen up to three addresses against Chainalysis — the one implementation
 * behind web's `hasRisk` and both withdrawal rails.
 *
 * - Blocks only on an explicit `Severe`/`High`; an unscreened address passes.
 * - Request failures propagate; both rails block on the error state.
 * - Checkout screens every connected wallet plus an optional custom recipient:
 *   a blocked wallet blocks the checkout whichever one ends up paying.
 *   Withdrawal screens the recipient only, leaving the sender slots empty.
 */
export async function screenAddressesForRisk({
  senderAddress,
  solanaSenderAddress,
  recipientAddress,
  apiKey,
  logger,
  screeningDisabled = false,
  senderChainId,
  recipientChainId,
}: {
  senderAddress?: string
  /** Screened on Solana mainnet, so it needs no chain id of its own. */
  solanaSenderAddress?: SolanaAddress
  recipientAddress?: string
  apiKey: string
  logger: FunLogger
  /** The `disable-frontend-chainalysis` kill switch, resolved by the caller. */
  screeningDisabled?: boolean
  /**
   * Internal decimal chain ids. Lighter's is dropped before the request — see
   * `screenableChainId`.
   */
  senderChainId?: string
  recipientChainId?: string
}): Promise<AddressRiskScreening> {
  if (screeningDisabled) {
    return { isRisky: false, risks: [null, null, null] }
  }

  const getAddressRisk = (address?: string, chainId?: string) =>
    address
      ? getRiskAssessmentForAddress({
          address: address as FunAddress,
          chainId: screenableChainId(chainId),
          apiKey,
          logger,
        }).then((assessment) => assessment?.risk)
      : null

  const risks = await Promise.all([
    getAddressRisk(senderAddress, senderChainId),
    getAddressRisk(recipientAddress, recipientChainId),
    getAddressRisk(solanaSenderAddress, String(SOLANA_MAINNET_CHAIN_ID)),
  ] as const)

  const isRisky = risks.some((risk) =>
    risk ? BLOCKED_RISK_LEVELS.includes(risk) : false,
  )

  // Datadog monitor: https://app.datadoghq.com/monitors/156257587
  // Field names are web's — renaming them blinds the monitor.
  logger.log('riskAssessment_isCheckoutRisky', {
    isCheckoutRisky: isRisky,
    addressRisks: risks,
    walletAddress: senderAddress,
    solanaWalletAddress: solanaSenderAddress,
    customRecipient: recipientAddress,
  })

  return { isRisky, risks }
}
