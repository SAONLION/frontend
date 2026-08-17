export type TryOnRequest = {
  /** 화면이 쓰는 style number. fixture 조회 키이며 서버에는 보내지 않는다. */
  sku: string
  size: string
  color: string
  sessionId: string | null
  /** 서버 SKU ID. 태그 스캔을 거치지 않으면 null이라 서버 요청을 건너뛴다. */
  skuId: number | null
}

export type TryOnRequestService = {
  requestTryOn: (request: TryOnRequest) => Promise<'completed'>
}
