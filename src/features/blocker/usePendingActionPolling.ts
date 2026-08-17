import { useCallback, useEffect, useRef, useState } from 'react'
import { getPendingAction } from '../../api/pendingActions'
import type { PendingActionDetailDTO } from '../../api/types'
import { isCustomerFacingBlocker } from './serverBlocker'
import { useSession } from '../session/useSession'

const POLL_INTERVAL_MS = 4_000

export function usePendingActionPolling() {
  const { state } = useSession()
  const [action, setAction] = useState<PendingActionDetailDTO | null>(null)
  const sessionId = state.sessionId
  // 응답을 마친 actionId는 다시 띄우지 않는다. 서버가 즉시 소진 처리하지 않아도 중복 노출을 막는다.
  const respondedIds = useRef(new Set<number>())

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    const poll = () => {
      // 화면이 가려져 있으면 굳이 묻지 않는다. 세션 내내 도는 폴링이라 실기기 배터리에 영향이 크다.
      if (document.hidden) return
      getPendingAction(sessionId)
        .then((result) => {
          if (cancelled) return
          const next = result.hasAction ? (result.action ?? null) : null
          if (!next || respondedIds.current.has(next.actionId) || !isCustomerFacingBlocker(next.blockerType)) {
            setAction(null)
            return
          }
          setAction((current) => (current?.actionId === next.actionId ? current : next))
        })
        .catch((error: unknown) => {
          console.error('대기 중인 팝업 조회에 실패했습니다.', error)
        })
    }

    poll()
    const timer = window.setInterval(poll, POLL_INTERVAL_MS)
    document.addEventListener('visibilitychange', poll)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', poll)
    }
  }, [sessionId])

  const clear = useCallback((actionId: number) => {
    respondedIds.current.add(actionId)
    setAction(null)
  }, [])

  return { action, clear }
}
