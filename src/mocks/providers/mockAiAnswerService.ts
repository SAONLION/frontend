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
      title: '“비 오는 날”에 대해서는\n이렇게 안내드릴 수 있어요',
      answerLines: [
        '방수 코팅이 적용되어 가벼운 비에는 문제 없어요',
        '장시간 노출 시에는 마른 천으로 닦아 그늘에 말려주세요',
        '전용 방수 커버는 별도 판매되고 있어요',
      ],
    }
  }
  return { resolved: false, handoffMessage: '정확한 안내를 위해 직원에게 연결해 드릴게요.' }
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
