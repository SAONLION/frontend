import { apiClient } from './client'
import type { PurchaseInquiryRequest, PurchaseInquiryResponse } from './types'

/**
 * POST /api/v1/sessions/{sessionId}/purchase-inquiries
 *
 * 구매 의사를 명시적으로 표현하는 이벤트다. 스펙이 intent-score 산정에서 가장 중요하게
 * 반영될 예정이라고 명시한 신호이므로 누락되면 안 된다.
 */
export async function createPurchaseInquiry(sessionId: string, sku: number): Promise<PurchaseInquiryResponse> {
  const body: PurchaseInquiryRequest = { sku }
  const { data } = await apiClient.post<PurchaseInquiryResponse>(
    `/api/v1/sessions/${sessionId}/purchase-inquiries`,
    body,
  )
  return data
}
