import { useEffect, useState } from 'react'

/**
 * `value` after it has stopped changing for `delayMs`, plus whether it has
 * settled. The flag matters as much as the value: it lets a caller hold off
 * work mid-typing rather than firing on an amount the user is still editing.
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number,
): { debounced: T; isSettled: boolean } {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    if (value === debounced) {
      return
    }
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, debounced, delayMs])

  return { debounced, isSettled: debounced === value }
}
