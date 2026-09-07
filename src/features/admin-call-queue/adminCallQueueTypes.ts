export type AdminCallStatus = 'waiting' | 'completed'

/** API 응답을 관리자 카드가 소비하는 화면 모델로 바꾼 뒤 이 타입에 전달한다. */
export type AdminCallCardData = {
  callId: number
  customerName: string
  productName: string | null
  requestLabel: string
}

export type AdminQueueState = 'loading' | 'empty' | 'connection-pending' | 'error' | 'ready'
