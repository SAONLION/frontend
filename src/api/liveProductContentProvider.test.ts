import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../types/product'

const mocks = vi.hoisted(() => ({
  getHubOption: vi.fn(),
  getSkuDetail: vi.fn(),
  getSkus: vi.fn(),
  getServerProduct: vi.fn(),
  getStoredProductContext: vi.fn(),
  getStoredSessionId: vi.fn(),
  getProduct: vi.fn(),
  scanTag: vi.fn(),
  setServerProduct: vi.fn(),
}))

vi.mock('./products', () => ({
  getHubOption: mocks.getHubOption,
  getSkuDetail: mocks.getSkuDetail,
  getSkus: mocks.getSkus,
  scanTag: mocks.scanTag,
}))

vi.mock('../features/product-explore/serverProduct', () => ({
  getServerProduct: mocks.getServerProduct,
  setServerProduct: mocks.setServerProduct,
}))

vi.mock('../features/session/sessionStorage', () => ({
  getStoredProductContext: mocks.getStoredProductContext,
  getStoredSessionId: mocks.getStoredSessionId,
}))

vi.mock('../mocks/providers/mockProductContentProvider', () => ({
  mockProductContentProvider: { getProduct: mocks.getProduct },
}))

import { liveProductContentProvider } from './liveProductContentProvider'

const fixture: Product = {
  sku: 'tag-7',
  name: 'Fixture product',
  imageUrl: 'fixture-image',
  dimensions: 'fixture dimensions',
  sizeOptions: [{ code: 'SML', label: 'S', sku: 'tag-7', productName: 'Fixture product', dimensions: 'fixture dimensions' }],
  colorOptions: [{ code: 'cognac', label: 'Cognac', sku: 'tag-7', imageUrl: 'fixture-image', swatch: '#000000' }],
}

describe('liveProductContentProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getStoredProductContext.mockReturnValue(null)
    mocks.getStoredSessionId.mockReturnValue(null)
    mocks.getProduct.mockResolvedValue(fixture)
    mocks.getHubOption.mockResolvedValue(null)
  })

  it('maps available server SKU values while retaining fixture image fallback', async () => {
    mocks.getServerProduct.mockReturnValue({
      id: 7,
      name: 'Live product',
      category: 'bag',
      imageUrl: null,
      skuId: 70,
      sku: 'tag-7',
    })
    mocks.getSkus.mockResolvedValue([{ skuId: 70, color: 'Cognac', imageUrl: 'live-list-image' }])
    mocks.getSkuDetail.mockResolvedValue({
      skuId: 70,
      color: 'Cognac',
      size: 'SML, MED',
      images: [],
      dimensions: 'live dimensions',
      storage: 'live storage',
      strap: 'live strap',
    })

    const product = await liveProductContentProvider.getProduct('tag-7')

    expect(product).toMatchObject({
      name: 'Live product',
      imageUrl: 'fixture-image',
      dimensions: 'live dimensions',
      fitDetail: { strap: 'live strap', storage: 'live storage' },
    })
    expect(product?.sizeOptions?.map((option) => option.code)).toEqual(['SML', 'MED'])
  })

  it('returns the fixture when live product retrieval fails', async () => {
    mocks.getServerProduct.mockReturnValue({
      id: 8,
      name: 'Unavailable product',
      category: 'bag',
      imageUrl: null,
      skuId: 80,
      sku: 'tag-8',
    })
    mocks.getSkus.mockRejectedValue(new Error('network unavailable'))
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(liveProductContentProvider.getProduct('tag-8')).resolves.toBe(fixture)

    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
