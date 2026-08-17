/**
 * 여권 버튼이 "제품이 늘었다"를 알리는 표식.
 *
 * 흔들림은 **누를 때까지** 유지된다. 한 번만 흔들면 다른 화면을 보던 사이에 놓치기 쉽다.
 *
 * `JourneyCardTrigger`는 화면이 바뀔 때마다 재마운트되므로(`AppLayout`의 `key`)
 * 컴포넌트 지역 상태로는 표식을 이어갈 수 없다. 모듈 수준에 두고 구독으로 알린다.
 */

let pending = false
let lastSeenCount = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

/** 태그 수가 늘었으면 알림 표식을 세운다. 이미 서 있으면 그대로 둔다. */
export function markJourneyPulse(taggedCount: number): void {
  if (taggedCount <= lastSeenCount) {
    // 세션이 새로 시작돼 개수가 줄어든 경우도 여기서 맞춰둔다.
    lastSeenCount = taggedCount
    return
  }
  lastSeenCount = taggedCount
  if (pending) return
  pending = true
  emit()
}

/** 고객이 여권을 열었다. 알림 역할이 끝났다. */
export function clearJourneyPulse(): void {
  if (!pending) return
  pending = false
  emit()
}

export function getJourneyPulse(): boolean {
  return pending
}

export function subscribeJourneyPulse(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function resetJourneyPulse(): void {
  pending = false
  lastSeenCount = 0
  emit()
}
