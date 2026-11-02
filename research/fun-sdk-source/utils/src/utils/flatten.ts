// Implementation of the flatten function
function flatten<
  T extends object,
  R extends Record<string, unknown> = Record<string, unknown>,
>(obj: T, prefix = ''): R {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, flatten(value, newKey))
    } else {
      // Add leaf values (including arrays) directly
      result[newKey] = value
    }
  }

  return result as R
}

export { flatten }
