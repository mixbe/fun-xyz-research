export function safeParseJson<T>(
  src?: string,
  onError?: (e: unknown) => void,
): T | null {
  if (!src || src === '{}') {
    return null
  }

  try {
    return JSON.parse(src)
  } catch (e) {
    onError?.(e)
    return null
  }
}

export function safeParseJsonArray<T>(src: string | null): T[] {
  try {
    const value = src ? safeParseJson(src) : []
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export type Serializable =
  | bigint
  | boolean
  | null
  | number
  | string
  | Date
  | object // Should be '{ [key: string]: Serializable }' but helper gets called with loosely-typed 'object' and interfaces
  | Serializable[]

// Captured at module load so a host page that patches `BigInt.prototype.toString`
// can't reach the conversion below.
const bigIntToString = BigInt.prototype.toString

/**
 * Recursively replace bigints with hex strings *before* handing the value to `JSON.stringify`.
 *
 * This cannot be a `JSON.stringify` replacer. Per ECMA-262 `SerializeJSONProperty`, when a value is
 * an Object **or a BigInt** its `toJSON` method is invoked *before* the replacer runs. Host pages —
 * a customer dependency, or more often a browser extension — sometimes define
 * `BigInt.prototype.toJSON` returning `` `${this}n` `` (a widely copy-pasted round-trippable-JSON
 * snippet). In those sessions a replacer only ever sees the already-stringified `"1000000n"`, so
 * `typeof value === 'bigint'` is false and the literal escapes onto the wire, where the API rejects
 * it as a malformed integer. Walking first means we convert real bigints ourselves and never depend
 * on a global we don't own.
 *
 * Objects that own a callable `toJSON` (`Date`, and anything else with custom serialization) are
 * passed through untouched so `JSON.stringify` can apply it — walking their entries instead would
 * flatten a `Date` to `{}`.
 *
 * `ancestors` holds only the path currently being walked, not everything seen: a repeated sibling
 * reference is legal to serialize and must not read as a cycle. Callers do pass cyclic input — React
 * fibers are reachable from analytics metadata — and they rely on the `TypeError` `JSON.stringify`
 * raises for it, so on a real cycle we hand back the original object and let it throw rather than
 * recursing until the stack dies.
 */
function sanitizeBigInts(value: unknown, ancestors: Set<object>): unknown {
  if (typeof value === 'bigint') {
    return `0x${bigIntToString.call(value, 16)}`
  }
  if (value === null || typeof value !== 'object') {
    return value // unchanged
  }
  if (typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    return value
  }
  if (ancestors.has(value)) {
    return value
  }

  ancestors.add(value)
  const sanitized = Array.isArray(value)
    ? value.map((item) => sanitizeBigInts(item, ancestors))
    : Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          sanitizeBigInts(item, ancestors),
        ]),
      )
  ancestors.delete(value)

  return sanitized
}

/** Long enough to identify a patch, short enough not to bloat a log line. */
const TO_JSON_SOURCE_MAX_LENGTH = 300

/**
 * Source of a host page's `BigInt.prototype.toJSON`, or `undefined` when nothing defines one.
 *
 * Nothing in funkit defines it. Where a host page does, `JSON.stringify` calls it ahead of any
 * replacer and quietly rewrites every bigint we serialize — the reason `sanitizeBigInts` exists.
 * Report this so the affected population is measurable rather than inferred: the function's source
 * usually names the library or extension responsible, and the count is what tells us when the
 * backend's tolerance for the corrupted form can be dropped.
 *
 * Read live rather than at module load, since whatever defines it may run after we do.
 */
export function getHostBigIntToJSONSource(): string | undefined {
  const toJSON = (BigInt.prototype as { toJSON?: unknown }).toJSON
  if (typeof toJSON !== 'function') {
    return undefined
  }
  // `Function.prototype.toString` returns a function's source text; `.call(toJSON)` invokes it
  // with the patch as `this`, so we read the source from the pristine built-in rather than via
  // `toJSON.toString()` — which the same code that patched `toJSON` could override to lie about it.
  return Function.prototype.toString
    .call(toJSON)
    .slice(0, TO_JSON_SOURCE_MAX_LENGTH)
}

export function jsonStringifyWithBigIntSanitization(
  serializable: Serializable,
): string {
  return JSON.stringify(sanitizeBigInts(serializable, new Set()))
}
