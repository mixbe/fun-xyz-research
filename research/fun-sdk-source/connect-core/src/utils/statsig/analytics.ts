/** Stringify flat Statsig metadata and omit nullish values. */
export function toStatsigMetadata(
  payload: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) {
      continue
    }
    result[key] = String(value)
  }
  return result
}
