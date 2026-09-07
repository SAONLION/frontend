import { describe, expect, it } from 'vitest'
import { mockProducts } from '../../mocks/fixtures/products'
import { fitSearchPath, getFitSelection } from './stageCFitSelection'

const product = mockProducts[0]

describe('getFitSelection', () => {
  it('prioritizes URL query values over session selection and product defaults', () => {
    const selection = getFitSelection(
      product,
      new URLSearchParams('size=MED&color=Soft%20Pink'),
      { sizeCode: 'SML', colorCode: 'cognac' },
    )

    expect(selection?.size.code).toBe('MED')
    expect(selection?.color.code).toBe('soft-pink')
  })

  it('uses a session selection when the URL has no matching values', () => {
    const selection = getFitSelection(
      product,
      new URLSearchParams('size=UNKNOWN&color=UNKNOWN'),
      { sizeCode: 'MNI', colorCode: 'black' },
    )

    expect(selection?.size.code).toBe('MNI')
    expect(selection?.color.code).toBe('black')
  })

  it('returns null when a product has no selectable size or color', () => {
    expect(getFitSelection({ ...product, sizeOptions: [], colorOptions: [] }, new URLSearchParams())).toBeNull()
  })
})

describe('fitSearchPath', () => {
  it('preserves both selected codes as encoded query parameters', () => {
    const selection = getFitSelection(product, new URLSearchParams('size=SMD&color=soft-pink'))
    if (!selection) throw new Error('fixture should provide a fit selection')

    expect(fitSearchPath('/stage-c/test/fit', selection)).toBe('/stage-c/test/fit?size=SMD&color=soft-pink')
  })
})
