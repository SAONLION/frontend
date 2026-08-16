import { useEffect, useState } from 'react'
import { getPendingAction } from '../../api/pendingActions'
import type { PendingActionDetailDTO } from '../../api/types'
import { useSession } from '../session/useSession'

const POLL_INTERVAL_MS = 4_000

export function usePendingActionPolling() {
  const { state } = useSession()
  const [action, setAction] = useState<PendingActionDetailDTO | null>(null)
  const sessionId = state.sessionId

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    const poll = () => {
      getPendingAction(sessionId)
        .then((result) => {
          if (!cancelled) setAction(result.hasAction ? (result.action ?? null) : null)
        })
        .catch((error: unknown) => {
          console.error('대기 중인 팝업 조회에 실패했습니다.', error)
        })
    }

    poll()
    const timer = window.setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [sessionId])

  return { action, clear: () => setAction(null) }
}
