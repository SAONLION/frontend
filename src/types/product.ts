export type Product = {
  sku: string
  name: string
  imageUrl: string
  dimensions: string
  detailImages?: readonly string[]
  productDetail?: { craft: readonly string[]; heritage: readonly string[]; styling: readonly string[] }
}

export type ProductContentProviderValue = {
  getProduct: (sku: string) => Promise<Product | null>
}
