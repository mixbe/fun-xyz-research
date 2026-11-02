import type { FiatClientCapability } from '@funkit/api-base'
import { isFiatWriteEndpoint } from '@funkit/api-base'

import { sendAuthedFiatTransition } from '~/domains/fiat/authedTransport'
import { fiatLogRedactor } from '~/domains/fiat/fiatLogRedactor'
import type { IdentityAssertionProvider } from '~/domains/fiat/identityAssertion'
import { kycSdkFailed } from '~/domains/fiat/kycSdkResult'
import type { SurfaceTransition } from '~/domains/fiat/selectTransitions'
import { assembleBody } from '~/domains/fiat/submitBody'
import type { FunLogger } from '~/utils/funLogger'
import { randomUuid } from '~/utils/randomUuid'

export interface RecordKycSdkFailureParams {
  apiKey: string
  logger: FunLogger
  clientCapabilities: readonly FiatClientCapability[]
  transition: SurfaceTransition
  errorType: string
}

/**
 * Tells the backend an identity SDK ended without a submission.
 * - Fire and forget: the backend re-reads the standing, so its answer would only re-present the
 *   same capture, and the screen already owns recovery.
 */
export function recordKycSdkFailure(
  {
    apiKey,
    logger,
    clientCapabilities,
    transition,
    errorType,
  }: RecordKycSdkFailureParams,
  identityAssertionProvider: IdentityAssertionProvider | undefined,
): void {
  const { endpoint, result } = transition.report
  if (result?.type !== 'KYC_SDK_RESULT' || !isFiatWriteEndpoint(endpoint)) {
    return
  }
  const failure = kycSdkFailed(errorType)
  void (async () => {
    try {
      const body = assembleBody({ transition, surfaceResult: failure })
      await sendAuthedFiatTransition(
        {
          apiKey,
          logger,
          clientCapabilities,
          redactBodyForLog: fiatLogRedactor(logger),
          params: {
            endpoint,
            ...(body === undefined ? {} : { body }),
            idempotencyKey: randomUuid(),
          },
        },
        identityAssertionProvider,
      )
    } catch (caught) {
      logger.warn('connect-core:fiat:kyc_sdk_failure_not_recorded', {
        errorType: failure.errorType,
        cause: caught instanceof Error ? caught.message : 'unknown',
      })
    }
  })()
}
