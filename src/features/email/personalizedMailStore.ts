import { sendPersonalizedEmail } from '../../api/email'

/**
 * 개인화 추천 메일의 "받는 사람 등록"과 "발송"을 잇는 저장소.
 *
 * 주소를 받은 순간 바로 보낸다. 메일 본문의 PICK 4칸은 태그 이력으로 채워지는데,
 * 서버가 채워진 개수(`filledPickCount`)만큼만 넣어 보내주므로 **여권 콜라주가 덜 찼어도
 * 고객은 콘텐츠를 받는다.** 4칸을 다 채우지 않고 매장을 떠나는 손님이 아무것도 못 받던
 * 구멍을 막기 위한 규칙이다.
 *
 * 세션당 한 번만 보낸다. 발송에 실패하면 보낸 것으로 치지 않고, 고객이 앱으로 돌아오는
 * 다음 지점(여권 열람, B1 복귀)에서 다시 시도한다.
 */
let recipientEmail: string | null = null
let hasSent = false
let isSending = false

function trySend(sessionId: string): void {
  if (!recipientEmail || hasSent || isSending) return
  const email = recipientEmail
  isSending = true
  // 동의 없이는 제출 자체가 안 되므로 consentMarketing은 항상 true다.
  sendPersonalizedEmail(sessionId, { email, consentMarketing: true })
    .then(() => {
      hasSent = true
    })
    .catch((error: unknown) => {
      console.error('개인화 추천 메일 발송 요청에 실패했습니다.', error)
    })
    .finally(() => {
      isSending = false
    })
}

/** 이메일 제출이 성공했을 때 호출한다(F2-2, 여권 탑시트의 콘텐츠 신청). */
export function registerPersonalizedMailRecipient(sessionId: string, email: string): void {
  recipientEmail = email
  trySend(sessionId)
}

/** 앞선 발송이 실패해 아직 남아 있다면 다시 시도한다. 보낼 것이 없으면 아무 일도 하지 않는다. */
export function retryPendingPersonalizedMail(sessionId: string): void {
  trySend(sessionId)
}

/** 세션이 새로 발급되면 이전 손님의 주소·발송 이력을 지운다. */
export function resetPersonalizedMail(): void {
  recipientEmail = null
  hasSent = false
  isSending = false
}
