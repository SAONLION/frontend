import { useCallback, useEffect, useRef, useState } from 'react'
import { completeStaffCall, getStaffCallBoard } from '../../api/staffCallBoard'
import { ApiError } from '../../api/client'
import type { StaffCallBoardItem } from '../../api/types'
import type { AdminCallCardData, AdminQueueState } from './adminCallQueueTypes'

const POLL_INTERVAL_MS = 4_000

type QueueSnapshot = {
  completed: AdminCallCardData[]
  error: boolean
  expired: AdminCallCardData[]
  loading: boolean
  waiting: AdminCallCardData[]
}

function toCardData(call: StaffCallBoardItem): AdminCallCardData {
  return {
    callId: call.callId,
    color: call.color || null,
    customerName: call.nickname,
    productName: call.productName || null,
    requestReason: call.reason,
    sessionCode: call.sessionId.slice(-5).toUpperCase(),
  }
}

function getQueueState(calls: readonly AdminCallCardData[], snapshot: QueueSnapshot): AdminQueueState {
  if (snapshot.loading) return 'loading'
  if (snapshot.error) return 'error'
  return calls.length === 0 ? 'empty' : 'ready'
}

export function useAdminCallBoard(staffToken: string | null, onAuthenticationFailed: () => void) {
  // `expired`는 서버 계약이 추가되기 전까지 빈 칸으로 노출한다. 이후 Swagger의 expired 배열을 여기에 연결한다.
  const [snapshot, setSnapshot] = useState<QueueSnapshot>({ completed: [], error: false, expired: [], loading: true, waiting: [] })
  const [completingCallId, setCompletingCallId] = useState<number | null>(null)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    if (!staffToken) return
    try {
      const board = await getStaffCallBoard(staffToken)
      if (!mountedRef.current) return
      setSnapshot({
        completed: board.completed.map(toCardData),
        error: false,
        expired: [],
        loading: false,
        waiting: board.waiting.map(toCardData),
      })
    } catch (error: unknown) {
      console.error('SA 호출 보드를 불러오지 못했습니다.', error)
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        onAuthenticationFailed()
        return
      }
      if (mountedRef.current) {
        setSnapshot((current) => ({ ...current, error: true, loading: false }))
      }
    }
  }, [onAuthenticationFailed, staffToken])

  useEffect(() => {
    mountedRef.current = true
    if (!staffToken) return
    void refresh()

    const poll = () => {
      if (!document.hidden) void refresh()
    }
    const intervalId = window.setInterval(poll, POLL_INTERVAL_MS)
    document.addEventListener('visibilitychange', poll)

    return () => {
      mountedRef.current = false
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', poll)
    }
  }, [refresh, staffToken])

  const complete = useCallback(async (callId: number) => {
    if (!staffToken || completingCallId !== null) return
    setCompletingCallId(callId)
    try {
      await completeStaffCall(staffToken, callId)
      await refresh()
    } catch (error: unknown) {
      console.error('SA 호출 완료 처리에 실패했습니다.', error)
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        onAuthenticationFailed()
        return
      }
      if (mountedRef.current) {
        setSnapshot((current) => ({ ...current, error: true }))
      }
    } finally {
      if (mountedRef.current) setCompletingCallId(null)
    }
  }, [completingCallId, onAuthenticationFailed, refresh, staffToken])

  return {
    completed: snapshot.completed,
    completedState: getQueueState(snapshot.completed, snapshot),
    completingCallId,
    complete,
    expired: snapshot.expired,
    expiredState: getQueueState(snapshot.expired, snapshot),
    refresh,
    waiting: snapshot.waiting,
    waitingState: getQueueState(snapshot.waiting, snapshot),
  }
}
