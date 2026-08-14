import travelPouchImage from '../../assets/images/product-travel-pouch-set.jpg'
import weekenderImage from '../../assets/images/product-visetos-weekender.png'
import trolleyImage from '../../assets/images/product-visetos-trolley.png'
import type { BlockerPromptVariant } from '../../features/blocker/blockerTypes'

export type DemoRecommendation = {
  id: string
  image: string
  name: string
  description: string
}

/** Deterministic pre-API content used by the Stage D recommendation demonstration. */
export const mockD2Recommendations: readonly DemoRecommendation[] = [
  { id: 'travel-pouch-set', image: travelPouchImage, name: '트래블 파우치 세트', description: '제품의 세부 구성은 직원에게 확인할 수 있어요.' },
  { id: 'visetos-weekender', image: weekenderImage, name: '비세토스 위켄더', description: '여행 목적에 맞는 제품으로 함께 살펴볼 수 있어요.' },
  { id: 'visetos-trolley', image: trolleyImage, name: '비세토스 트롤리', description: '크기와 사용 목적은 직원에게 정확히 안내받을 수 있어요.' },
]

export const mockBlockerPromptCopy: Record<BlockerPromptVariant, { accept: string; decline: string; title: (productName: string) => string }> = {
  'cb3-staff': { accept: '네, 불러주세요', decline: '괜찮아요', title: () => '직원에게 직접 안내를\n받아보시겠어요?' },
  'cb5-value': { accept: '몰랐어요! 궁금해요', decline: '관심없어요', title: (name) => `${name}의 제품 이야기와\n스타일링 정보를 더 살펴보시겠어요?` },
  'cb6-content': { accept: '네, 불러주세요', decline: '괜찮아요', title: (name) => `관심있던 ${name}에\n대한 콘텐츠를 받아보시겠어요?` },
}

export function getMockValueContentCopy(productName: string): string {
  return `${productName}의 소재와 스타일링 정보는 직원에게 정확히 안내받을 수 있어요.`
}
