import { describe, expect, it } from 'vitest'
import { getColorSelectionKey, getKoreanColorLabel, isSameColorSelection } from './colorLabels'

describe('color selection normalization', () => {
  it('treats spacing and separator variants as the same color', () => {
    expect(getColorSelectionKey(' Soft-Pink ')).toBe('soft pink')
    expect(isSameColorSelection('Soft Pink', 'soft-pink')).toBe(true)
  })

  it('uses a Korean display label only for known colors', () => {
    expect(getKoreanColorLabel('Cognac')).toBe('코냑')
    expect(getKoreanColorLabel('Future Color')).toBe('Future Color')
  })
})
