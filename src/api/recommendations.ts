import { apiClient, ApiError } from './client'
import { fetchMockRecommendations } from '../mocks/recommendations'

// 서버에 배포 완료 — 실제 API를 사용한다. 다시 mock으로 돌리려면 이 값만 true로 바꾸면 된다.
export const USE_MOCK_RECOMMENDATIONS = false

export type RecommendationItem = { productId: number; productName: string; reason?: string }
type RecommendationsResponse = { recommendations: readonly RecommendationItem[] }

const RECOMMENDATIONS_TIMEOUT_MS = 10_000

// 직전에 성공한 추천 결과. 타임아웃/네트워크 오류 시 폴백으로 재사용한다.
let lastSuccessfulRecommendations: readonly RecommendationItem[] | null = null

async function requestRealRecommendations(sessionId: string): Promise<readonly RecommendationItem[]> {
  const { data } = await apiClient.get<RecommendationsResponse>('/api/v1/session/recommendations', {
    params: { sessionId },
    timeout: RECOMMENDATIONS_TIMEOUT_MS,
  })
  return data.recommendations
}

/**
 * AI 추천 조회 (2~5초 걸리는 동기 호출). 태그 스캔 이력이 없으면 서버가 빈 배열을 정상(200)
 * 응답하므로 그대로 반환한다 — 호출부는 빈 배열이면 "추천 제품 없음" 안내를 보여줘야 한다.
 *
 * 타임아웃(10초)/네트워크 오류가 나면 직전 성공 결과를 폴백으로 반환하고, 폴백할 캐시가 없으면
 * null을 반환한다 — 호출부는 null이면 추천 섹션 자체를 건너뛴다.
 * 404(SESSION_NOT_FOUND)는 캐시를 재사용하지 않고 바로 null을 반환한다 — 다른 세션의 결과를
 * 보여주는 것이 되기 때문이다.
 */
export async function fetchRecommendations(sessionId: string): Promise<readonly RecommendationItem[] | null> {
  try {
    const recommendations = USE_MOCK_RECOMMENDATIONS
      ? await fetchMockRecommendations()
      : await requestRealRecommendations(sessionId)
    lastSuccessfulRecommendations = recommendations
    return recommendations
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      console.error('세션을 찾을 수 없어 추천을 건너뜁니다.', error)
      return null
    }
    console.error('추천 조회에 실패했습니다. 이전 추천 결과로 대체합니다.', error)
    return lastSuccessfulRecommendations
  }
}
