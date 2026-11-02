import { toHex } from 'viem'

export * from './ApiUtils'
export * from './AuthUtils'
export * from './ChainUtils'
export * from './CheckoutUtils'
export * from './PaymasterUtils'
export * from './UserOpUtils'
export * from './TokenUtils'
export * from './WalletUtils'

export const stringify = (object: unknown) => {
  return JSON.stringify(
    object,
    (_, value) => (typeof value === 'bigint' ? toHex(value) : value), // return everything else unchanged
  )
}
