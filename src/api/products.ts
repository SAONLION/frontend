import { apiClient } from './client'
import type {
  ProductTagScanResponseDTO,
  SkuDetailResponse,
  SkuListItemResponse,
} from './types'

/**
 * 태그 인식(B2)과 제품 화면 진입(STAGE C)이 같은 SKU 목록을 연속으로 필요로 한다.
 *
 * SKU 목록은 색상·사이즈 선택의 기준 데이터이며 현재 세션 안에서 변경시키는 API가 없다.
 * 따라서 productId별 Promise를 재사용해 B2 직후 STAGE C가 같은 GET을 한 번 더 보내지 않게 한다.
 * 실패한 요청은 보관하지 않아 다음 진입에서 정상적으로 재시도한다.
 */
const skuListRequests = new Map<number, Promise<readonly SkuListItemResponse[]>>()

// GET /api/v1/products/tags/{tagId}
export async function scanTag(tagId: number, sessionId: string): Promise<ProductTagScanResponseDTO> {
  const { data } = await apiClient.get<ProductTagScanResponseDTO>(`/api/v1/products/tags/${tagId}`, {
    params: { sessionId },
  })
  return data
}

// GET /api/v1/products/{productId}/skus
export async function getSkus(productId: number): Promise<readonly SkuListItemResponse[]> {
  const cached = skuListRequests.get(productId)
  if (cached) return cached

  const request = apiClient
    .get<readonly SkuListItemResponse[]>(`/api/v1/products/${productId}/skus`)
    .then(({ data }) => data)
    .catch((error: unknown) => {
      // 실패 응답까지 캐시하면 네트워크가 회복돼도 해당 제품의 컬러·사이즈가 계속 비어 보인다.
      skuListRequests.delete(productId)
      throw error
    })

  skuListRequests.set(productId, request)
  return request
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
