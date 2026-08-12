import { EVENT_NAMES, type SessionEvent } from '../../constants/events'
import type { SessionState } from './sessionTypes'

export type FreeQueryEvent = Extract<SessionEvent, { name: typeof EVENT_NAMES.freeQuery }>

export function findLatestFreeQueryForSku(state: SessionState, sku: string): { event: FreeQueryEvent; index: number } | null {
  for (let index = state.events.length - 1; index >= 0; index -= 1) {
    const event = state.events[index]
    if (event.name === EVENT_NAMES.freeQuery && state.freeQueryContexts[event.id]?.sku === sku) {
      return { event, index }
    }
  }
  return null
}

export function hasOtherStaffCallForQuery(state: SessionState, sku: string, queryIndex: number): boolean {
  return state.events.slice(queryIndex + 1).some(
    (event) => event.name === EVENT_NAMES.saCall && event.type === 'other' && event.sku === sku,
  )
}
