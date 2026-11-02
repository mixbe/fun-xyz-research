import { isAddressEquivalent } from '@funkit/utils'
import type { DynamicConfigValue } from '../hooks/statsig/useDynamicConfig'
import type { FunLogger } from '../utils/funLogger'
import { type AddressRiskScreening, screenAddressesForRisk } from './risk'

// Recipient-address safety for withdrawals: the operator blacklist and the
// Chainalysis risk assessment. Callers pass resolved Statsig values in, so this
// stays framework-free. Both checks block; the risk one blocks on a failed
// request, but an address the service returns no level for passes (ENG-5051).

/**
 * Is this recipient blocked? Two sources, both from Statsig:
 * - `blacklistedwithdrawaladdress` — operator-curated recipient blocks.
 * - every asset address in `withdrawalconfig` — sending a withdrawal *to* a
 *   token contract burns the funds, so token addresses are never valid
 *   recipients.
 */
export function isBlacklistedWithdrawalAddress({
  address,
  blacklist,
  withdrawalConfig,
}: {
  address: string
  /** Raw `blacklistedwithdrawaladdress` config — its KEYS are the addresses. */
  blacklist?: Record<string, unknown>
  /**
   * Raw `withdrawalconfig` config. Typed from the generated Statsig defaults,
   * but the runtime value is unchecked JSON, hence the shape guards below.
   */
  withdrawalConfig?: Partial<DynamicConfigValue<'withdrawalconfig'>>
}): boolean {
  if (!address) {
    return false
  }

  const blocked = Object.keys(blacklist ?? {})
  const chains = withdrawalConfig?.chains
  if (Array.isArray(chains)) {
    for (const chain of chains) {
      const assets = chain?.assets
      if (!Array.isArray(assets)) {
        continue
      }
      for (const asset of assets) {
        if (asset?.address) {
          blocked.push(asset.address)
        }
      }
    }
  }

  return blocked.some((blockedAddress) =>
    isAddressEquivalent({
      firstAddress: blockedAddress,
      secondAddress: address,
    }),
  )
}

/**
 * Screen a withdrawal recipient against Chainalysis. `true` blocks.
 *
 * - A failed request throws; callers require `isRisky === false`, so in-flight
 *   and errored both hold the CTA.
 * - Skip this for addresses incompatible with the destination chain (see
 *   `isAddressCompatibleWithChain`) — they can't be screened meaningfully.
 */
export async function isWithdrawalRisky({
  address,
  apiKey,
  logger,
  screeningDisabled = false,
  chainId,
}: {
  address: string
  apiKey: string
  logger: FunLogger
  /** The `disable-frontend-chainalysis` gate, resolved by the caller. */
  screeningDisabled?: boolean
  /** Internal decimal chain id of the withdrawal's destination chain. */
  chainId?: string
}): Promise<boolean> {
  let screening: AddressRiskScreening
  try {
    screening = await screenAddressesForRisk({
      recipientAddress: address,
      recipientChainId: chainId,
      apiKey,
      logger,
      screeningDisabled,
    })
  } catch (error) {
    // Gave-up failure, not a recovered one: the CTA stays blocked from here.
    logger.error('withdrawal:riskCheckFailed', error, {
      recipientAddress: address,
    })
    throw error
  }

  if (screening.isRisky) {
    logger.warn('withdrawal:riskyAddressDetected', {
      recipientAddress: address,
      risk: screening.risks[1],
    })
  }
  return screening.isRisky
}
