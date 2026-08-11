import { EVENT_ID_PREFIX, EVENT_NAMES } from '../../constants/events'
import { SESSION_ACTIONS, type SessionAction, type SessionState } from './sessionTypes'

export const initialSessionState: SessionState = {
  currentSku: null,
  taggedSkus: [],
  events: [],
  intentScore: 0,
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
    case SESSION_ACTIONS.setCurrentSku:
      return { ...state, currentSku: action.sku }
    case SESSION_ACTIONS.recordNfcTag:
      return {
        ...state,
        currentSku: action.sku,
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
        intentScore: state.intentScore + 15,
      }
    case SESSION_ACTIONS.recordColorSwitch:
      return {
        ...state,
        events: [...state.events, { id, name: EVENT_NAMES.colorSwitch, sku: action.sku, from: action.from, to: action.to, createdAt }],
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
    case SESSION_ACTIONS.recordSaCall:
      return { ...state, events: [...state.events, { id, name: EVENT_NAMES.saCall, type: 'info', sku: action.sku, createdAt }] }
  }
}
