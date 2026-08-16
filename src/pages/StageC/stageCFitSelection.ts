import type { ColorOption, Product, SizeOption } from '../../types/product'

export type FitSelection = {
  size: SizeOption
  color: ColorOption
}

export type FitSelectionFallback = {
  sizeCode?: string | null
  colorCode?: string | null
}

/**
 * 선택 우선순위는 URL 쿼리 → 세션에 남은 선택 → 제품 기본값이다.
 * 세션 값을 중간에 두어야 컬러를 바꾼 뒤 뒤로 가도 그 색이 유지된다.
 */
export function getFitSelection(
  product: Product,
  search: URLSearchParams,
  fallback: FitSelectionFallback = {},
): FitSelection | null {
  const sizes = product.sizeOptions ?? []
  const colors = product.colorOptions ?? []
  const defaultSize = sizes.find((option) => option.sku === product.sku)
    ?? sizes.find((option) => option.code === product.fitDefaults?.sizeCode)
  const defaultColor = colors.find((option) => option.sku === product.sku)
    ?? colors.find((option) => option.code === product.fitDefaults?.colorCode)
  const requestedSize = search.get('size') ?? fallback.sizeCode
  const requestedColor = search.get('color') ?? fallback.colorCode
  const size = (requestedSize ? sizes.find((option) => option.code === requestedSize) : undefined) ?? defaultSize
  const color = (requestedColor ? colors.find((option) => option.code === requestedColor) : undefined) ?? defaultColor

  return size && color ? { size, color } : null
}

export function fitSearchPath(path: string, selection: FitSelection): string {
  return `${path}?size=${encodeURIComponent(selection.size.code)}&color=${encodeURIComponent(selection.color.code)}`
}
