import { beforeEach, describe, expect, it } from 'vitest'
import {
  consumeBlockerExposureGroup,
  getStoredBlockerExposureGroups,
  MAX_BLOCKER_EXPOSURES_BY_GROUP,
  setStoredBlockerExposureGroups,
} from './sessionStorage'

describe('blocker exposure storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('soaks up the remaining CB56 exposures when the customer asks for the content first', () => {
    consumeBlockerExposureGroup('session-1', 'CB56')

    const counts = getStoredBlockerExposureGroups('session-1')
    expect(counts.get('CB56')).toBe(MAX_BLOCKER_EXPOSURES_BY_GROUP.CB56)
    expect(counts.get('CB3')).toBeUndefined()
  })

  it('keeps other groups intact and ignores counts from a previous session', () => {
    setStoredBlockerExposureGroups('session-1', new Map([['CB3', 1]]))
    consumeBlockerExposureGroup('session-1', 'CB56')

    expect(getStoredBlockerExposureGroups('session-1').get('CB3')).toBe(1)
    expect(getStoredBlockerExposureGroups('session-2').size).toBe(0)
  })
})
