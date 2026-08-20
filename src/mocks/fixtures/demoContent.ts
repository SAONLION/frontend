import travelPouchImage from '../../assets/mock/d2-recommendations/ottomar-travel-pouch-primary.webp'
import weekenderImage from '../../assets/mock/d2-recommendations/ottomar-weekender-primary.webp'
import trolleyImage from '../../assets/mock/d2-recommendations/ottomar-trolley-primary.webp'

export type DemoRecommendation = {
  id: string
  /** D4에서 제품을 고르면 이 sku의 StageC 화면으로 이동한다. */
  sku: string
  image: string
  name: string
  description: string
}

/** Deterministic pre-API content used by the Stage D recommendation demonstration. */
// sku는 result_tobackend 스냅샷의 실제 style number이며 mockProducts에 같은 값이 등록되어 있다.
export const mockD2Recommendations: readonly DemoRecommendation[] = [
  { id: 'ottomar-travel-pouch', sku: 'MXZFSTT03CO001', image: travelPouchImage, name: 'S Ottomar 비세토스 트래블 파우치', description: '제품의 세부 구성은 직원에게 확인할 수 있어요.' },
  { id: 'visetos-weekender', sku: 'MMVGATT01CO001', image: weekenderImage, name: '비세토스 위켄더', description: '여행 목적에 맞는 제품으로 함께 살펴볼 수 있어요.' },
  { id: 'visetos-trolley', sku: 'MMVDSTT02CO001', image: trolleyImage, name: '비세토스 트롤리', description: '크기와 사용 목적은 직원에게 정확히 안내받을 수 있어요.' },
]
