import type {
  FiatStepResponse,
  PreparedPayment,
} from '@fun-xyz/fiat-contract/types'

/** The payment surface a quote response prepared, when it carries one. */
export function preparedPaymentOf(
  response: FiatStepResponse | undefined,
): PreparedPayment | undefined {
  return response !== undefined && 'preparedPayment' in response
    ? response.preparedPayment
    : undefined
}
