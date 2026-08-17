import { apiClient } from './client'
import type { QnaRequest, QnaResponse } from './types'

// POST /api/v1/products/{productId}/qna
export async function askProductQna(
  productId: number,
  sessionId: string,
  input: QnaRequest,
): Promise<QnaResponse> {
  const { data } = await apiClient.post<QnaResponse>(`/api/v1/products/${productId}/qna`, input, {
    params: { sessionId },
  })
  return data
}
