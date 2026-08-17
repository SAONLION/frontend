import type { StaffCallType } from '../../constants/events'

export const MOCK_STAFF_CALL_DELAY_MS = 800

/**
 * 서버가 알려주는 응대 진행 단계. 순서는 `requested` → `acknowledged` → `in_progress` → `completed`다.
 * 알 수 없는 값이 와도 화면이 깨지지 않도록 문자열로 받는다.
 */
export type StaffCallProgress = { status: string; displayMessage: string }

export type StaffCallRequest = {
  sku: string
  type: StaffCallType
  sessionId: string | null
  productId: number | null
  /**
   * 폴링 중 상태가 바뀔 때마다 호출된다.
   * 이걸 쓰지 않으면 완료까지 화면이 한 문구로 멈춰 있어 진행 중인지 알 수 없다.
   */
  onProgress?: (progress: StaffCallProgress) => void
}

export interface StaffCallService { request: (request: StaffCallRequest) => Promise<'completed'> }
