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
  /** 그 색상으로 찍힌 다른 각도 컷. C3-2 갤러리는 선택한 색상의 컷만 보여준다. */
  detailImages?: readonly string[]
}

export type Product = {
  sku: string
  name: string
  imageUrl: string
  dimensions: string
  detailImages?: readonly string[]
  /** C2-3 스타일링 화면에 쓰는 모델 착장 컷. */
  stylingImages?: readonly string[]
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
