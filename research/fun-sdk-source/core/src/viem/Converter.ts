import { type WalletClient, createWalletClient, custom, toBytes } from 'viem'
import { type Chain, mainnet } from 'viem/chains'

interface web3ProviderConversionInterface {
  // biome-ignore lint/suspicious/noExplicitAny: <these are actually typed as any on viems side>
  provider: any
  viemChain?: Chain
}

interface web3SignerConversionInterface {
  // biome-ignore lint/suspicious/noExplicitAny: <these are actually typed as any on viems side>
  signer: any
  viemChain?: Chain
}

export const convertProviderToClient = ({
  provider,
  viemChain,
}: web3ProviderConversionInterface): WalletClient => {
  const chain = viemChain ? viemChain : mainnet
  if (typeof provider.request === 'function') {
    return createWalletClient({
      chain,
      transport: custom(provider),
    })
  }
  if (!provider.send) {
    throw new Error("Provider isn't EIP 1193 compliant")
  }
  return createWalletClient({
    chain,
    transport: custom({
      async request({ method, params }) {
        const response = await provider.send(method, params)
        return response
      },
    }),
  })
}

export const convertSignerToClient = ({
  signer,
  viemChain,
}: web3SignerConversionInterface): WalletClient => {
  const chain = viemChain ? viemChain : mainnet
  if (signer.type === 'local') {
    return createWalletClient({
      chain,
      transport: custom(signer),
    })
  }
  return createWalletClient({
    chain,
    transport: custom({
      async request({ method, params }) {
        if (method === 'eth_requestAccounts') {
          return [await signer.getAddress()]
        }
        if (method === 'personal_sign') {
          return await signer.signMessage(toBytes(params[0]))
        }
      },
    }),
  })
}
