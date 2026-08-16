import type { BlockerCode, BlockerTriggerId, FreeQueryTopic, HubType, SessionEvent, StaffCallType } from '../../constants/events'
import type { StageCComingSoonScreenId } from '../../constants/stageC'

export const SESSION_ACTIONS = {
  recordActionAccepted: 'record_action_accepted',
  recordActionDeclined: 'record_action_declined',
  recordActionImpression: 'record_action_impression',
  recordBlockerDetected: 'record_blocker_detected',
  recordContactCaptured: 'record_contact_captured',
  recordContactOffer: 'record_contact_offer',
  recordContentSent: 'record_content_sent',
  recordFreeQuery: 'record_free_query',
  recordAiAnswer: 'record_ai_answer',
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
  setNickname: 'set_nickname',
  recordTabView: 'record_tab_view', recordSaCall: 'record_sa_call',
  setVisitPurpose: 'set_visit_purpose',
  setActiveOverlay: 'set_active_overlay',
  setSessionId: 'set_session_id',
  setProductId: 'set_product_id',
  setCurrentSkuId: 'set_current_sku_id',
} as const

export type ActiveOverlay = 'E' | null

export type SessionState = {
  pseudonymousId: string
  sessionId: string | null
  productId: number | null
  currentSkuId: number | null
  currentSku: string | null
  nickname: string | null
  taggedSkus: readonly string[]
  events: readonly SessionEvent[]
  freeQueryContexts: Readonly<Record<string, { sku: string }>>
  aiAnswerContexts: Readonly<Record<string, { queryId: string; sku: string }>>
  intentScore: number
  visitPurpose: string | null
  activeOverlay: ActiveOverlay
  blocker: {
    cb6Handled: boolean
    contactCaptured: boolean
  }
}

export type SessionAction =
  | { type: typeof SESSION_ACTIONS.recordActionAccepted; code: BlockerCode }
  | { type: typeof SESSION_ACTIONS.recordActionDeclined; code: BlockerCode }
  | { type: typeof SESSION_ACTIONS.recordActionImpression; code: BlockerCode; triggerId: BlockerTriggerId }
  | { type: typeof SESSION_ACTIONS.recordBlockerDetected; code: BlockerCode; triggerId: BlockerTriggerId }
  | { type: typeof SESSION_ACTIONS.recordContactCaptured; channel: 'email'; blockerCode: 'CB6' }
  | { type: typeof SESSION_ACTIONS.recordContactOffer; blockerCode: 'CB6' }
  | { type: typeof SESSION_ACTIONS.recordContentSent; sku: string }
  | { type: typeof SESSION_ACTIONS.recordFreeQuery; sku: string; topic: FreeQueryTopic; text: string }
  | { type: typeof SESSION_ACTIONS.recordAiAnswer; queryId: string; sku: string; topic: FreeQueryTopic; resolved: boolean }
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
  | { type: typeof SESSION_ACTIONS.setNickname; nickname: string }
  | { type: typeof SESSION_ACTIONS.recordTabView; topic: 'craft' | 'heritage' | 'styling'; sku: string }
  | { type: typeof SESSION_ACTIONS.recordSaCall; sku: string; callType: StaffCallType; queryId?: string }
  | { type: typeof SESSION_ACTIONS.setVisitPurpose; visitPurpose: string }
  | { type: typeof SESSION_ACTIONS.setActiveOverlay; overlay: ActiveOverlay }
  | { type: typeof SESSION_ACTIONS.setSessionId; sessionId: string }
  | { type: typeof SESSION_ACTIONS.setProductId; productId: number }
  | { type: typeof SESSION_ACTIONS.setCurrentSkuId; skuId: number }
