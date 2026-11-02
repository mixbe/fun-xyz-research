import type { FiatClientCapability } from '@funkit/api-base'
import { sendAuthedFiatTransition } from '~/domains/fiat/authedTransport'
import { fiatLogRedactor } from '~/domains/fiat/fiatLogRedactor'
import type { IdentityAssertionProvider } from '~/domains/fiat/identityAssertion'
import type { FunLogger } from '~/utils/funLogger'
import { randomUuid } from '~/utils/randomUuid'

export const TERMS_ACCEPTANCE_ENDPOINT = 'POST /fiat/terms-acceptances' as const

export interface RecordTermsAcceptanceParams {
  apiKey: string
  logger: FunLogger
  clientCapabilities: readonly FiatClientCapability[]
  quoteRef: string
  /** The revision the backend publishes for the copy the user read. */
  version: string
  /** The language the copy was shown in, so the backend records those words. */
  locale?: string
  /** When the user tapped, not when the request is sent. */
  acceptedAt: Date
}

/**
 * Records a terms acceptance in the background, for the audit trail only.
 *
 * Returns nothing and never throws: the flow does not wait for it, and a
 * failure is logged and dropped rather than retried or shown to the user.
 */
export function recordTermsAcceptance(
  {
    apiKey,
    logger,
    clientCapabilities,
    quoteRef,
    version,
    locale,
    acceptedAt,
  }: RecordTermsAcceptanceParams,
  identityAssertionProvider: IdentityAssertionProvider | undefined,
): void {
  void (async () => {
    try {
      await sendAuthedFiatTransition(
        {
          apiKey,
          logger,
          clientCapabilities,
          redactBodyForLog: fiatLogRedactor(logger),
          params: {
            endpoint: TERMS_ACCEPTANCE_ENDPOINT,
            body: {
              quoteRef,
              ...(locale === undefined ? {} : { locale }),
              termsAcceptance: {
                version,
                acceptedAt: acceptedAt.toISOString(),
              },
            },
            idempotencyKey: randomUuid(),
          },
        },
        identityAssertionProvider,
      )
    } catch (caught) {
      logger.warn('connect-core:fiat:terms_acceptance_not_recorded', {
        version,
        cause: caught instanceof Error ? caught.message : 'unknown',
      })
    }
  })()
}
