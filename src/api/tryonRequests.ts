import { apiClient } from './client'
import type { TryonRequestRequest, TryonRequestResponse } from './types'

// POST /api/v1/sessions/{sessionId}/tryon-requests
export async function createTryonRequest(
  sessionId: string,
  input: { sku: number; size: string; color: string },
): Promise<TryonRequestResponse> {
  const body: TryonRequestRequest = { sku: input.sku, size: input.size, color: input.color }
  const { data } = await apiClient.post<TryonRequestResponse>(`/api/v1/sessions/${sessionId}/tryon-requests`, body)
  return data
}
