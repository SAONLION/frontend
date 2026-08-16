import { apiClient } from './client'
import type { NicknameUpdateRequest, NicknameUpdateResponse, SessionCreateRequest, SessionCreateResponse, SessionEndResponse } from './types'

// POST /api/v1/sessions
export async function createSession(language: string): Promise<SessionCreateResponse> {
  const body: SessionCreateRequest = { language }
  const { data } = await apiClient.post<SessionCreateResponse>('/api/v1/sessions', body)
  return data
}

// PATCH /api/v1/sessions/{sessionId}/nickname
export async function updateNickname(sessionId: string, nickname: string): Promise<NicknameUpdateResponse> {
  const body: NicknameUpdateRequest = { nickname }
  const { data } = await apiClient.patch<NicknameUpdateResponse>(`/api/v1/sessions/${sessionId}/nickname`, body)
  return data
}

// POST /api/v1/sessions/{sessionId}/end
export async function endSession(sessionId: string): Promise<SessionEndResponse> {
  const { data } = await apiClient.post<SessionEndResponse>(`/api/v1/sessions/${sessionId}/end`)
  return data
}
