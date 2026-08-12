import type { ColorOption, Product, SizeOption } from '../../types/product'

export type FitSelection = {
  size: SizeOption
  color: ColorOption
}

export function getFitSelection(product: Product, search: URLSearchParams): FitSelection | null {
  const sizes = product.sizeOptions ?? []
  const colors = product.colorOptions ?? []
  const defaultSize = sizes.find((option) => option.sku === product.sku)
    ?? sizes.find((option) => option.code === product.fitDefaults?.sizeCode)
  const defaultColor = colors.find((option) => option.sku === product.sku)
    ?? colors.find((option) => option.code === product.fitDefaults?.colorCode)
  const requestedSize = search.get('size')
  const requestedColor = search.get('color')
  const size = requestedSize ? sizes.find((option) => option.code === requestedSize) : defaultSize
  const color = requestedColor ? colors.find((option) => option.code === requestedColor) : defaultColor

  return size && color ? { size, color } : null
}

export function fitSearchPath(path: string, selection: FitSelection): string {
  return `${path}?size=${encodeURIComponent(selection.size.code)}&color=${encodeURIComponent(selection.color.code)}`
}
