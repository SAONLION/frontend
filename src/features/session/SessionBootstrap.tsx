import { useEffect, useRef, type PropsWithChildren } from 'react'
import { setSessionEndedHandler } from '../../api/client'
import { createSession } from '../../api/session'
import { clearDegraded, DEGRADATION_KEYS, markDegraded } from '../degradation/degradationStore'
import { recoverFromEndedSession, subscribeSessionReissued } from './endedSessionRecovery'
import {
  clearStoredProductContext,
  getStoredProductContext,
  getStoredSessionId,
  setStoredProductContext,
  setStoredSessionId,
} from './sessionStorage'
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
        clearDegraded(DEGRADATION_KEYS.session)
        setStoredSessionId(result.sessionId)
        dispatch({ type: SESSION_ACTIONS.setSessionId, sessionId: result.sessionId })
      })
      .catch((error: unknown) => {
        console.error('세션 생성에 실패했습니다.', error)
        // 세션이 없으면 이후 모든 서버 기록이 조용히 건너뛰어진다. 그 사실을 화면에 드러낸다.
        markDegraded(DEGRADATION_KEYS.session)
      })

    return () => {
      cancelled = true
    }
  }, [dispatch, state.sessionId])

  /**
   * 종료된 세션을 새 세션으로 갈아끼운다.
   *
   * 404(세션 없음)는 B1에서만 잡는데, **409(세션 종료)는 어느 화면에서든 나온다.**
   * 종료 세션도 읽기는 200이라 B1의 404 경로로는 빠져나올 수 없어 여기서 전역으로 받는다.
   */
  useEffect(() => {
    setSessionEndedHandler(recoverFromEndedSession)
    const unsubscribe = subscribeSessionReissued((sessionId) => {
      dispatch({ type: SESSION_ACTIONS.setSessionId, sessionId })
    })

    return () => {
      setSessionEndedHandler(null)
      unsubscribe()
    }
  }, [dispatch])

  // 새로고침·앱 전환 뒤 서버 제품 식별자를 되돌린다. 세션이 바뀌었으면 이전 문맥은 버린다.
  const restored = useRef(false)
  useEffect(() => {
    if (restored.current || !state.sessionId) return
    restored.current = true

    const stored = getStoredProductContext()
    if (!stored) return

    if (stored.sessionId !== state.sessionId) {
      clearStoredProductContext()
      return
    }

    dispatch({
      type: SESSION_ACTIONS.restoreProductContext,
      productId: stored.productId,
      currentSkuId: stored.currentSkuId,
      currentSku: stored.currentSku,
    })
  }, [dispatch, state.sessionId])

  // 복구를 시도한 뒤부터 저장한다. 복구 전에 쓰면 빈 초기 상태가 저장된 문맥을 덮어쓴다.
  useEffect(() => {
    if (!restored.current || !state.sessionId) return
    if (state.productId === null && state.currentSkuId === null) return

    setStoredProductContext({
      sessionId: state.sessionId,
      productId: state.productId,
      currentSkuId: state.currentSkuId,
      currentSku: state.currentSku,
    })
  }, [state.currentSku, state.currentSkuId, state.productId, state.sessionId])

  return children
}
