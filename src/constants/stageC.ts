export const STAGE_C_SCREEN_IDS = {
  c1: 'C1',
  c2: 'C2',
  c3: 'C3',
  c4: 'C4',
  c5: 'C5',
  c21: 'C2-1',
  c22: 'C2-2',
  c23: 'C2-3',
  c31: 'C3-1',
  c32: 'C3-2',
  c33: 'C3-3',
  c41: 'C4-1',
  c42: 'C4-2',
  c43: 'C4-3',
  c51: 'C5-1',
  c52: 'C5-2',
  stageB1: 'STAGE-B1',
  stageD1: 'STAGE-D1',
} as const

export const STAGE_C_PRODUCT_DETAIL_ROUTES = {
  craft: '/stage-c/:sku/product/craft',
  heritage: '/stage-c/:sku/product/heritage',
  styling: '/stage-c/:sku/product/styling',
  staffPending: '/stage-c/:sku/product/staff-call/pending',
  staffCompleted: '/stage-c/:sku/product/staff-call/completed',
  fitSize: '/stage-c/:sku/fit/size',
  fitColor: '/stage-c/:sku/fit/color',
  fitTryOn: '/stage-c/:sku/fit/try-on',
  fitTryOnPending: '/stage-c/:sku/fit/try-on/pending',
  fitTryOnCompleted: '/stage-c/:sku/fit/try-on/completed',
  fitPurchaseInquiryCompleted: '/stage-c/:sku/fit/purchase-inquiry/completed',
} as const

export const STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS = {
  [STAGE_C_SCREEN_IDS.c21]: 'craft',
  [STAGE_C_SCREEN_IDS.c22]: 'heritage',
  [STAGE_C_SCREEN_IDS.c23]: 'styling',
  [STAGE_C_SCREEN_IDS.c31]: 'fitSize',
  [STAGE_C_SCREEN_IDS.c32]: 'fitColor',
  [STAGE_C_SCREEN_IDS.c33]: 'fitTryOn',
} as const

export type StageCProductDetailRouteKey =
  (typeof STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS)[keyof typeof STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS]

export function stageCPath(route: string, sku: string): string {
  return route.replace(':sku', encodeURIComponent(sku))
}

export type StageCHubScreenId =
  | typeof STAGE_C_SCREEN_IDS.c1
  | typeof STAGE_C_SCREEN_IDS.c2
  | typeof STAGE_C_SCREEN_IDS.c3
  | typeof STAGE_C_SCREEN_IDS.c4
  | typeof STAGE_C_SCREEN_IDS.c5

export type StageCComingSoonScreenId = Exclude<
  (typeof STAGE_C_SCREEN_IDS)[keyof typeof STAGE_C_SCREEN_IDS],
  StageCHubScreenId
>

export const STAGE_C_ROUTES = {
  c1: '/stage-c/:sku',
  c2: '/stage-c/:sku/product',
  c3: '/stage-c/:sku/fit',
  c4: '/stage-c/:sku/purchase',
  c5: '/stage-c/:sku/other',
  comingSoon: '/stage-c/:sku/coming-soon/:screenId',
} as const

export function stageCComingSoonPath(sku: string, screenId: StageCComingSoonScreenId): string {
  return stageCPath(STAGE_C_ROUTES.comingSoon, sku).replace(':screenId', screenId)
}
