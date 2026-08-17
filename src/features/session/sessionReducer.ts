import { EVENT_ID_PREFIX, EVENT_NAMES } from '../../constants/events'
import { findLatestFreeQueryForSku } from './freeQueryContext'
import { SESSION_ACTIONS, type SessionAction, type SessionState } from './sessionTypes'

export const initialSessionState: SessionState = {
  pseudonymousId: `session-${crypto.randomUUID()}`,
  sessionId: null,
  productId: null,
  currentSkuId: null,
  currentSku: null,
  selectedSizeCode: null,
  selectedColorCode: null,
  nickname: null,
  taggedSkus: [],
  events: [],
  freeQueryContexts: {},
  aiAnswerContexts: {},
  intentScore: 0,
  visitPurpose: null,
  activeOverlay: null,
  blocker: { cb6Handled: false, contactCaptured: false },
}

function createEventId(): string {
  return `${EVENT_ID_PREFIX}${crypto.randomUUID()}`
}

function createTimestamp(): string {
  return new Date().toISOString()
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const id = createEventId()
  const createdAt = createTimestamp()

  switch (action.type) {
    case SESSION_ACTIONS.recordBlockerDetected:
      if (state.events.some((event) => event.name === EVENT_NAMES.blockerDetected && event.code === action.code && event.triggerId === action.triggerId)) return state
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.blockerDetected, code: action.code, triggerId: action.triggerId, stage: 'F', tier: 'primary', ruleVersion: 'v2.2', createdAt }] }
    case SESSION_ACTIONS.recordActionImpression:
      if (state.events.some((event) => event.name === EVENT_NAMES.actionImpression && event.code === action.code && event.triggerId === action.triggerId)) return state
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.actionImpression, code: action.code, triggerId: action.triggerId, createdAt }] }
    case SESSION_ACTIONS.recordActionAccepted:
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.actionAccepted, code: action.code, createdAt }] }
    case SESSION_ACTIONS.recordActionDeclined:
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.actionDeclined, code: action.code, createdAt }], blocker: action.code === 'CB6' ? { ...state.blocker, cb6Handled: true } : state.blocker }
    case SESSION_ACTIONS.recordContactOffer:
      if (state.events.some((event) => event.name === EVENT_NAMES.contactOffer && event.blockerCode === action.blockerCode)) return state
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.contactOffer, blockerCode: action.blockerCode, createdAt }] }
    case SESSION_ACTIONS.recordContactCaptured:
      if (state.blocker.contactCaptured) return state
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.contactCaptured, channel: action.channel, blockerCode: action.blockerCode, pseudonymousId: state.pseudonymousId, createdAt }], blocker: { ...state.blocker, contactCaptured: true, cb6Handled: true } }
    case SESSION_ACTIONS.recordContentSent:
      if (state.events.some((event) => event.name === EVENT_NAMES.contentSent && event.sku === action.sku)) return state
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.contentSent, type: 'personalized_product_content', sku: action.sku, createdAt }] }
    case SESSION_ACTIONS.setCurrentSku:
      // 다른 제품으로 넘어가면 이전 제품의 사이즈·컬러 선택은 의미가 없다.
      if (state.currentSku === action.sku) return state
      return { ...state, currentSku: action.sku, selectedSizeCode: null, selectedColorCode: null }
    case SESSION_ACTIONS.setNickname:
      return { ...state, nickname: action.nickname }
    case SESSION_ACTIONS.recordNfcTag:
      return {
        ...state,
        currentSku: action.sku,
        selectedSizeCode: state.currentSku === action.sku ? state.selectedSizeCode : null,
        selectedColorCode: state.currentSku === action.sku ? state.selectedColorCode : null,
        taggedSkus: state.taggedSkus.includes(action.sku) ? state.taggedSkus : [...state.taggedSkus, action.sku],
        events: [...state.events, { id, name: EVENT_NAMES.nfcTag, sku: action.sku, createdAt }],
        intentScore: state.intentScore + 5,
      }
    case SESSION_ACTIONS.recordHubSelect:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.hubSelect, type: action.hubType, createdAt }],
        intentScore: state.intentScore + 2,
      }
    case SESSION_ACTIONS.recordSubhubSelect:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.subhubSelect, sub: action.sub, createdAt }],
        intentScore: state.intentScore + 3,
      }
    case SESSION_ACTIONS.recordFreeQuery:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.freeQuery, topic: action.topic, text: action.text, createdAt }],
        freeQueryContexts: { ...state.freeQueryContexts, [id]: { sku: action.sku } },
    }
    case SESSION_ACTIONS.recordAiAnswer: {
      const query = state.events.find((event) => event.id === action.queryId)
      const latestQueryForSku = findLatestFreeQueryForSku(state, action.sku)
      const alreadyAnswered = Object.values(state.aiAnswerContexts).some(
        (context) => context.queryId === action.queryId && context.sku === action.sku,
      )

      if (
        query?.name !== EVENT_NAMES.freeQuery
        || state.freeQueryContexts[action.queryId]?.sku !== action.sku
        || latestQueryForSku?.event.id !== action.queryId
        || query.topic !== action.topic
        || alreadyAnswered
      ) {
        return state
      }

      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.aiAnswer, topic: action.topic, resolved: action.resolved, createdAt }],
        aiAnswerContexts: { ...state.aiAnswerContexts, [id]: { queryId: action.queryId, sku: action.sku } },
      }
    }
    case SESSION_ACTIONS.recordPurchaseInquiry:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.purchaseInquiry, sku: action.sku, createdAt }],
        intentScore: state.intentScore + 35,
      }
    case SESSION_ACTIONS.recordSizeCheck:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.sizeCheck, sku: action.sku, size: action.size, createdAt }],
        selectedSizeCode: action.size,
        intentScore: state.intentScore + 15,
      }
    case SESSION_ACTIONS.recordColorSwitch:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.colorSwitch, sku: action.sku, from: action.from, to: action.to, createdAt }],
        selectedColorCode: action.to,
      }
    case SESSION_ACTIONS.recordTryonRequest:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.tryonRequest, sku: action.sku, size: action.size, color: action.color, createdAt }],
        intentScore: state.intentScore + 30,
      }
    case SESSION_ACTIONS.recordProductExit:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.productExit, sku: action.sku, createdAt }],
        intentScore: state.intentScore - 5,
      }
    case SESSION_ACTIONS.recordPriceInquiryRequest:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.priceInquiryRequest, sku: action.sku, createdAt }],
        intentScore: state.intentScore + 15,
      }
    case SESSION_ACTIONS.recordTabView:
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.tabView, topic: action.topic, sku: action.sku, createdAt }] }
    case SESSION_ACTIONS.recordSaCall: {
      if (action.queryId) {
        const queryIndex = state.events.findIndex((event) => event.id === action.queryId)
        const queryEvent = state.events[queryIndex]
        const queryContext = state.freeQueryContexts[action.queryId]
        const latestQueryForSku = findLatestFreeQueryForSku(state, action.sku)
        const hasCallForQuery = state.events.slice(queryIndex + 1).some(
          (event) => event.name === EVENT_NAMES.saCall && event.type === action.callType && event.sku === action.sku,
        )
        if (
          queryIndex < 0
          || queryEvent?.name !== EVENT_NAMES.freeQuery
          || queryContext?.sku !== action.sku
          || latestQueryForSku?.event.id !== action.queryId
          || hasCallForQuery
        ) return state
      }
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.saCall, type: action.callType, sku: action.sku, createdAt }] }
    }
    case SESSION_ACTIONS.setVisitPurpose:
      return { ...state, visitPurpose: action.visitPurpose }
    case SESSION_ACTIONS.setActiveOverlay:
      return { ...state, activeOverlay: action.overlay }
    case SESSION_ACTIONS.setSessionId:
      return { ...state, sessionId: action.sessionId }
    case SESSION_ACTIONS.setProductId:
      return { ...state, productId: action.productId }
    case SESSION_ACTIONS.setCurrentSkuId:
      return { ...state, currentSkuId: action.skuId }
    case SESSION_ACTIONS.restoreProductContext:
      // 새로고침 복구 경로다. 이벤트를 만들지 않고 식별자만 되돌린다 —
      // 여기서 nfc_tag를 다시 기록하면 태그 이력과 Intent Score가 부풀려진다.
      return {
        ...state,
        productId: action.productId,
        currentSkuId: action.currentSkuId,
        currentSku: action.currentSku ?? state.currentSku,
      }
  }
}
