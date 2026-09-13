import { apiClient } from './client'

export type EmailSentStatus = 'PENDING' | 'SENT' | 'FAILED'

export type EmailSendResponse = {
  /** 잠재고객 ID. 나중에 GET /api/v1/session/email/status?pcId= 로 상태를 조회할 때 쓴다. */
  pcId: number
  email: string
  /**
   * 발송 상태. 실제 발송은 서버가 응답 후 비동기로 이어가므로
   * 이 API 응답에서는 사실상 항상 PENDING이다. 프론트는 이 값을 기다리지 않는다.
   */
  sentStatus: EmailSentStatus
  /** 발송 시각. 아직 발송 전이거나 실패했으면 null이다. */
  sentAt: string | null
  /** 메일 PICK 4칸 중 실제로 채워진 개수 (0~4) */
  filledPickCount: number
  /** 메일 추천 2칸 중 실제로 채워진 개수 (0~2) */
  filledRecommendCount: number
}

// POST /api/v1/session/email/send
// triggerType(기본 SESSION_END)과 language(기본: 세션의 language)는 서버 기본값을 쓴다.
export async function sendPersonalizedEmail(
  sessionId: string,
  input: { email: string; consentMarketing: boolean },
): Promise<EmailSendResponse> {
  const { data } = await apiClient.post<EmailSendResponse>('/api/v1/session/email/send', input, {
    params: { sessionId },
  })
  return data
}
