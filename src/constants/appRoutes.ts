export const DEFAULT_PRODUCT_SKU = 'MMKEAVE15CO001'

export const STAGE_A_ROUTES = {
  intro: '/stage-a/intro',
  nickname: '/stage-a/nickname',
} as const

export const STAGE_B_ROUTES = {
  nfcPrompt: '/stage-b/nfc',
  recognizing: '/stage-b/recognizing',
} as const

export function stageBRecognizingPath(sku: string): string {
  return `${STAGE_B_ROUTES.recognizing}?sku=${encodeURIComponent(sku)}`
}

export const STAGE_D_ROUTES = {
  recommend: '/stage-d/recommend',
  locationGuide: '/stage-d/location-guide',
} as const

export const STAGE_G_ROUTES = {
  content: '/stage-g/content',
  interestFollowup: '/stage-g/interest-followup',
  email: '/stage-g/email',
  complete: '/stage-g/complete',
} as const

export const SESSION_END_ROUTE = '/session-end'
