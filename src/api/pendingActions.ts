import { apiClient } from './client'
import type { PendingActionResponse, RespondRequest, RespondResponse } from './types'

// GET /api/v1/session/pending-action
export async function getPendingAction(sessionId: string): Promise<PendingActionResponse> {
  const { data } = await apiClient.get<PendingActionResponse>('/api/v1/session/pending-action', {
    params: { sessionId },
  })
  return data
}

// POST /api/v1/actions/{actionId}/respond
export async function respondToAction(actionId: number, responseKey: string): Promise<RespondResponse> {
  const body: RespondRequest = { responseKey }
  const { data } = await apiClient.post<RespondResponse>(`/api/v1/actions/${actionId}/respond`, body)
  return data
}
