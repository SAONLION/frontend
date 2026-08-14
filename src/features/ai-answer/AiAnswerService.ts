import type { FreeQueryTopic } from '../../constants/events'

export type AiAnswerRequest = { sku: string; topic: FreeQueryTopic; text: string }

export type AiAnswerResult =
  | { resolved: true; title: string; answerLines: readonly string[] }
  | { resolved: false; handoffMessage: string }

export interface AiAnswerService {
  answer: (request: AiAnswerRequest) => Promise<AiAnswerResult>
}
