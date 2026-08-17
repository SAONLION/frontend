/**
 * 진행 중인 직원 호출의 서버 callId.
 *
 * `realStaffCallService`가 폴링 클로저 안에 들고 있어서 밖에서는 알 수 없었다.
 * 개발 진단 패널이 시연용 상태 변경 API를 호출하려면 이 값이 필요하다.
 * 나중에 공통 호출 상태 머신을 만들 때 여기로 상태를 함께 옮긴다.
 */

let activeCallId: number | null = null
const listeners = new Set<() => void>()

export function setActiveStaffCallId(callId: number | null): void {
  if (activeCallId === callId) return
  activeCallId = callId
  listeners.forEach((listener) => listener())
}

export function getActiveStaffCallId(): number | null {
  return activeCallId
}

export function subscribeActiveStaffCall(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
