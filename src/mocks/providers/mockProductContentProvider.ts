import { mockProducts } from '../fixtures/products'
import type { ProductContentProviderValue } from '../../types/product'

export const mockProductContentProvider: ProductContentProviderValue = {
  getProduct: async (sku) => mockProducts.find((product) => product.sku === sku) ?? null,
}
