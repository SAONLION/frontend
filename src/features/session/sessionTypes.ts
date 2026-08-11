import type { HubType, SessionEvent } from '../../constants/events'
import type { StageCComingSoonScreenId } from '../../constants/stageC'

export const SESSION_ACTIONS = {
  recordFreeQuery: 'record_free_query',
  recordHubSelect: 'record_hub_select',
  recordNfcTag: 'record_nfc_tag',
  recordProductExit: 'record_product_exit',
  recordPriceInquiryRequest: 'record_price_inquiry_request',
  recordPurchaseInquiry: 'record_purchase_inquiry',
  recordSizeCheck: 'record_size_check',
  recordColorSwitch: 'record_color_switch',
  recordTryonRequest: 'record_tryon_request',
  recordSubhubSelect: 'record_subhub_select',
  setCurrentSku: 'set_current_sku',
  recordTabView: 'record_tab_view', recordSaCall: 'record_sa_call',
} as const

export type SessionState = {
  currentSku: string | null
  taggedSkus: readonly string[]
  events: readonly SessionEvent[]
  intentScore: number
}

export type SessionAction =
  | { type: typeof SESSION_ACTIONS.recordFreeQuery; topic: string; text: string }
  | { type: typeof SESSION_ACTIONS.recordHubSelect; hubType: HubType }
  | { type: typeof SESSION_ACTIONS.recordNfcTag; sku: string }
  | { type: typeof SESSION_ACTIONS.recordProductExit; sku: string }
  | { type: typeof SESSION_ACTIONS.recordPriceInquiryRequest; sku: string }
  | { type: typeof SESSION_ACTIONS.recordPurchaseInquiry; sku: string }
  | { type: typeof SESSION_ACTIONS.recordSizeCheck; sku: string; size: string }
  | { type: typeof SESSION_ACTIONS.recordColorSwitch; sku: string; from: string; to: string }
  | { type: typeof SESSION_ACTIONS.recordTryonRequest; sku: string; size: string; color: string }
  | { type: typeof SESSION_ACTIONS.recordSubhubSelect; sub: StageCComingSoonScreenId }
  | { type: typeof SESSION_ACTIONS.setCurrentSku; sku: string }
  | { type: typeof SESSION_ACTIONS.recordTabView; topic: 'craft' | 'heritage' | 'styling'; sku: string }
  | { type: typeof SESSION_ACTIONS.recordSaCall; sku: string }
