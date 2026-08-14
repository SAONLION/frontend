import type { BlockerTriggerId } from './blockerTypes'
import type { SessionState } from '../session/sessionTypes'

/**
 * Production CB6 needs server-visible purchase and SA engagement events plus a
 * scheduler. The customer-only demo must not invert the 15/3 minute rules by
 * treating a recent signal as an immediate trigger.
 */
export function getCb6TriggerId(_state: SessionState, _sku: string, _now = Date.now()): BlockerTriggerId | null {
  return null
}

export function shouldOfferCb6(state: SessionState, sku: string, now = Date.now()): boolean {
  return getCb6TriggerId(state, sku, now) !== null
}
