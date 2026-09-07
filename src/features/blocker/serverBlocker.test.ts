import { describe, expect, it } from 'vitest'
import { isCustomerFacingBlocker, toBlockerTriggerId, toCustomerBlockerCode } from './serverBlocker'

describe('server blocker mapping', () => {
  it('uses ruleGroup before the generic blocker type', () => {
    expect(toCustomerBlockerCode('CONTENT_OFFER', 'cb6')).toBe('CB6')
  })

  it('keeps customer popups limited to supported blocker codes', () => {
    expect(isCustomerFacingBlocker('CB1')).toBe(false)
    expect(isCustomerFacingBlocker('CB3')).toBe(true)
    expect(toCustomerBlockerCode('UNKNOWN')).toBeNull()
  })

  it('uses the safe server fallback for unknown trigger IDs', () => {
    expect(toBlockerTriggerId('T-CB6-a')).toBe('T-CB6-a')
    expect(toBlockerTriggerId('missing-trigger')).toBe('T-SERVER')
  })
})
