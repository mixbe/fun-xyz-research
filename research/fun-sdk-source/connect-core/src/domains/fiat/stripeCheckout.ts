import type { FiatClientCapability } from '@funkit/api-base'
import { isFiatWriteEndpoint } from '@funkit/api-base'

import { sendAuthedFiatTransition } from '~/domains/fiat/authedTransport'
import { fiatLogRedactor } from '~/domains/fiat/fiatLogRedactor'
import type { IdentityAssertionProvider } from '~/domains/fiat/identityAssertion'
import type { FunLogger } from '~/utils/funLogger'
import { randomUuid } from '~/utils/randomUuid'

export interface CheckoutClientSecretParams {
  apiKey: string
  logger: FunLogger
  clientCapabilities: readonly FiatClientCapability[]
  /** `POST /fiat/orders/{orderId}/checkout`, taken whole from the surface. */
  callbackEndpoint: string
  /** The body key the surface named for the callback id. */
  callbackIdField: string
}

/**
 * One turn of Stripe's `performCheckout` loop, which Stripe re-enters per attempt (a 3DS challenge
 * is another one). One fresh callback id per invocation, stable across transport retries of that
 * same attempt: the backend spends it as the Stripe idempotency key, so a shared one collapses two
 * attempts into one charge and a changing one can double a single attempt.
 *
 * Not a transition: the flow does not advance between attempts.
 */
export async function requestCheckoutClientSecret(
  {
    apiKey,
    logger,
    clientCapabilities,
    callbackEndpoint,
    callbackIdField,
  }: CheckoutClientSecretParams,
  identityAssertionProvider: IdentityAssertionProvider | undefined,
): Promise<string> {
  if (!isFiatWriteEndpoint(callbackEndpoint)) {
    throw new Error(
      `fiat checkout callback is not a write: ${callbackEndpoint}`,
    )
  }
  const callbackId = randomUuid()
  const response = await sendAuthedFiatTransition<{ clientSecret: string }>(
    {
      apiKey,
      logger,
      clientCapabilities,
      redactBodyForLog: fiatLogRedactor(logger),
      params: {
        endpoint: callbackEndpoint,
        body: { [callbackIdField]: callbackId },
        idempotencyKey: callbackId,
      },
    },
    identityAssertionProvider,
  )
  if (
    typeof response?.clientSecret !== 'string' ||
    response.clientSecret === ''
  ) {
    throw new Error('fiat checkout callback returned no client secret')
  }
  return response.clientSecret
}
