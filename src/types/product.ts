export type SizeOption = {
  code: string
  label: string
  sku: string
  productName: string
  dimensions: string
}

export type ColorOption = {
  code: string
  label: string
  sku: string
  imageUrl: string
  swatch: string
}

export type Product = {
  sku: string
  name: string
  imageUrl: string
  dimensions: string
  detailImages?: readonly string[]
  productDetail?: { craft: readonly string[]; heritage: readonly string[]; styling: readonly string[] }
  fitDetail?: {
    strap: string
    storage: string
  }
  fitDefaults?: {
    sizeCode: string
    colorCode: string
  }
  sizeOptions?: readonly SizeOption[]
  colorOptions?: readonly ColorOption[]
}

export type ProductContentProviderValue = {
  getProduct: (sku: string) => Promise<Product | null>
}
