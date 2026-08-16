import { apiClient } from './client'
import type { StaffCallRequest, StaffCallResponse, StaffCallStatusResponse } from './types'

// POST /api/v1/session/staff-calls
export async function createStaffCall(
  sessionId: string,
  input: { productId?: number; reason: string },
): Promise<StaffCallResponse> {
  const body: StaffCallRequest = { productId: input.productId, reason: input.reason }
  const { data } = await apiClient.post<StaffCallResponse>('/api/v1/session/staff-calls', body, {
    params: { sessionId },
  })
  return data
}

// GET /api/v1/session/staff-calls/{callId}
export async function getStaffCall(sessionId: string, callId: number): Promise<StaffCallStatusResponse> {
  const { data } = await apiClient.get<StaffCallStatusResponse>(`/api/v1/session/staff-calls/${callId}`, {
    params: { sessionId },
  })
  return data
}
