import { reissueSession } from './reissueSession'

/**
 * 종료된 세션에서 앱을 되살린다.
 *
 * **왜 필요한가.** 백엔드가 2026-08-19에 종료 세션의 쓰기를 막았다(409 `SESSION_ALREADY_ENDED`).
 * 그런데 `localStorage`의 `sessionId`는 그대로 남아 있어서, 한 번 종료된 세션을 물고 있으면
 * 이후 모든 기록이 계속 실패한다. **읽기는 막히지 않아서**(`journey-card` GET은 200)
 * 404를 보는 기존 재발급 경로로는 절대 빠져나올 수 없다.
 *
 * **왜 조용히 처리하는가.** 세션이 끝나는 경로는 SA의 종료 처리와 구매 확정뿐이다
 * (무활동 60분 자동 종료는 서버에 구현돼 있지 않다 — 2026-08-19 실측으로 70분 방치 세션에
 * 쓰기가 여전히 200이었다). 둘 다 **의도적으로 끝낸 세션**이라 이어가는 것이 오히려 틀리다.
 * 실제로 거의 발생하지 않으므로 안내 화면을 두지 않고 새 세션으로 조용히 갈아끼운다.
 */

const SESSION_ENDED_CODE = 'SESSION_ALREADY_ENDED'

type SessionIdListener = (sessionId: string) => void

const listeners = new Set<SessionIdListener>()

/** 동시에 여러 요청이 409를 받아도 세션을 한 번만 새로 판다. */
let inFlight: Promise<string> | null = null

export function isSessionEndedError(status: number, code: string | null): boolean {
  return status === 409 && code === SESSION_ENDED_CODE
}

/**
 * 새 세션을 발급하고 구독자에게 알린다. 이미 진행 중이면 그 약속을 함께 기다린다.
 *
 * 실패해도 던지지 않는다 — 이 함수를 부르는 곳은 이미 실패한 요청의 인터셉터라
 * 여기서 또 던지면 원래 오류가 가려진다.
 */
export function recoverFromEndedSession(): void {
  inFlight ??= reissueSession()
    .then((sessionId) => {
      listeners.forEach((listener) => listener(sessionId))
      return sessionId
    })
    .catch((error: unknown) => {
      console.error('종료된 세션을 새로 발급하지 못했습니다.', error)
      throw error
    })
    .finally(() => {
      inFlight = null
    })

  // 호출부가 결과를 기다리지 않으므로 미처리 거부가 되지 않게 여기서 삼킨다.
  void inFlight.catch(() => {})
}

export function subscribeSessionReissued(listener: SessionIdListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
