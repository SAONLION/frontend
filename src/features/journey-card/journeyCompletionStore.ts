import type { JourneyCardResponse } from '../../api/journeyCard'

/**
 * `useReturnToB1`이 여권 완성(콜라주 4칸 채움)을 확인하려고 미리 받아온 journey-card 응답을
 * 완성 팝업·여권 탑시트가 그대로 재사용하도록 넘긴다. 팝업을 띄우는 시점에 이미 최신 데이터를
 * 들고 있으므로, 탑시트를 열 때 같은 데이터를 다시 조회하지 않아도 된다.
 */
let pendingCompletionCard: JourneyCardResponse | null = null

/**
 * 완성 팝업을 이미 보여줬는지. **세션당 1회만 띄운다.**
 *
 * 콜라주는 4칸이 차면 그 뒤로 내용이 바뀌지 않는다(서버가 먼저 태그한 4개를 고정으로 준다).
 * 그래서 매번 띄우면 **같은 카드를 다시 보라고 반복해서 권하는 셈**이 된다.
 *
 * 서버가 "가장 관심 있는 4개"로 바꿔 콜라주가 계속 갱신되면 이 전제가 깨진다.
 * 그때는 이 표식을 걷어내고 갱신될 때마다 다시 띄우는 쪽으로 바꾼다.
 */
let hasShownCompletion = false

export function markJourneyCompletionShown(): void {
  hasShownCompletion = true
}

export function hasShownJourneyCompletion(): boolean {
  return hasShownCompletion
}

/** 세션이 새로 발급되면 다시 보여줄 수 있어야 한다. */
export function resetJourneyCompletion(): void {
  hasShownCompletion = false
  pendingCompletionCard = null
}

export function setPendingJourneyCompletionCard(card: JourneyCardResponse): void {
  pendingCompletionCard = card
}

export function getPendingJourneyCompletionCard(): JourneyCardResponse | null {
  return pendingCompletionCard
}

export function clearPendingJourneyCompletionCard(): void {
  pendingCompletionCard = null
}
