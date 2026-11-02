import { v4 as uuidv4 } from 'uuid'
import type { Hex } from 'viem'
import { generatePrivateKey as generateRandomPrivateKey } from 'viem/accounts'

import { createUser, getUserUniqueId } from '@funkit/api-base'
import type { EnvOption } from 'src/config'

export const getAuthUniqueId = async (
  authId: string,
  addr = 'NO_ADDRESS',
  skipDBActions = false,
  options?: EnvOption,
) => {
  const authUniqueId =
    (skipDBActions
      ? addr
      : await getUserUniqueId({
          authId,
          apiKey: globalThis.globalEnvOption.apiKey,
          logger: options?.logger,
          signal: options?.signal,
        })) || uuidv4()

  const words = authId.split('###')
  const method = words[0].startsWith('0x') ? 'eoa' : words[0]
  await createUser({
    authId,
    addr,
    method,
    userUniqueId: authUniqueId,
    apiKey: globalThis.globalEnvOption.apiKey,
    logger: options?.logger,
    signal: options?.signal,
  })

  return authUniqueId
}

export const generatePrivateKey = (): Hex => {
  return generateRandomPrivateKey()
}
