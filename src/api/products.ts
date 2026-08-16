import { apiClient } from './client'
import type {
  HubOptionResponse,
  InterestType,
  PickupCheckRequest,
  PickupCheckResponse,
  ProductTagScanResponseDTO,
  SkuDetailResponse,
  SkuListItemResponse,
  SubOptionDTO,
} from './types'

// GET /api/v1/products/tags/{tagId}
export async function scanTag(tagId: number, sessionId: string): Promise<ProductTagScanResponseDTO> {
  const { data } = await apiClient.get<ProductTagScanResponseDTO>(`/api/v1/products/tags/${tagId}`, {
    params: { sessionId },
  })
  return data
}

// GET /api/v1/products/{productId}/hub
export async function getHubOptions(productId: number, interestType: InterestType): Promise<readonly SubOptionDTO[]> {
  const { data } = await apiClient.get<readonly SubOptionDTO[]>(`/api/v1/products/${productId}/hub`, {
    params: { interestType },
  })
  return data
}

// GET /api/v1/products/{productId}/hub/options/{optionId}
export async function getHubOptionDetail(productId: number, optionId: string): Promise<HubOptionResponse> {
  const { data } = await apiClient.get<HubOptionResponse>(`/api/v1/products/${productId}/hub/options/${optionId}`)
  return data
}

// GET /api/v1/products/{productId}/skus
export async function getSkus(productId: number): Promise<readonly SkuListItemResponse[]> {
  const { data } = await apiClient.get<readonly SkuListItemResponse[]>(`/api/v1/products/${productId}/skus`)
  return data
}

// GET /api/v1/products/{productId}/skus/{skuId}
export async function getSkuDetail(productId: number, skuId: number): Promise<SkuDetailResponse> {
  const { data } = await apiClient.get<SkuDetailResponse>(`/api/v1/products/${productId}/skus/${skuId}`)
  return data
}

// POST /api/v1/products/{productId}/pickup-check (비공식 스펙)
export async function checkPickup(
  productId: number,
  sessionId: string,
  input: { pickupMethod: string; skuId: number },
): Promise<PickupCheckResponse> {
  const body: PickupCheckRequest = { pickupMethod: input.pickupMethod, skuId: input.skuId }
  const { data } = await apiClient.post<PickupCheckResponse>(`/api/v1/products/${productId}/pickup-check`, body, {
    params: { sessionId },
  })
  return data
}
