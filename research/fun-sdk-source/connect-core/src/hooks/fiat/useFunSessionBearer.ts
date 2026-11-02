import { useCallback, useSyncExternalStore } from 'react'

import type { FunSessionStore } from '~/domains/fiat/funSession'
import type { IdentityAssertionProvider } from '~/domains/fiat/identityAssertion'

const NO_SUBSCRIPTION = () => () => {}

/** Whether Fun's login holds a session now; re-renders when one starts or ends. */
export function useHasFunSession(
  funSession: FunSessionStore | undefined,
): boolean {
  const subscribe = useCallback(
    (onChange: () => void) =>
      funSession === undefined
        ? NO_SUBSCRIPTION()
        : funSession.subscribe(onChange),
    [funSession],
  )
  const snapshot = () => funSession?.current() !== undefined
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

/**
 * The Bearer a Fun-login host's `/fiat/*` calls send: the session store's provider while a session
 * is held, which refreshes near expiry and once more after a 401; `undefined` until then, so the
 * call goes anonymous and the server can ask for the email.
 */
export function useFunSessionBearer(
  funSession: FunSessionStore | undefined,
): IdentityAssertionProvider | undefined {
  const hasFunSession = useHasFunSession(funSession)
  return hasFunSession ? funSession?.provider : undefined
}
