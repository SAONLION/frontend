import type { Product } from '../../types/product'

/**
 * 화면에 보여줄 제품 이름을 고른다.
 *
 * MCM의 여행 가방은 사이즈마다 이름이 다르다 — 같은 Ottomar 위켄더라도
 * `41cm / 16.14인치 …`와 `50.5cm / 19.9인치 …`가 별개의 이름이다. 그래서 사이즈를 고른 뒤에는
 * 제품 최상위 `name`이 아니라 **그 사이즈의 `productName`**을 보여줘야 한다.
 * 최상위 `name`은 기본 사이즈의 이름이라, 사이즈를 바꿔도 그대로면 다른 제품처럼 읽힌다.
 *
 * 사이즈를 고르기 전이거나 해당 사이즈에 이름이 없으면 최상위 `name`으로 되돌아간다.
 */
export function resolveProductDisplayName(product: Product, selectedSizeCode: string | null): string {
  if (!selectedSizeCode) return product.name
  const size = product.sizeOptions?.find((option) => option.code === selectedSizeCode)
  return size?.productName ?? product.name
}
