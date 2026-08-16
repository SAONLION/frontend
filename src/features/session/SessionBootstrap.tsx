import { useEffect, type PropsWithChildren } from 'react'
import { createSession } from '../../api/session'
import { SESSION_ACTIONS } from './sessionTypes'
import { useSession } from './useSession'

const DEFAULT_SESSION_LANGUAGE = 'ko'

export function SessionBootstrap({ children }: PropsWithChildren) {
  const { state, dispatch } = useSession()

  useEffect(() => {
    if (state.sessionId) return
    let cancelled = false

    createSession(DEFAULT_SESSION_LANGUAGE)
      .then((result) => {
        if (!cancelled) dispatch({ type: SESSION_ACTIONS.setSessionId, sessionId: result.sessionId })
      })
      .catch((error: unknown) => {
        console.error('세션 생성에 실패했습니다.', error)
      })

    return () => {
      cancelled = true
    }
  }, [dispatch, state.sessionId])

  return children
}
