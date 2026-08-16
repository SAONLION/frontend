import { apiClient } from './client'
import type { InteractionLogRequest, InteractionLogResponse, InterestType } from './types'

// POST /api/v1/sessions/{sessionId}/interactions
export async function recordInteraction(
  sessionId: string,
  input: { sku: number; interestType: InterestType; subOption?: string },
): Promise<InteractionLogResponse> {
  const body: InteractionLogRequest = { sku: input.sku, interestType: input.interestType, subOption: input.subOption }
  const { data } = await apiClient.post<InteractionLogResponse>(`/api/v1/sessions/${sessionId}/interactions`, body)
  return data
}
