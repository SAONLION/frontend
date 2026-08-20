// api.tagonai.site OpenAPI 스펙(https://api.tagonai.site/v3/api-docs) 기준 요청/응답 타입.
// 필드명은 스펙 그대로 사용한다.

export type InterestType = 'PRODUCT_UNDERSTANDING' | 'FIT_PREFERENCE' | 'PURCHASE_CONDITION' | 'OTHER'

// --- Session ---
export type SessionCreateRequest = { language: string }
export type SessionCreateResponse = { sessionId: string; language: string; createdAt: string }

export type NicknameUpdateRequest = { nickname: string }
export type NicknameUpdateResponse = { sessionId: string; nickname: string }

export type SessionEndResponse = { sessionId: string; status: string; endedAt: string }

// --- VisitPurpose ---
export type VisitPurposeRequest = { purposeType: string }
export type VisitPurposeResponse = { purposeId: number; sessionId: string; purposeType: string; confirmedAt: string }
export type VisitPurposeStatusResponse = {
  answered: boolean
  purposeId?: number
  sessionId?: string
  purposeType?: string
  confirmedAt?: string
}

// --- TryonRequest ---
export type TryonRequestRequest = { sku: number; size: string; color: string }
export type TryonRequestResponse = {
  tryonRequestId: number
  sku: number
  size: string
  color: string
  requestedAt: string
}

// --- PurchaseInquiry ---
export type PurchaseInquiryRequest = { sku: number }
export type PurchaseInquiryResponse = { purchaseInquiryId: number; sku: number; inquiredAt: string }

// --- InternalTest (시연 전용) ---
export type StaffCallTestStatusRequest = { status: string }
/** 오프셋 없는 `LocalDateTime` 문자열(`2026-08-18T17:33:43`)을 보낸다. */
export type StaffCallTestRequestedAtRequest = { sessionId: string; requestedAt: string }
export type TryonRequestTestRequestedAtRequest = { sessionId: string; requestedAt: string }

// --- InteractionLog ---
export type InteractionLogRequest = { sku: number; interestType: InterestType; subOption?: string; durationSeconds?: number }
export type InteractionLogResponse = {
  interactionId: number
  sessionId: string
  sku: number
  interestType: InterestType
  subOption?: string
}

// --- Product ---
export type ProductSummaryDTO = { id: number; name: string; category: string; imageUrl: string }
export type HubOptionDTO = { type: InterestType; label: string }
export type ProductTagScanResponseDTO = { product: ProductSummaryDTO; hubOptions: readonly HubOptionDTO[] }

export type SubOptionDTO = {
  id: number
  label: string
  type: string
  mediation?: 'INFO' | 'STAFF_MEDIATED'
}

export type HubOptionResponse = {
  optionId: string
  type: 'INFO' | 'STAFF_MEDIATED'
  title: string
  content?: string
  nextStep: string
  pickupMethods?: readonly string[]
}

export type PickupCheckRequest = { pickupMethod: string; skuId: number }
export type PickupCheckResponse = { available: boolean; nextStep: string; message: string }

// --- Sku ---
export type SkuListItemResponse = { skuId: number; color: string; imageUrl: string }
export type SkuImageResponse = {
  url: string
  shotType: 'MODEL' | 'PRODUCT'
  /** 참고용 인물 노출 여부. 화면 분기는 shotType을 기준으로 한다. */
  hasPerson: boolean
}
export type SkuDetailResponse = {
  skuId: number
  color: string
  /** 콤마로 구분된 선택 가능 사이즈 목록. */
  size: string
  images: readonly SkuImageResponse[]
  /** 값이 없는 제품은 null이다. */
  dimensions: string | null
  /** 값이 없는 제품은 null이다. */
  storage: string | null
  /** 값이 없는 제품은 null이다. */
  strap: string | null
}

// --- StaffCall ---
export type StaffCallRequest = { productId?: number; reason: string }
export type StaffCallResponse = { callId: number; status: string; requestedAt: string }
export type StaffCallStatusResponse = { callId: number; status: string; displayMessage: string; updatedAt: string }

// --- Contact ---
export type ContactRequest = { actionId?: number; productId?: number; email: string; contentTopic?: string }
export type ContactResponse = { contactId: number; contentSent: boolean; sentAt: string }

// --- PendingAction ---
export type PendingActionOptionDTO = { key: string; label: string }
export type PendingActionDetailDTO = {
  actionId: number
  blockerType: string
  ruleGroup?: string
  triggerId?: string
  tier?: number
  productId: number | null
  popupTitle: string
  popupBody: string | null
  options: readonly PendingActionOptionDTO[]
}
export type PendingActionResponse = { hasAction: boolean; action?: PendingActionDetailDTO }

export type StockCheckResultDTO = { message: string; storeName: string; stock: boolean }
export type RespondRequest = { responseKey: string }
export type RespondResponse = {
  actionId: number
  recordedResponse: string
  actionNextStep: string
  result?: StockCheckResultDTO
}

// --- QnA (POST /api/v1/products/{productId}/qna) ---
export const QNA_QUESTION_TYPES = [
  'AS_REPAIR',
  'CARE',
  'GIFT_WRAP',
  'TAX_REFUND',
  'SHIPPING_RETURN',
  'FREE_TEXT',
] as const
export type QnaQuestionType = (typeof QNA_QUESTION_TYPES)[number]
/** `question`은 FREE_TEXT일 때만 의미가 있다. 나머지 타입은 서버가 정형 답변을 돌려준다. */
export type QnaRequest = { questionType: QnaQuestionType; question?: string }
export type QnaResponse = { answer: string; resolved: boolean }
