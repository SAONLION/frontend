/**
 * 실물 NFC 대신 B1 시연에서 사용할 서버 태그 범위.
 *
 * 현재 서버 계약에서 `tagId`와 `skuId`는 같은 정수이며, 백엔드 확인에 따라 1부터 624까지의
 * 모든 번호를 조회 가능한 SKU로 간주한다. 실제 제품 정보는 선택 뒤 태그 스캔 API에서 받는다.
 */
export const DEMO_TAG_ID_MIN = 1
export const DEMO_TAG_ID_MAX = 624

export function pickDemoTag(): number {
  return Math.floor(Math.random() * (DEMO_TAG_ID_MAX - DEMO_TAG_ID_MIN + 1)) + DEMO_TAG_ID_MIN
}
