const SESSION_ID_STORAGE_KEY = 'tagon.sessionId'
const PRODUCT_CONTEXT_STORAGE_KEY = 'tagon.productContext'
const BLOCKER_EXPOSURE_STORAGE_KEY = 'tagon.blockerExposure'

/** 고객에게는 CB3과 통합 콘텐츠 제안(CB5·CB6)을 세션당 한 번씩만 보여준다. */
export type BlockerExposureGroup = 'CB3' | 'CB56'

type StoredBlockerExposure = {
  sessionId: string
  groups: readonly BlockerExposureGroup[]
}

export type StoredServerProduct = {
  id: number
  name: string
  category: string
  imageUrl: string | null
  skuId: number
  sku: string
}

/**
 * 서버 제품 식별자. 인터랙션 로그·착장 요청·구매 문의·직원 호출이 모두 이 값에 의존하는데
 * B2 태그 스캔에서만 채워진다. 메모리에만 두면 STAGE C에서 새로고침하거나 PWA에서 앱을
 * 전환했다 돌아올 때 네 기록이 전부 건너뛰어진다.
 */
export type StoredProductContext = {
  /** 이 문맥이 속한 세션. 세션이 바뀌면 버린다. */
  sessionId: string
  productId: number | null
  currentSkuId: number | null
  currentSku: string | null
  /** 새로고침 뒤 Live mapper가 제품을 재조회하는 데 쓰는 비PII 제품 요약. */
  serverProduct: StoredServerProduct | null
}

function readStoredServerProduct(value: unknown): StoredServerProduct | null {
  if (typeof value !== 'object' || value === null) return null
  const product = value as Partial<StoredServerProduct>
  if (
    typeof product.id !== 'number'
    || typeof product.name !== 'string'
    || typeof product.category !== 'string'
    || (product.imageUrl !== null && typeof product.imageUrl !== 'string')
    || typeof product.skuId !== 'number'
    || typeof product.sku !== 'string'
  ) return null
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    imageUrl: product.imageUrl,
    skuId: product.skuId,
    sku: product.sku,
  }
}

export function getStoredProductContext(): StoredProductContext | null {
  try {
    const raw = window.localStorage.getItem(PRODUCT_CONTEXT_STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    const value = parsed as Partial<StoredProductContext>
    if (typeof value.sessionId !== 'string') return null

    return {
      sessionId: value.sessionId,
      productId: typeof value.productId === 'number' ? value.productId : null,
      currentSkuId: typeof value.currentSkuId === 'number' ? value.currentSkuId : null,
      currentSku: typeof value.currentSku === 'string' ? value.currentSku : null,
      serverProduct: readStoredServerProduct(value.serverProduct),
    }
  } catch {
    return null
  }
}

export function setStoredProductContext(context: StoredProductContext): void {
  try {
    window.localStorage.setItem(PRODUCT_CONTEXT_STORAGE_KEY, JSON.stringify(context))
  } catch {
    // ignore
  }
}

export function clearStoredProductContext(): void {
  try {
    window.localStorage.removeItem(PRODUCT_CONTEXT_STORAGE_KEY)
  } catch {
    // ignore
  }
}

// localStorage가 막힌 환경(시크릿 모드 등)에서도 세션 자체는 계속 동작해야 하므로 방어적으로 처리한다.
export function getStoredSessionId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_ID_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredSessionId(sessionId: string): void {
  try {
    window.localStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId)
  } catch {
    // ignore
  }
}

export function clearStoredSessionId(): void {
  try {
    window.localStorage.removeItem(SESSION_ID_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function getStoredBlockerExposureGroups(sessionId: string): ReadonlySet<BlockerExposureGroup> {
  try {
    const raw = window.localStorage.getItem(BLOCKER_EXPOSURE_STORAGE_KEY)
    if (!raw) return new Set()

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return new Set()
    const value = parsed as Partial<StoredBlockerExposure>
    if (value.sessionId !== sessionId || !Array.isArray(value.groups)) return new Set()

    return new Set(value.groups.filter((group): group is BlockerExposureGroup => group === 'CB3' || group === 'CB56'))
  } catch {
    return new Set()
  }
}

export function setStoredBlockerExposureGroups(sessionId: string, groups: ReadonlySet<BlockerExposureGroup>): void {
  try {
    window.localStorage.setItem(BLOCKER_EXPOSURE_STORAGE_KEY, JSON.stringify({
      sessionId,
      groups: [...groups],
    } satisfies StoredBlockerExposure))
  } catch {
    // ignore
  }
}
