export type AdminCallStatus = 'waiting' | 'completed' | 'expired'

/** API 응답을 관리자 카드가 소비하는 화면 모델로 바꾼 뒤 이 타입에 전달한다. */
export type AdminCallCardData = {
  callId: number
  color: string | null
  customerName: string
  productName: string | null
  requestReason: string
  sessionCode: string
}

export type AdminQueueState = 'loading' | 'empty' | 'connection-pending' | 'error' | 'ready'
