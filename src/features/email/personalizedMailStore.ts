import { sendPersonalizedEmail } from '../../api/email'

/**
 * 개인화 추천 메일의 "받는 사람 등록"과 "발송 시점"을 잇는 저장소.
 *
 * 메일 주소는 CB6 블로커의 F2-2 화면에서 미리 받지만, 메일 본문의 PICK 4칸은
 * 태그 이력으로 채워지므로 **여권 콜라주 4칸이 다 찬 뒤에 보내야** 빈 칸 없이 나간다.
 * 그래서 두 사건(주소 등록, 4칸 완성)이 어느 순서로 일어나든 둘 다 갖춰진 순간
 * 정확히 한 번 발송한다. CB6이 4칸 완성 전에 뜨면 등록만 해 두었다가 완성 때 보내고,
 * 완성 후에 떴다면 등록 즉시 보낸다.
 *
 * 발송 실패 시에는 보낸 것으로 치지 않는다 — 다음 완성 관찰(여권 열람, B1 복귀)에서
 * 다시 시도한다.
 */
let recipientEmail: string | null = null
let hasObservedCompletion = false
let hasSent = false
let isSending = false

function trySend(sessionId: string): void {
  if (!recipientEmail || !hasObservedCompletion || hasSent || isSending) return
  const email = recipientEmail
  isSending = true
  // F2-2 동의 없이는 제출 자체가 안 되므로 consentMarketing은 항상 true다.
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

/** F2-2에서 이메일 제출이 성공했을 때 호출한다. */
export function registerPersonalizedMailRecipient(sessionId: string, email: string): void {
  recipientEmail = email
  trySend(sessionId)
}

/** 여권 콜라주 4칸이 다 찬 것을 관찰한 곳(B1 복귀, 여권 탑시트)에서 호출한다. */
export function notifyJourneyCompleted(sessionId: string): void {
  hasObservedCompletion = true
  trySend(sessionId)
}

/** 세션이 새로 발급되면 이전 손님의 주소·발송 이력을 지운다. */
export function resetPersonalizedMail(): void {
  recipientEmail = null
  hasObservedCompletion = false
  hasSent = false
  isSending = false
}
