const SESSION_ID_STORAGE_KEY = 'tagon.sessionId'

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
