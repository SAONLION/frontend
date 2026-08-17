import { apiClient } from './client'
import type { StaffCallResponse, StaffCallTestStatusRequest } from './types'

export const STAFF_CALL_TEST_STATUSES = ['requested', 'acknowledged', 'in_progress', 'completed'] as const
export type StaffCallTestStatus = (typeof STAFF_CALL_TEST_STATUSES)[number]

/**
 * PATCH /internal/test/staff-calls/{callId}/status
 *
 * SA 대시보드가 없는 상태에서 시연하기 위한 임시 API다. 정식 기능이 아니며
 * 서버의 `app.internal-test-endpoints.enabled=true`(기본값 false)일 때만 등록된다.
 * 꺼져 있으면 404가 온다.
 *
 * 이 호출이 없으면 STAGE C 직원 호출은 `completed`가 될 때까지 약 3분 폴링하다 시간 초과된다.
 * 개발 진단 패널에서만 사용한다.
 */
export async function setStaffCallTestStatus(
  callId: number,
  status: StaffCallTestStatus,
): Promise<StaffCallResponse> {
  const body: StaffCallTestStatusRequest = { status }
  const { data } = await apiClient.patch<StaffCallResponse>(`/internal/test/staff-calls/${callId}/status`, body)
  return data
}
