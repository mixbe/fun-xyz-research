import { safeParseJson } from './json'

export type DeepPartial<T> = T extends
  | number
  | string
  | boolean
  | null
  | undefined
  ? T
  : {
      [P in keyof T]?: DeepPartial<T[P]>
    }

function deepClone<T extends object>(obj: T): T {
  const parsed = safeParseJson<T>(JSON.stringify(obj))

  if (parsed === null) {
    throw new Error('Failed to deep clone object')
  }

  return parsed
}

/** NOTE: merging arrays is undefined behavior */
export function deepMerge<T extends object>(
  origin: T,
  ...objects: DeepPartial<T>[]
): T {
  const target = deepClone(origin) as T

  for (const obj of objects) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        if (Array.isArray(value)) {
          // @ts-expect-error
          target[key] = value
        } else if (typeof value === 'object' && value !== null) {
          // @ts-expect-error
          target[key] = deepMerge(target[key], value)
        } else {
          // @ts-expect-error
          target[key] = value
        }
      }
    }
  }

  return target
}
