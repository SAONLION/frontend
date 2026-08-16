import type { RecommendationItem } from '../api/recommendations'

const MOCK_RECOMMENDATION_SETS: readonly (readonly RecommendationItem[])[] = [
  [
    { productId: 101, productName: '비세토스 백팩 M 코냑', reason: '고객님이 관심 보이신 여행용 가방과 비슷한 스타일이면서, 더 컴팩트한 사이즈예요.' },
    { productId: 205, productName: 'MCM 리시 카드지갑', reason: '선물용으로 부담 없는 사이즈의 액세서리예요.' },
    { productId: 312, productName: 'MCM 밀라 토트백' }, // reason 없는 케이스(AI 호출 실패 상황)도 함께 흉내낸다.
  ],
  [
    { productId: 402, productName: 'MCM 스타크 백팩 미니', reason: '둘러보신 백팩 카테고리와 비슷한 가격대의 제품이에요.' },
    { productId: 257, productName: 'MCM 히멜 숄더백', reason: '고급 소재에 관심을 보이셔서 추천드려요.' },
  ],
  [], // 태그 스캔 이력이 없는 세션을 흉내내는 빈 결과 세트
]

const MOCK_MIN_DELAY_MS = 2_000
const MOCK_MAX_DELAY_MS = 5_000

function randomDelayMs(): number {
  return MOCK_MIN_DELAY_MS + Math.floor(Math.random() * (MOCK_MAX_DELAY_MS - MOCK_MIN_DELAY_MS))
}

// 실제 AI 추천 호출(2~5초 소요)을 흉내내기 위해 랜덤 지연을 준다.
export function fetchMockRecommendations(): Promise<readonly RecommendationItem[]> {
  const set = MOCK_RECOMMENDATION_SETS[Math.floor(Math.random() * MOCK_RECOMMENDATION_SETS.length)]
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(set), randomDelayMs())
  })
}
