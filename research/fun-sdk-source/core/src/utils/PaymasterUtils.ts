import { PaymasterType } from '@funkit/api-base'
import type { EnvOption } from '../config'

export const getPaymasterType = (txOptions: EnvOption) => {
  if (txOptions.gasSponsor?.useCheckoutSponsor) {
    return PaymasterType.CheckoutSponsor
  }

  if (txOptions.gasSponsor?.sponsorAddress && txOptions.gasSponsor?.token) {
    return PaymasterType.TokenSponsor
  }

  if (txOptions.gasSponsor?.sponsorAddress) {
    return PaymasterType.GaslessSponsor
  }

  throw Error('Invalid paymaster type')
}
