import { useCallback, useEffect, useRef, useState } from 'react'
import { completeStaffCall, getStaffCallBoard } from '../../api/staffCallBoard'
import type { StaffCallBoardItem } from '../../api/types'
import type { AdminCallCardData, AdminQueueState } from './adminCallQueueTypes'

const POLL_INTERVAL_MS = 4_000

type QueueSnapshot = {
  completed: AdminCallCardData[]
  error: boolean
  loading: boolean
  waiting: AdminCallCardData[]
}

function toCardData(call: StaffCallBoardItem): AdminCallCardData {
  return {
    callId: call.callId,
    customerName: call.nickname,
    productName: call.productName || null,
    requestLabel: call.color ? `${call.reason} · ${call.color}` : call.reason,
  }
}

function getQueueState(calls: readonly AdminCallCardData[], snapshot: QueueSnapshot): AdminQueueState {
  if (snapshot.loading) return 'loading'
  if (snapshot.error) return 'error'
  return calls.length === 0 ? 'empty' : 'ready'
}

export function useAdminCallBoard() {
  const [snapshot, setSnapshot] = useState<QueueSnapshot>({ completed: [], error: false, loading: true, waiting: [] })
  const [completingCallId, setCompletingCallId] = useState<number | null>(null)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const board = await getStaffCallBoard()
      if (!mountedRef.current) return
      setSnapshot({
        completed: board.completed.map(toCardData),
        error: false,
        loading: false,
        waiting: board.waiting.map(toCardData),
      })
    } catch (error: unknown) {
      console.error('SA 호출 보드를 불러오지 못했습니다.', error)
      if (mountedRef.current) {
        setSnapshot((current) => ({ ...current, error: true, loading: false }))
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
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
  }, [refresh])

  const complete = useCallback(async (callId: number) => {
    if (completingCallId !== null) return
    setCompletingCallId(callId)
    try {
      await completeStaffCall(callId)
      await refresh()
    } catch (error: unknown) {
      console.error('SA 호출 완료 처리에 실패했습니다.', error)
      if (mountedRef.current) {
        setSnapshot((current) => ({ ...current, error: true }))
      }
    } finally {
      if (mountedRef.current) setCompletingCallId(null)
    }
  }, [completingCallId, refresh])

  return {
    completed: snapshot.completed,
    completedState: getQueueState(snapshot.completed, snapshot),
    completingCallId,
    complete,
    refresh,
    waiting: snapshot.waiting,
    waitingState: getQueueState(snapshot.waiting, snapshot),
  }
}
