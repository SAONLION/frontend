import { useCallback, useEffect, useRef, useState } from 'react'
import { getPendingAction } from '../../api/pendingActions'
import type { PendingActionDetailDTO } from '../../api/types'
import { isCustomerFacingBlocker } from './serverBlocker'
import { useSession } from '../session/useSession'

// 서버 Blocker 감지는 약 20초 주기다. 5초 폴링이면 고객 체감 지연을 거의 늘리지 않으면서
// foreground 세션의 조회량을 분당 15회에서 12회로 낮춘다.
const POLL_INTERVAL_MS = 5_000

function actionSignature(action: PendingActionDetailDTO): string {
  // 서버가 "dismissed" 응답을 처리하지 못한 경우 동일 조건을 새 actionId로 다시 만들 수 있다.
  // actionId만 기억하면 그 새 레코드를 곧바로 다시 띄우므로, 고객에게 보이는 개입 단위로 막는다.
  return `${action.blockerType}:${action.productId ?? 'session'}`
}

export function usePendingActionPolling() {
  const { state } = useSession()
  const [action, setAction] = useState<PendingActionDetailDTO | null>(null)
  const sessionId = state.sessionId
  // 응답을 마친 actionId는 다시 띄우지 않는다. 서버가 즉시 소진 처리하지 않아도 중복 노출을 막는다.
  const respondedIds = useRef(new Set<number>())
  // 고객이 아래로 내리거나 바깥을 눌러 거절한 개입은 같은 세션·제품에서 다시 독촉하지 않는다.
  // 서버가 새 actionId를 만들더라도 CB3 시트가 즉시 되살아나는 것을 막는다.
  const dismissedSignatures = useRef(new Set<string>())

  // 종료 세션 복구로 새 세션을 받으면 이전 고객의 거절 상태를 물려주지 않는다.
  useEffect(() => {
    respondedIds.current.clear()
    dismissedSignatures.current.clear()
    setAction(null)
  }, [sessionId])

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
          if (
            !next
            || respondedIds.current.has(next.actionId)
            || dismissedSignatures.current.has(actionSignature(next))
            || !isCustomerFacingBlocker(next.blockerType, next.ruleGroup)
          ) {
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

  const dismiss = useCallback((dismissedAction: PendingActionDetailDTO) => {
    dismissedSignatures.current.add(actionSignature(dismissedAction))
    respondedIds.current.add(dismissedAction.actionId)
    setAction(null)
  }, [])

  return { action, clear, dismiss }
}
