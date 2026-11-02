import { API_BASE_URL } from '../../consts'
import { sendPostRequest } from '../../utils'
import type { AddPaymasterTransactionRequest } from './types'

export async function addTransaction({
  chainId,
  timestamp,
  txid,
  transaction,
  paymasterType,
  sponsorAddress,
  ...options
}: AddPaymasterTransactionRequest): Promise<unknown> {
  return await sendPostRequest({
    uri: `${API_BASE_URL}/dashboard/paymasters/add-transaction`,
    body: {
      chain: chainId,
      sponsorAddress,
      type: paymasterType,
      timestamp,
      transaction,
      txid,
    },
    ...options,
  }).catch(() => {
    /* empty */
  })
}
