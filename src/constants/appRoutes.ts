export const DEFAULT_PRODUCT_SKU = 'MMKEAVE15CO001'

export const STAGE_A_ROUTES = {
  intro: '/stage-a/intro',
  nickname: '/stage-a/nickname',
} as const

export const STAGE_B_ROUTES = {
  nfcPrompt: '/stage-b/nfc',
  recognizing: '/stage-b/recognizing',
} as const

export function stageBRecognizingPath(sku: string, tagId?: number): string {
  const params = new URLSearchParams({ sku })
  // tagId를 넘기지 않으면 B2가 기본 태그를 쓴다. 시연 흐름은 항상 짝이 맞는 태그를 함께 넘긴다.
  if (tagId !== undefined) params.set('tagId', String(tagId))
  return `${STAGE_B_ROUTES.recognizing}?${params.toString()}`
}

export function stageBRandomRecognizingPath(): string {
  return `${STAGE_B_ROUTES.recognizing}?random=true`
}

export const STAGE_D_ROUTES = {
  recommend: '/stage-d/recommend',
  locationGuide: '/stage-d/location-guide',
  // 두 번째 이탈부터 반복되는 개인화 추천 루프(D3 → D4)
  personalizedRecommend: '/stage-d/personalized-recommend',
  personalizedLocationGuide: '/stage-d/personalized-location-guide',
} as const

export const SESSION_END_ROUTE = '/session-end'

// 서버 Blocker의 콘텐츠 제안 후속 화면. 팝업 위에 쌓지 않고 URL을 갖는 독립 화면으로 이동한다.
export const CONTENT_OFFER_ROUTES = {
  email: '/content-offer/email',
  sent: '/content-offer/sent',
  value: '/content-offer/value',
  staff: '/content-offer/staff',
} as const

// 시연용 목업 셸. 앱 라우터 바깥에서 처리되므로 AppRoutes에는 등록하지 않는다.
export const DEMO_SHELL_ROUTE = '/demo'
