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
  /**
   * 이 서버 제품이 어느 fixture 제품을 대신해 스캔됐는지.
   *
   * 화면은 URL의 style number로 fixture를 찾고 서버 값은 이 store에서 따로 온다. 둘을 묶어 두지
   * 않으면 서로 다른 제품이 한 화면에 섞인다 — D2-1·D4에서 추천 제품을 누르면 `scanTag`을 거치지
   * 않고 C1으로 바로 가므로, 이 값이 없으면 직전 스캔의 제품명이 그대로 남는다.
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
