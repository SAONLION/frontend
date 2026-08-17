import { askProductQna } from './qna'
import { FREE_QUERY_TOPICS, type FreeQueryTopic } from '../constants/events'
import type { AiAnswerService } from '../features/ai-answer/AiAnswerService'
import type { QnaQuestionType } from './types'

/**
 * C5 자유 질문의 Live 구현. `POST /api/v1/products/{productId}/qna`를 호출한다.
 *
 * 서버는 `{ answer: string }` 하나만 돌려주므로, 화면이 요구하는 제목·본문 줄로 나누는 일은
 * 여기서 한다. 제목은 퀵칩 주제에서 만들고 본문은 문장 단위로 끊는다.
 */

const QUESTION_TYPE_BY_TOPIC: Record<FreeQueryTopic, QnaQuestionType> = {
  [FREE_QUERY_TOPICS.repair]: 'AS_REPAIR',
  [FREE_QUERY_TOPICS.care]: 'CARE',
  [FREE_QUERY_TOPICS.giftWrap]: 'GIFT_WRAP',
  [FREE_QUERY_TOPICS.taxRefund]: 'TAX_REFUND',
  // 프론트엔드 `other`는 자유 입력이므로 서버의 자유 질의 타입으로 보낸다.
  // 서버에만 있는 SHIPPING_RETURN은 대응하는 퀵칩이 없어 사용하지 않는다.
  [FREE_QUERY_TOPICS.other]: 'FREE_TEXT',
}

const TITLE_BY_TOPIC: Record<FreeQueryTopic, string> = {
  [FREE_QUERY_TOPICS.repair]: 'A/S · 수선은\n이렇게 안내드려요',
  [FREE_QUERY_TOPICS.care]: '세탁 · 관리는\n이렇게 해주세요',
  [FREE_QUERY_TOPICS.giftWrap]: '선물 포장은\n이렇게 안내드려요',
  [FREE_QUERY_TOPICS.taxRefund]: '면세 · 환급은\n이렇게 안내드려요',
  [FREE_QUERY_TOPICS.other]: '질문하신 내용을\n안내드릴게요',
}

const MAX_ANSWER_LINES = 6

/** 한 문단으로 오는 답변을 화면에서 읽기 좋게 문장 단위로 끊는다. */
export function splitAnswerLines(answer: string): readonly string[] {
  return answer
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, MAX_ANSWER_LINES)
}

export const realAiAnswerService: AiAnswerService = {
  async answer({ topic, text, sessionId, productId }) {
    // 식별자가 없으면 답변을 만들 수 없다. 직원 연결로 넘긴다.
    if (!sessionId || productId === null) {
      return { resolved: false, handoffMessage: '정확한 안내를 위해 직원에게 연결해 드릴게요.' }
    }

    const questionType = QUESTION_TYPE_BY_TOPIC[topic]
    const { answer } = await askProductQna(productId, sessionId, {
      questionType,
      question: questionType === 'FREE_TEXT' ? text : undefined,
    })

    const answerLines = splitAnswerLines(answer ?? '')
    if (answerLines.length === 0) {
      return { resolved: false, handoffMessage: '정확한 안내를 위해 직원에게 연결해 드릴게요.' }
    }

    return { resolved: true, title: TITLE_BY_TOPIC[topic], answerLines }
  },
}
