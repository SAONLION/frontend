import type { AiAnswerRequest, AiAnswerResult, AiAnswerService } from '../../features/ai-answer/AiAnswerService'

const answerCache = new Map<string, Promise<AiAnswerResult>>()
const careKeywords = /비|젖|오염|얼룩|보관|세탁|비누|솔벤트|관리/

function normalizedKey({ sku, topic, text }: AiAnswerRequest) {
  return `${sku}:${topic}:${text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko-KR')}`
}

function resolveAnswer(request: AiAnswerRequest): AiAnswerResult {
  const isCareQuestion = request.topic === 'care' || careKeywords.test(request.text)
  if (request.sku === 'MMKEAVE15CO001' && isCareQuestion) {
    return {
      resolved: true,
      title: '관리 방법을 안내해 드릴게요.',
      answerLines: [
        '공식 관리 안내상 제품이 젖거나 얼룩지지 않도록 주의해 주세요.',
        '젖거나 오염되면 보풀이 없는 밝은색 흡수성 천으로 닦아 말려 주세요.',
        '비누와 솔벤트는 사용하지 말아 주세요.',
        '보호용 더스트 백에 넣어 직사광선을 피해 서늘하고 건조한 곳에 보관해 주세요.',
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
