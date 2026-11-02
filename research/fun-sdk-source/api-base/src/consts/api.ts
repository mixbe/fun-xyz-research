declare const process: {
  env: Record<string, string | undefined>
}

export const API_BASE_URL = process.env.API_BASE_URL || 'https://api.fun.xyz/v1'

export const FROG_API_BASE_URL =
  process.env.FROG_API_BASE_URL || 'https://frog.fun.xyz'
