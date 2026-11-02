import {
  type FiatClientCapability,
  isFiatAuthenticationError,
  sendFiatTransition,
} from '@funkit/api-base'

import type { FunLogger } from '~/utils/funLogger'

import type { IdentityAssertionProvider } from './identityAssertion'

type TransportArgs = Parameters<typeof sendFiatTransition>[0]

/** For a flow whose host declares nothing, which every flow but connect-rn's Stripe one is. */
export const NO_CLIENT_CAPABILITIES: readonly FiatClientCapability[] = []

/**
 * Sends a fiat transition, retrying once with a fresh identity assertion.
 *
 * Once, and only on an authentication error. Assertions are short lived, so
 * one expiring mid-request is ordinary and should not reach the user. Past a
 * single retry it is no longer an expiry but a rejected identity, and looping
 * on that hammers the host's mint endpoint while the user waits for a failure
 * that will not change.
 */
export async function sendAuthedFiatTransition<T>(
  args: Omit<TransportArgs, 'getIdentityAssertion' | 'checkoutId'> & {
    logger: TransportArgs['logger'] & Partial<Pick<FunLogger, 'getTraceId'>>
    /** Required so no request of a flow drops it: the server would answer that one as a client without them. */
    clientCapabilities: readonly FiatClientCapability[]
  },
  identityAssertionProvider: IdentityAssertionProvider | undefined,
): Promise<T> {
  // connect-rn sets each flow's trace id to its checkout id. Read once so the
  // retry keeps this request's id even if another flow opened meanwhile.
  const sendArgs = {
    ...args,
    checkoutId: args.logger.getTraceId?.() ?? undefined,
  }
  if (identityAssertionProvider === undefined) {
    return sendFiatTransition<T>(sendArgs)
  }
  let sentWith: string | undefined
  // One deadline for both attempts: the refresh retry gets what is left, not a new budget.
  const deadline =
    args.timeoutMs === undefined ? undefined : Date.now() + args.timeoutMs
  const send = () =>
    sendFiatTransition<T>({
      ...sendArgs,
      ...(deadline === undefined
        ? {}
        : { timeoutMs: Math.max(deadline - Date.now(), 0) }),
      getIdentityAssertion: async () => {
        sentWith = await identityAssertionProvider.get()
        return sentWith
      },
    })
  try {
    return await send()
  } catch (error) {
    if (!isFiatAuthenticationError(error)) {
      throw error
    }
    // A host minting short-lived or rejected tokens otherwise shows up only
    // as quietly doubled fiat traffic.
    args.logger.info('connect-core:fiat:identity_assertion_refreshed', {
      endpoint: args.params.endpoint,
    })
    identityAssertionProvider.invalidate()
  }
  try {
    return await send()
  } catch (error) {
    if (isFiatAuthenticationError(error) && sentWith !== undefined) {
      identityAssertionProvider.reject?.(sentWith)
    }
    throw error
  }
}
