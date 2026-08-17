import { createSession } from '../../api/session'
import { resetJourneyPulse } from '../journey-card/journeyPulse'
import { clearStoredProductContext, setStoredSessionId } from './sessionStorage'

const DEFAULT_SESSION_LANGUAGE = 'ko'

// 저장된 sessionId가 더 이상 서버에 없을 때(404 SESSION_NOT_FOUND) 새 세션을 발급하고
// localStorage를 갱신한다.
export async function reissueSession(): Promise<string> {
  const result = await createSession(DEFAULT_SESSION_LANGUAGE)
  setStoredSessionId(result.sessionId)
  // 이전 세션의 productId·skuId를 새 세션에 물려주면 남의 세션 제품을 기록하게 된다.
  clearStoredProductContext()
  // 태그 이력이 0으로 돌아가므로 여권 알림 표식도 함께 되돌린다.
  resetJourneyPulse()
  return result.sessionId
}
