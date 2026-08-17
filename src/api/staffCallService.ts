import { createStaffCall, getStaffCall } from './staffCalls'
import { STAFF_CALL_REASONS } from '../constants/staffCallReasons'
import { setActiveStaffCallId } from '../features/sa-call/activeStaffCall'
import type { StaffCallService } from '../features/sa-call/StaffCallService'

const POLL_INTERVAL_MS = 4_000
const MAX_POLL_ATTEMPTS = 45 // ~3분

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function pollUntilCompleted(sessionId: string, callId: number): Promise<'completed'> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const status = await getStaffCall(sessionId, callId)
    if (status.status === 'completed') return 'completed'
    await wait(POLL_INTERVAL_MS)
  }
  throw new Error('직원 호출 상태 확인이 시간 초과되었습니다.')
}

export const realStaffCallService: StaffCallService = {
  async request({ sessionId, productId, type }) {
    if (!sessionId) throw new Error('세션이 아직 생성되지 않았습니다.')
    const reason = type === 'info' ? STAFF_CALL_REASONS.productInfo : STAFF_CALL_REASONS.other
    const created = await createStaffCall(sessionId, { productId: productId ?? undefined, reason })
    setActiveStaffCallId(created.callId)

    try {
      return await pollUntilCompleted(sessionId, created.callId)
    } finally {
      setActiveStaffCallId(null)
    }
  },
}
