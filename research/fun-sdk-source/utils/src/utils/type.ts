export const isRecord = (x: unknown): x is Record<string, unknown> => {
  return typeof x === 'object' && x !== null
}

export function isNumericString(value: string): value is `${number}` {
  return /^\d+$/.test(value)
}
