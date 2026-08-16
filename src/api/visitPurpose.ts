import { apiClient } from './client'
import type { VisitPurposeRequest, VisitPurposeResponse, VisitPurposeStatusResponse } from './types'

// GET /api/v1/sessions/{sessionId}/visit-purpose
export async function getVisitPurpose(sessionId: string): Promise<VisitPurposeStatusResponse> {
  const { data } = await apiClient.get<VisitPurposeStatusResponse>(`/api/v1/sessions/${sessionId}/visit-purpose`)
  return data
}

// POST /api/v1/sessions/{sessionId}/visit-purpose
export async function postVisitPurpose(sessionId: string, purposeType: string): Promise<VisitPurposeResponse> {
  const body: VisitPurposeRequest = { purposeType }
  const { data } = await apiClient.post<VisitPurposeResponse>(`/api/v1/sessions/${sessionId}/visit-purpose`, body)
  return data
}
