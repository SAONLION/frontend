export type Product = {
  sku: string
  name: string
  imageUrl: string
  dimensions: string
}

export type ProductContentProviderValue = {
  getProduct: (sku: string) => Promise<Product | null>
}
