import { apiClient } from './client'
import type { StaffCallBoardResponse, StaffCallStatusResponse } from './types'

function staffAuthHeaders(staffToken: string) {
  return { 'X-Staff-Token': staffToken }
}

/** 직원 태블릿의 대기·완료 호출 보드를 조회한다. */
export async function getStaffCallBoard(staffToken: string, completedLimit: number = 20): Promise<StaffCallBoardResponse> {
  const { data } = await apiClient.get<StaffCallBoardResponse>('/api/v1/staff/staff-calls', {
    headers: staffAuthHeaders(staffToken),
    params: { completedLimit },
  })
  return data
}

/** SA의 체크 액션으로 호출을 즉시 완료 상태로 전이한다. */
export async function completeStaffCall(staffToken: string, callId: number): Promise<StaffCallStatusResponse> {
  const { data } = await apiClient.patch<StaffCallStatusResponse>(`/api/v1/staff/staff-calls/${callId}/complete`, undefined, {
    headers: staffAuthHeaders(staffToken),
  })
  return data
}
