import { useEffect, type PropsWithChildren } from 'react'
import { createSession } from '../../api/session'
import { getStoredSessionId, setStoredSessionId } from './sessionStorage'
import { SESSION_ACTIONS } from './sessionTypes'
import { useSession } from './useSession'

const DEFAULT_SESSION_LANGUAGE = 'ko'

export function SessionBootstrap({ children }: PropsWithChildren) {
  const { state, dispatch } = useSession()

  useEffect(() => {
    if (state.sessionId) return

    // 기존 세션이 있으면 재사용한다 — 여기서 다시 세션을 만들면 이전 세션과의 연결이 전부 끊긴다.
    const storedSessionId = getStoredSessionId()
    if (storedSessionId) {
      dispatch({ type: SESSION_ACTIONS.setSessionId, sessionId: storedSessionId })
      return
    }

    let cancelled = false

    createSession(DEFAULT_SESSION_LANGUAGE)
      .then((result) => {
        if (cancelled) return
        setStoredSessionId(result.sessionId)
        dispatch({ type: SESSION_ACTIONS.setSessionId, sessionId: result.sessionId })
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
