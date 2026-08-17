import type { FreeQueryTopic } from '../../constants/events'

export type AiAnswerRequest = {
  sku: string
  topic: FreeQueryTopic
  text: string
  /** Live 구현이 `POST /products/{productId}/qna`를 부르는 데 필요하다. Mock은 무시한다. */
  sessionId: string | null
  productId: number | null
}

export type AiAnswerResult =
  | { resolved: true; title: string; answerLines: readonly string[] }
  | { resolved: false; handoffMessage: string }

export interface AiAnswerService {
  answer: (request: AiAnswerRequest) => Promise<AiAnswerResult>
}
