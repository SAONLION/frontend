import { createSession } from '../../api/session'
import { setStoredSessionId } from './sessionStorage'

const DEFAULT_SESSION_LANGUAGE = 'ko'

// 저장된 sessionId가 더 이상 서버에 없을 때(404 SESSION_NOT_FOUND) 새 세션을 발급하고
// localStorage를 갱신한다.
export async function reissueSession(): Promise<string> {
  const result = await createSession(DEFAULT_SESSION_LANGUAGE)
  setStoredSessionId(result.sessionId)
  return result.sessionId
}
