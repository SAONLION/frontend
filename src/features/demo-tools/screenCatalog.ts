import { SESSION_END_ROUTE, STAGE_A_ROUTES, STAGE_B_ROUTES, STAGE_D_ROUTES, stageBRecognizingPath } from '../../constants/appRoutes'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, STAGE_C_SCREEN_IDS } from '../../constants/stageC'

/**
 * 디버그 패널이 보여주는 화면 목록.
 *
 * `routes.tsx`가 진짜 목록이지만 그건 컴포넌트 트리라 순회할 수 없다. 여기서는 **경로 상수만
 * 조합해** 목록을 만든다 — 경로가 바뀌면 상수가 바뀌므로 이 목록도 따라간다.
 *
 * `:sku` 자리는 현재 세션이 보고 있는 제품으로 채운다. 태그 전이라면 기본 제품을 쓴다.
 */

export type ScreenLink = { label: string; path: string }
export type ScreenGroup = { group: string; links: readonly ScreenLink[] }

function withSku(template: string, sku: string): string {
  return template.replace(':sku', sku)
}

export function buildScreenCatalog(sku: string): readonly ScreenGroup[] {
  const c = (template: string) => withSku(template, sku)

  return [
    {
      group: 'A · 진입',
      links: [
        { label: 'A1 도슨트 소개', path: STAGE_A_ROUTES.intro },
        { label: 'A2 닉네임', path: STAGE_A_ROUTES.nickname },
      ],
    },
    {
      group: 'B · 여권 · 태그',
      links: [
        { label: 'B1 여권 · NFC 안내', path: STAGE_B_ROUTES.nfcPrompt },
        { label: 'B2 태그 인식', path: stageBRecognizingPath(sku, 1) },
      ],
    },
    {
      group: 'C · 제품 탐색',
      links: [
        { label: 'C1 제품 소개 허브', path: c(STAGE_C_ROUTES.c1) },
        { label: 'C2 제품 이해 허브', path: c(STAGE_C_ROUTES.c2) },
        { label: 'C2-1 소재·마감', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.craft) },
        { label: 'C2-2 헤리티지', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.heritage) },
        { label: 'C2-3 스타일링', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.styling) },
        { label: 'C3 핏·취향 허브', path: c(STAGE_C_ROUTES.c3) },
        { label: 'C3-1 사이즈', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.fitSize) },
        { label: 'C3-2 컬러', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.fitColor) },
        { label: 'C3-3 착장 요청', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn) },
        { label: 'C3-3 착장 대기', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnPending) },
        { label: 'C3-3-4 착장 완료', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnCompleted) },
        { label: 'C3-3-5 구매 문의 완료', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.fitPurchaseInquiryCompleted) },
      ],
    },
    {
      group: 'C · 가격 · 기타',
      links: [
        { label: 'C4 구매 조건 진입', path: c(STAGE_C_ROUTES.c4) },
        { label: 'C4-1 가격 요청', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiry) },
        { label: 'C4-1 가격 대기', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryPending) },
        { label: 'C4-1 가격 완료', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryCompleted) },
        { label: 'C5 기타 질문', path: c(STAGE_C_ROUTES.c5) },
        { label: 'C5 AI 답변', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.otherAnswer) },
        { label: 'C5 직원 호출 대기', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.otherStaffPending) },
        { label: 'C5 직원 호출 완료', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.otherStaffCompleted) },
        { label: 'C2 직원 호출 대기', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.staffPending) },
        { label: 'C2 직원 호출 완료', path: c(STAGE_C_PRODUCT_DETAIL_ROUTES.staffCompleted) },
      ],
    },
    {
      group: 'D · 추천 루프',
      links: [
        { label: 'D1 방문 목적', path: c(STAGE_C_ROUTES.comingSoon).replace(':screenId', STAGE_C_SCREEN_IDS.stageD1) },
        { label: 'D2 목적 기반 추천', path: STAGE_D_ROUTES.recommend },
        { label: 'D2-1 위치 안내', path: STAGE_D_ROUTES.locationGuide },
        { label: 'D3 개인화 추천', path: STAGE_D_ROUTES.personalizedRecommend },
        { label: 'D4 위치 안내', path: STAGE_D_ROUTES.personalizedLocationGuide },
      ],
    },
    {
      group: 'E · 종료',
      links: [
        { label: 'E1 직원 호출 트레이', path: c(STAGE_C_ROUTES.comingSoon).replace(':screenId', STAGE_C_SCREEN_IDS.stageE1) },
        { label: '세션 종료 안내', path: SESSION_END_ROUTE },
      ],
    },
  ]
}
