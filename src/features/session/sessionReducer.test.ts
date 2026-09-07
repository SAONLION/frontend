import { describe, expect, it } from 'vitest'
import { EVENT_NAMES } from '../../constants/events'
import { initialSessionState, sessionReducer } from './sessionReducer'
import { SESSION_ACTIONS, type SessionState } from './sessionTypes'

function createState(overrides: Partial<SessionState> = {}): SessionState {
  return {
    ...initialSessionState,
    pseudonymousId: 'session-test',
    events: [],
    taggedSkus: [],
    freeQueryContexts: {},
    aiAnswerContexts: {},
    ...overrides,
  }
}

describe('sessionReducer', () => {
  it('keeps selections for the same scanned SKU and resets them for a new SKU', () => {
    const selected = createState({
      currentSku: 'sku-a',
      selectedSizeCode: 'SML',
      selectedColorCode: 'cognac',
    })

    const sameSku = sessionReducer(selected, { type: SESSION_ACTIONS.recordNfcTag, sku: 'sku-a' })
    const newSku = sessionReducer(sameSku, { type: SESSION_ACTIONS.recordNfcTag, sku: 'sku-b' })

    expect(sameSku.selectedSizeCode).toBe('SML')
    expect(sameSku.selectedColorCode).toBe('cognac')
    expect(newSku.selectedSizeCode).toBeNull()
    expect(newSku.selectedColorCode).toBeNull()
    expect(newSku.taggedSkus).toEqual(['sku-a', 'sku-b'])
    expect(newSku.intentScore).toBe(10)
  })

  it('records an AI answer only for the latest free query on the same SKU', () => {
    const withQuery = sessionReducer(createState(), {
      type: SESSION_ACTIONS.recordFreeQuery,
      sku: 'sku-a',
      topic: 'care',
      text: '관리 방법이 궁금해요',
    })
    const query = withQuery.events.find((event) => event.name === EVENT_NAMES.freeQuery)
    if (!query || query.name !== EVENT_NAMES.freeQuery) throw new Error('free query event was not recorded')

    const answered = sessionReducer(withQuery, {
      type: SESSION_ACTIONS.recordAiAnswer,
      queryId: query.id,
      sku: 'sku-a',
      topic: 'care',
      resolved: true,
    })
    const duplicated = sessionReducer(answered, {
      type: SESSION_ACTIONS.recordAiAnswer,
      queryId: query.id,
      sku: 'sku-a',
      topic: 'care',
      resolved: true,
    })

    expect(answered.events.at(-1)?.name).toBe(EVENT_NAMES.aiAnswer)
    expect(duplicated).toBe(answered)
  })
})
