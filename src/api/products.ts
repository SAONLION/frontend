import { apiClient } from './client'
import type {
  ProductTagScanResponseDTO,
  SkuDetailResponse,
  SkuListItemResponse,
} from './types'

// GET /api/v1/products/tags/{tagId}
export async function scanTag(tagId: number, sessionId: string): Promise<ProductTagScanResponseDTO> {
  const { data } = await apiClient.get<ProductTagScanResponseDTO>(`/api/v1/products/tags/${tagId}`, {
    params: { sessionId },
  })
  return data
}

// GET /api/v1/products/{productId}/skus
export async function getSkus(productId: number): Promise<readonly SkuListItemResponse[]> {
  const { data } = await apiClient.get<readonly SkuListItemResponse[]>(`/api/v1/products/${productId}/skus`)
  return data
}

/**
 * 아직 호출부가 없다. **제품 콘텐츠 Live 전환의 진입점**으로 남겨둔 것이다 —
 * 사이즈·치수를 서버에서 받아오려면 이 응답이 필요하다(OPEN_QUESTIONS 21번).
 * 현재 서버는 `size` 코드만 주고 치수·사이즈별 제품명이 없다(BACKEND_REQUEST P2-5).
 */
// GET /api/v1/products/{productId}/skus/{skuId}
export async function getSkuDetail(productId: number, skuId: number): Promise<SkuDetailResponse> {
  const { data } = await apiClient.get<SkuDetailResponse>(`/api/v1/products/${productId}/skus/${skuId}`)
  return data
}

