export const EVENT_NAMES = {
  aiAnswer: 'ai_answer',
  freeQuery: 'free_query',
  hubSelect: 'hub_select',
  nfcTag: 'nfc_tag',
  productExit: 'product_exit',
  priceInquiryRequest: 'price_inquiry_request',
  purchaseInquiry: 'purchase_inquiry',
  sizeCheck: 'size_check',
  colorSwitch: 'color_switch',
  tryonRequest: 'tryon_request',
  subhubSelect: 'subhub_select',
  tabView: 'tab_view',
  saCall: 'sa_call',
} as const

export const EVENT_ID_PREFIX = 'event-'

export const FREE_QUERY_TOPICS = {
  repair: 'repair',
  care: 'care',
  giftWrap: 'gift_wrap',
  taxRefund: 'tax_refund',
  other: 'other',
} as const

// Temporary frontend Mock contract. The backend enum has not been finalized.
export type FreeQueryTopic = (typeof FREE_QUERY_TOPICS)[keyof typeof FREE_QUERY_TOPICS]
export const STAFF_CALL_TYPES = ['info', 'other'] as const
export type StaffCallType = (typeof STAFF_CALL_TYPES)[number]

export const HUB_TYPES = ['product', 'fit', 'purchase', 'other'] as const

export type HubType = (typeof HUB_TYPES)[number]

type EventBase<Name extends (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES]> = {
  id: string
  name: Name
  createdAt: string
}

export type SessionEvent =
  | (EventBase<typeof EVENT_NAMES.freeQuery> & { topic: FreeQueryTopic; text: string })
  | (EventBase<typeof EVENT_NAMES.aiAnswer> & { topic: FreeQueryTopic; resolved: boolean })
  | (EventBase<typeof EVENT_NAMES.hubSelect> & { type: HubType })
  | (EventBase<typeof EVENT_NAMES.nfcTag> & { sku: string })
  | (EventBase<typeof EVENT_NAMES.productExit> & { sku: string })
  | (EventBase<typeof EVENT_NAMES.priceInquiryRequest> & { sku: string })
  | (EventBase<typeof EVENT_NAMES.purchaseInquiry> & { sku: string })
  | (EventBase<typeof EVENT_NAMES.sizeCheck> & { sku: string; size: string })
  | (EventBase<typeof EVENT_NAMES.colorSwitch> & { sku: string; from: string; to: string })
  | (EventBase<typeof EVENT_NAMES.tryonRequest> & { sku: string; size: string; color: string })
  | (EventBase<typeof EVENT_NAMES.subhubSelect> & { sub: string })
  | (EventBase<typeof EVENT_NAMES.tabView> & { topic: 'craft' | 'heritage' | 'styling'; sku: string })
  | (EventBase<typeof EVENT_NAMES.saCall> & { type: StaffCallType; sku: string })
