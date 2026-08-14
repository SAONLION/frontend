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

export const STAGE_F_ROUTES = {
  cb6Offer: '/stage-f/cb6/offer',
  emailInput: '/stage-f/cb6/email',
  sendComplete: '/stage-f/cb6/complete',
  cb3Prompt: '/stage-f/cb3/prompt',
  cb5Prompt: '/stage-f/cb5/prompt',
  valueContent: '/stage-f/cb5/content',
  staffHandoff: '/stage-f/staff-handoff',
} as const

export const SESSION_END_ROUTE = '/session-end'
