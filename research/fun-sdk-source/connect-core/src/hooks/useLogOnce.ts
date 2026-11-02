import { useEffect, useRef } from 'react'
import { useEffectEvent } from './useEffectEvent'

/**
 * Runs `onLog` once per distinct `key`, skipping re-renders that repeat the
 * same key and skipping entirely while `key` is `undefined`. Replaces the
 * copy-pasted `useRef` + `useEffect` dedupe-logging block that kept
 * reappearing across withdrawal flows.
 */
export function useLogOnce(key: string | undefined, onLog: () => void): void {
  const loggedKeyRef = useRef<string | undefined>(undefined)
  const onLogEvent = useEffectEvent(onLog)

  useEffect(() => {
    if (key === undefined || loggedKeyRef.current === key) {
      return
    }
    loggedKeyRef.current = key
    onLogEvent()
  }, [key])
}
