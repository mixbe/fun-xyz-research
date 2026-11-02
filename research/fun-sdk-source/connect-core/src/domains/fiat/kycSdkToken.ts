import type { FiatClientCapability } from '@funkit/api-base'
import type { FiatStepResponse, Surface } from '@fun-xyz/fiat-contract/types'

import { sendAuthedFiatTransition } from '~/domains/fiat/authedTransport'
import type { IdentityAssertionProvider } from '~/domains/fiat/identityAssertion'
import { fiatLogRedactor } from '~/domains/fiat/fiatLogRedactor'
import type { FunLogger } from '~/utils/funLogger'
import { randomUuid } from '~/utils/randomUuid'

export const KYC_SDK_TOKEN_ENDPOINT = 'POST /fiat/kyc/sdk-token' as const

export interface RenewCaptureSurfaceParams {
  apiKey: string
  logger: FunLogger
  clientCapabilities: readonly FiatClientCapability[]
  quoteRef: string
}

/**
 * A fresh capture surface for a quote already in `KYC{CAPTURE}`.
 *
 * - The one call the response does not drive: the endpoint is declared but
 *   absent from `KYC/CAPTURE`'s `allowedTransitions`, so nothing advertises it.
 * - An SDK token expires in minutes, well inside a document capture, and a
 *   client that cannot renew one strands the user on a dead screen.
 * - Delete this the moment the transition is published.
 */
export async function renewCaptureSurface(
  { apiKey, logger, clientCapabilities, quoteRef }: RenewCaptureSurfaceParams,
  identityAssertionProvider: IdentityAssertionProvider | undefined,
): Promise<Surface | undefined> {
  try {
    const response = await sendAuthedFiatTransition<FiatStepResponse>(
      {
        apiKey,
        logger,
        clientCapabilities,
        redactBodyForLog: fiatLogRedactor(logger),
        params: {
          endpoint: KYC_SDK_TOKEN_ENDPOINT,
          body: { quoteRef },
          idempotencyKey: randomUuid(),
        },
      },
      identityAssertionProvider,
    )
    // The endpoint decides no eligibility, so anything but a capture surface
    // means the flow moved on and the SDK is no longer what to draw.
    const { state } = response
    return state.kind === 'KYC' && state.phase === 'CAPTURE'
      ? state.surface
      : undefined
  } catch (caught) {
    // Never the params: every key in them is a secret.
    logger.warn('connect-core:fiat:kyc_sdk_token_failed', {
      cause: caught instanceof Error ? caught.message : 'unknown',
    })
    return undefined
  }
}
