const SESSION_ID_STORAGE_KEY = 'tagon.sessionId'
const PRODUCT_CONTEXT_STORAGE_KEY = 'tagon.productContext'

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
