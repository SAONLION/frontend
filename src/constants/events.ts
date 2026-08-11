export const EVENT_NAMES = {
  freeQuery: 'free_query',
  hubSelect: 'hub_select',
  nfcTag: 'nfc_tag',
  productExit: 'product_exit',
  purchaseInquiry: 'purchase_inquiry',
  subhubSelect: 'subhub_select',
  tabView: 'tab_view',
  saCall: 'sa_call',
} as const

export const EVENT_ID_PREFIX = 'event-'

export const FREE_QUERY_TOPICS = {
  other: 'other',
} as const

export const HUB_TYPES = ['product', 'fit', 'purchase', 'other'] as const

export type HubType = (typeof HUB_TYPES)[number]

type EventBase<Name extends (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES]> = {
  id: string
  name: Name
  createdAt: string
}

export type SessionEvent =
  | (EventBase<typeof EVENT_NAMES.freeQuery> & { topic: string; text: string })
  | (EventBase<typeof EVENT_NAMES.hubSelect> & { type: HubType })
  | (EventBase<typeof EVENT_NAMES.nfcTag> & { sku: string })
  | (EventBase<typeof EVENT_NAMES.productExit> & { sku: string })
  | (EventBase<typeof EVENT_NAMES.purchaseInquiry> & { sku: string })
  | (EventBase<typeof EVENT_NAMES.subhubSelect> & { sub: string })
  | (EventBase<typeof EVENT_NAMES.tabView> & { topic: 'craft' | 'heritage' | 'styling'; sku: string })
  | (EventBase<typeof EVENT_NAMES.saCall> & { type: 'info'; sku: string })
