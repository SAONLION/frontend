import { createStaffCall, getStaffCall } from './staffCalls'
import { STAFF_CALL_REASONS } from '../constants/staffCallReasons'
import { setActiveStaffCallId } from '../features/sa-call/activeStaffCall'
import type { StaffCallProgress, StaffCallService } from '../features/sa-call/StaffCallService'

const POLL_INTERVAL_MS = 4_000
// SA 대시보드가 없는 시연에서는 상태를 바꿔주지 않으면 반드시 타임아웃까지 간다.
// 3분은 그동안 "알림을 보내는 중" 화면에 갇히게 해서, 응대 현실보다 시연 체감을 기준으로 줄였다.
const POLL_TIMEOUT_MS = 45_000
const MAX_POLL_ATTEMPTS = Math.ceil(POLL_TIMEOUT_MS / POLL_INTERVAL_MS)

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function pollUntilCompleted(
  sessionId: string,
  callId: number,
  onProgress?: (progress: StaffCallProgress) => void,
): Promise<'completed'> {
  let lastStatus: string | null = null

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const status = await getStaffCall(sessionId, callId)

    // 같은 상태를 반복해서 올리면 화면이 같은 문구를 다시 그린다.
    if (status.status !== lastStatus) {
      lastStatus = status.status
      onProgress?.({ status: status.status, displayMessage: status.displayMessage })
    }

    if (status.status === 'completed') return 'completed'
    await wait(POLL_INTERVAL_MS)
  }
  throw new Error('직원 호출 상태 확인이 시간 초과되었습니다.')
}

export const realStaffCallService: StaffCallService = {
  async request({ sessionId, productId, type, onProgress }) {
    if (!sessionId) throw new Error('세션이 아직 생성되지 않았습니다.')
    const reason = type === 'info' ? STAFF_CALL_REASONS.productInfo : STAFF_CALL_REASONS.other
    const created = await createStaffCall(sessionId, { productId: productId ?? undefined, reason })
    setActiveStaffCallId(created.callId)

    try {
      return await pollUntilCompleted(sessionId, created.callId, onProgress)
    } finally {
      setActiveStaffCallId(null)
    }
  },
}
