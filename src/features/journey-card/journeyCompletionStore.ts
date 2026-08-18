import type { JourneyCardResponse } from '../../api/journeyCard'

/**
 * `useReturnToB1`이 여권 완성(콜라주 4칸 채움)을 확인하려고 미리 받아온 journey-card 응답을
 * 완성 팝업·여권 탑시트가 그대로 재사용하도록 넘긴다. 팝업을 띄우는 시점에 이미 최신 데이터를
 * 들고 있으므로, 탑시트를 열 때 같은 데이터를 다시 조회하지 않아도 된다.
 */
let pendingCompletionCard: JourneyCardResponse | null = null

export function setPendingJourneyCompletionCard(card: JourneyCardResponse): void {
  pendingCompletionCard = card
}

export function getPendingJourneyCompletionCard(): JourneyCardResponse | null {
  return pendingCompletionCard
}

export function clearPendingJourneyCompletionCard(): void {
  pendingCompletionCard = null
}
