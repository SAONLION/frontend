/**
 * 태그 스캔으로 확인한 서버 제품.
 *
 * `ProductContentProvider`는 `SessionProvider` 바깥에 주입되어 세션 상태를 읽을 수 없다.
 * Provider를 안으로 옮기면 Mock/Live 교체 지점이 컴포넌트 트리에 묶여 버리므로,
 * `activeStaffCall`과 같은 모듈 전역 store로 값을 건넨다.
 */

export type ServerProduct = {
  id: number
  name: string
  category: string
  imageUrl: string | null
  /** 태그 스캔에 사용한 ID. 현재 서버 계약에서 SKU ID와 같다. */
  skuId: number
  /**
   * 현재 화면 URL의 제품 키. 서버 제품과 화면을 묶어, 다른 제품의 서버 값이 남지 않게 한다.
   */
  sku: string
}

let serverProduct: ServerProduct | null = null

export function setServerProduct(product: ServerProduct | null): void {
  serverProduct = product
}

export function getServerProduct(): ServerProduct | null {
  return serverProduct
}
