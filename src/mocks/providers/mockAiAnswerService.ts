import type { AiAnswerRequest, AiAnswerResult, AiAnswerService } from '../../features/ai-answer/AiAnswerService'

const answerCache = new Map<string, Promise<AiAnswerResult>>()
const AI_ANSWER_DEMO_QUESTION = 'A/S · 수선이 가능한가요?'

function normalizedKey({ sku, topic, text }: AiAnswerRequest) {
  return `${sku}:${topic}:${text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko-KR')}`
}

function resolveAnswer(request: AiAnswerRequest): AiAnswerResult {
  const isDemoQuestion = request.text.trim() === AI_ANSWER_DEMO_QUESTION
  if (request.sku === 'MMKEAVE15CO001' && isDemoQuestion) {
    return {
      resolved: true,
      title: 'A/S · 수선은 직원에게\n정확히 안내받으실 수 있어요',
      answerLines: [
        '수선 가능 여부와 절차는 제품 상태에 따라 달라질 수 있어요.',
        '직원이 제품을 확인한 뒤 가능한 안내를 도와드릴게요.',
      ],
    }
  }
  return {
    resolved: false,
    title: '직원에게 확인이 필요한 내용이에요',
    answerLines: ['정확한 안내를 위해 직원에게 문의해 주세요.'],
  }
}

export const mockAiAnswerService: AiAnswerService = {
  answer(request) {
    const key = normalizedKey(request)
    const existing = answerCache.get(key)
    if (existing) return existing
    const response = new Promise<AiAnswerResult>((resolve) => {
      window.setTimeout(() => resolve(resolveAnswer(request)), 650)
    })
    answerCache.set(key, response)
    void response.catch(() => {
      if (answerCache.get(key) === response) answerCache.delete(key)
    })
    return response
  },
}
