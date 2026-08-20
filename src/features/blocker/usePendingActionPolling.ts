import { useCallback, useEffect, useRef, useState } from 'react'
import { getPendingAction } from '../../api/pendingActions'
import type { PendingActionDetailDTO } from '../../api/types'
import { isCustomerFacingBlocker, toCustomerBlockerCode } from './serverBlocker'
import {
  getStoredBlockerExposureGroups,
  setStoredBlockerExposureGroups,
  type BlockerExposureGroup,
} from '../session/sessionStorage'
import { useSession } from '../session/useSession'

// 서버 Blocker 감지는 약 20초 주기다. 5초 폴링이면 고객 체감 지연을 거의 늘리지 않으면서
// foreground 세션의 조회량을 분당 15회에서 12회로 낮춘다.
const POLL_INTERVAL_MS = 5_000

const MAX_EXPOSURES_BY_GROUP: Readonly<Record<BlockerExposureGroup, number>> = {
  CB3: 1,
  CB56: 2,
}

function actionSignature(action: PendingActionDetailDTO): string {
  // 서버가 "dismissed" 응답을 처리하지 못한 경우 동일 조건을 새 actionId로 다시 만들 수 있다.
  // actionId만 기억하면 그 새 레코드를 곧바로 다시 띄우므로, 고객에게 보이는 개입 단위로 막는다.
  return `${action.blockerType}:${action.productId ?? 'session'}`
}

function toExposureGroup(action: PendingActionDetailDTO): BlockerExposureGroup | null {
  const code = toCustomerBlockerCode(action.blockerType, action.ruleGroup)
  if (!code) return null
  // CB5·CB6은 고객에게 같은 콘텐츠 제안 시트(F23-1)로 노출되므로 2회 cap을 공유한다.
  return code === 'CB3' ? 'CB3' : 'CB56'
}

export function usePendingActionPolling(isEnabled: boolean) {
  const { state } = useSession()
  const [action, setAction] = useState<PendingActionDetailDTO | null>(null)
  const sessionId = state.sessionId
  // 응답을 마친 actionId는 다시 띄우지 않는다. 서버가 즉시 소진 처리하지 않아도 중복 노출을 막는다.
  const respondedIds = useRef(new Set<number>())
  // 고객이 아래로 내리거나 바깥을 눌러 거절한 개입은 같은 세션·제품에서 다시 독촉하지 않는다.
  // 서버가 새 actionId를 만들더라도 CB3 시트가 즉시 되살아나는 것을 막는다.
  const dismissedSignatures = useRef(new Set<string>())
  // 새로고침 뒤에도 같은 서버 세션이면 이미 노출한 개입을 다시 보이지 않게 한다.
  const exposureCounts = useRef<Map<BlockerExposureGroup, number>>(new Map())
  // 시트가 떠 있는 동안의 다음 폴링은 현재 시트를 닫거나 다른 action으로 교체하면 안 된다.
  const visibleActionId = useRef<number | null>(null)

  // 종료 세션 복구로 새 세션을 받으면 이전 고객의 거절 상태를 물려주지 않는다.
  useEffect(() => {
    respondedIds.current.clear()
    dismissedSignatures.current.clear()
    exposureCounts.current = sessionId ? new Map(getStoredBlockerExposureGroups(sessionId)) : new Map()
    visibleActionId.current = null
    setAction(null)
  }, [sessionId])

  useEffect(() => {
    if (!sessionId || !isEnabled) {
      visibleActionId.current = null
      setAction(null)
      return
    }
    let cancelled = false

    const poll = () => {
      // 화면이 가려져 있으면 굳이 묻지 않는다. 세션 내내 도는 폴링이라 실기기 배터리에 영향이 크다.
      if (document.hidden) return
      getPendingAction(sessionId)
        .then((result) => {
          if (cancelled) return
          const next = result.hasAction ? (result.action ?? null) : null
          if (visibleActionId.current !== null) {
            // 고객이 응답하기 전에는 서버의 다음 폴링 결과로 열린 시트를 바꾸지 않는다.
            return
          }
          const exposureGroup = next ? toExposureGroup(next) : null
          if (
            !next
            || respondedIds.current.has(next.actionId)
            || dismissedSignatures.current.has(actionSignature(next))
            || !isCustomerFacingBlocker(next.blockerType, next.ruleGroup)
            || exposureGroup === null
            || (exposureCounts.current.get(exposureGroup) ?? 0) >= MAX_EXPOSURES_BY_GROUP[exposureGroup]
          ) {
            setAction(null)
            return
          }
          exposureCounts.current.set(exposureGroup, (exposureCounts.current.get(exposureGroup) ?? 0) + 1)
          setStoredBlockerExposureGroups(sessionId, exposureCounts.current)
          visibleActionId.current = next.actionId
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
  }, [isEnabled, sessionId])

  const clear = useCallback((actionId: number) => {
    respondedIds.current.add(actionId)
    visibleActionId.current = null
    setAction(null)
  }, [])

  const dismiss = useCallback((dismissedAction: PendingActionDetailDTO) => {
    dismissedSignatures.current.add(actionSignature(dismissedAction))
    respondedIds.current.add(dismissedAction.actionId)
    visibleActionId.current = null
    setAction(null)
  }, [])

  return { action, clear, dismiss }
}
