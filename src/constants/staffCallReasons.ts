/**
 * 서버 직원 호출(`POST /api/v1/session/staff-calls`)의 `reason` 값.
 *
 * STAGE E 전용 엔드포인트가 없어 C·E의 모든 직원 호출이 이 API 하나를 쓰고 `reason`으로만
 * 구분된다. SA 대시보드가 이 문자열로 요청 종류를 읽으므로 화면마다 따로 쓰지 않고 여기 모은다.
 */
export const STAFF_CALL_REASONS = {
  /** C4-1 가격 안내 요청, E1 `가격 확인` */
  price: '가격 문의',
  /** E1 `착장 요청` — C3-3은 전용 API(`tryon-requests`)를 쓴다 */
  tryOn: '착장 요청',
  /** E1 `재고 문의` */
  stock: '재고 문의',
  /** E1 `구매 요청` — C3-3-4는 전용 API(`purchase-inquiries`)를 쓴다 */
  purchase: '구매 문의',
  /** C2 상세에서 올리는 제품 문의 */
  productInfo: '제품 정보 문의',
  /** C5 자유 질문 직원 연결, E1 `기타` */
  other: '기타 문의',
} as const
