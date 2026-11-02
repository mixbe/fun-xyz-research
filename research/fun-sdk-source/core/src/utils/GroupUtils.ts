import {
  type Address,
  type Hex,
  concat,
  decodeAbiParameters,
  keccak256,
} from 'viem'

import type { GroupInfo } from '@funkit/api-base'
import type { EnvOption } from 'src/config'
import { WALLET_CONTRACT_INTERFACE } from '../common'
import type { Chain } from '../data'

export async function getOnChainGroupData(
  groupId: Hex,
  chain: Chain,
  walletAddr: Address,
  options?: EnvOption,
): Promise<GroupInfo> {
  const userAuthContractAddr = await chain.getAddress(
    'userAuthAddress',
    options,
  )
  const groupKey = keccak256(concat([groupId, userAuthContractAddr]))

  let storedGroupData: Hex

  try {
    storedGroupData = await WALLET_CONTRACT_INTERFACE.readFromChain(
      walletAddr,
      'getState',
      [groupKey],
      chain,
      options,
    )
  } catch (err) {
    // If contract returns "0x", readFromChain throws
    if (err instanceof Error && err.message.match(/returned no data/)) {
      storedGroupData = '0x'
    } else {
      throw err
    }
  }

  if (storedGroupData === '0x') {
    return {
      memberIds: [],
      threshold: 0,
    }
  }

  const [storedGroup] = decodeAbiParameters(
    [
      {
        type: 'tuple',
        components: [{ type: 'bytes32[]' }, { type: 'uint256' }],
      },
    ],
    storedGroupData,
  )

  return {
    memberIds: storedGroup[0] as Hex[],
    threshold: Number(storedGroup[1]),
  }
}
