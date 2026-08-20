import type { FreeQueryTopic } from '../../constants/events'

export type AiAnswerRequest = {
  sku: string
  topic: FreeQueryTopic
  text: string
  /** Live 구현이 `POST /products/{productId}/qna`를 부르는 데 필요하다. Mock은 무시한다. */
  sessionId: string | null
  productId: number | null
}

/** `resolved`는 답변의 충분성 신호이며, true/false와 무관하게 answerLines는 화면에 표시한다. */
export type AiAnswerResult = { resolved: boolean; title: string; answerLines: readonly string[] }

export interface AiAnswerService {
  answer: (request: AiAnswerRequest) => Promise<AiAnswerResult>
}
