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
  /** 인물이 포함된 해당 색상 모델 컷. 스타일링·코디 화면에서만 사용한다. */
  stylingImages?: readonly string[]
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
  /** 두 화면이 공유하는 제조국. 카탈로그 전 상품이 갖고 있는 값이다. */
  origin?: string
  /** C3-1 사이즈 화면의 부가 정보. 없는 항목은 그 줄을 감춘다. */
  fitDetail?: {
    strap?: string
    storage?: string
  }
  /** C2-1 소재 화면의 항목. 없는 항목은 그 줄을 감춘다. */
  materialDetail?: {
    material?: string
    hardware?: string
    lining?: string
    /** 인증이 있는 상품에만 있다(가방 기준 19%). */
    sustainability?: string
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
