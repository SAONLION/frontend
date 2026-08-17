/**
 * 서버 호출이 실패해 화면이 대체 데이터로 진행 중이라는 사실을 앱 전역에 알린다.
 *
 * 조회 실패는 흐름을 막지 않고 폴백하는 것이 이 앱의 원칙이라, 실패해도 화면은
 * 그대로 넘어간다. 그 결과 "지금 보이는 게 서버 값인지 대체 값인지" 구분할 수 없어
 * 연동 확인이 어려웠다. 이 저장소는 그 구분을 화면에 드러내기 위한 것이다.
 *
 * D2·D3의 `데모 추천` 안내처럼 화면 안에서 직접 표시하는 폴백은 여기에 넣지 않는다.
 * 그쪽은 화면 지역 상태로 충분하고 표시 위치도 화면마다 다르다.
 */

export const DEGRADATION_KEYS = {
  session: 'session',
  tagScan: 'tag-scan',
  journeyCard: 'journey-card',
  staffCall: 'staff-call',
  tryOn: 'try-on',
  purchaseInquiry: 'purchase-inquiry',
} as const

export type DegradationKey = (typeof DEGRADATION_KEYS)[keyof typeof DEGRADATION_KEYS]

const MESSAGES: Record<DegradationKey, string> = {
  [DEGRADATION_KEYS.session]: '세션을 만들지 못했어요. 기록이 서버에 남지 않는 상태로 둘러보는 중이에요.',
  [DEGRADATION_KEYS.tagScan]: '제품 정보를 서버에서 받지 못해 기본 제품으로 안내하고 있어요.',
  [DEGRADATION_KEYS.journeyCard]: '여권 카드를 불러오지 못했어요. 태그한 제품이 카드에 반영되지 않을 수 있어요.',
  [DEGRADATION_KEYS.staffCall]: '직원 호출을 전달하지 못했어요. 잠시 후 다시 시도해 주세요.',
  [DEGRADATION_KEYS.tryOn]: '착장 요청을 전달하지 못했어요. 직원에게 직접 말씀해 주세요.',
  [DEGRADATION_KEYS.purchaseInquiry]: '구매 문의를 전달하지 못했어요. 직원에게 직접 말씀해 주세요.',
}

/** 가장 최근에 표시된 것이 배열의 끝에 온다. 화면에는 한 번에 하나만 보여준다. */
let active: readonly DegradationKey[] = []
let dismissed: readonly DegradationKey[] = []
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function markDegraded(key: DegradationKey): void {
  if (active.includes(key)) return
  active = [...active, key]
  emit()
}

/** 같은 호출이 다시 성공했을 때 호출한다. 사용자가 닫았던 기록도 함께 지운다. */
export function clearDegraded(key: DegradationKey): void {
  if (!active.includes(key) && !dismissed.includes(key)) return
  active = active.filter((item) => item !== key)
  dismissed = dismissed.filter((item) => item !== key)
  emit()
}

/** 사용자가 안내를 닫은 경우. 저하 상태 자체는 유지하고 표시만 멈춘다. */
export function dismissDegraded(key: DegradationKey): void {
  if (dismissed.includes(key)) return
  dismissed = [...dismissed, key]
  emit()
}

export function getDegradationSnapshot(): DegradationKey | null {
  for (let index = active.length - 1; index >= 0; index -= 1) {
    const key = active[index]
    if (key && !dismissed.includes(key)) return key
  }
  return null
}

export function getDegradationMessage(key: DegradationKey): string {
  return MESSAGES[key]
}

/** 개발 진단 패널이 전체 목록을 보여줄 때 사용한다. */
export function getActiveDegradations(): readonly DegradationKey[] {
  return active
}

export function subscribeDegradation(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
