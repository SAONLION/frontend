import { askProductQna } from './qna'
import { FREE_QUERY_TOPICS, type FreeQueryTopic } from '../constants/events'
import type { AiAnswerService } from '../features/ai-answer/AiAnswerService'
import type { QnaQuestionType, QnaResponse } from './types'

/**
 * C5 자유 질문의 Live 구현. `POST /api/v1/products/{productId}/qna`를 호출한다.
 *
 * 서버의 `resolved`는 답변 충분성 신호로만 기록한다. true/false와 무관하게 서버 답변 문구를
 * 화면에 표시하고, 고객이 필요하면 답변 아래에서 직원에게 문의할 수 있다.
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
/** 자유 입력은 AI 생성 호출이다. 12초를 넘기면 기다리지 않고 안내 문구를 표시한다. */
const FREE_TEXT_ANSWER_TIMEOUT_MS = 12_000

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
    // 식별자가 없으면 답변을 만들 수 없다. 화면에 안내 문구를 표시한다.
    if (!sessionId || productId === null) {
      return {
        resolved: false,
        title: TITLE_BY_TOPIC[topic],
        answerLines: ['정확한 안내를 위해 직원에게 문의해 주세요.'],
      }
    }

    const questionType = QUESTION_TYPE_BY_TOPIC[topic]
    let response: QnaResponse
    try {
      response = await askProductQna(productId, sessionId, {
        questionType,
        question: questionType === 'FREE_TEXT' ? text : undefined,
      }, questionType === 'FREE_TEXT' ? { timeoutMs: FREE_TEXT_ANSWER_TIMEOUT_MS } : undefined)
    } catch (error: unknown) {
      // 자유 입력은 AI 호출 실패/12초 초과를 고객에게 오류 카드로 남기지 않는다.
      if (questionType === 'FREE_TEXT') {
        console.error('AI 자유 질문 응답 시간이 초과됐거나 요청에 실패했습니다.', error)
        return {
          resolved: false,
          title: TITLE_BY_TOPIC[topic],
          answerLines: ['답변을 준비하지 못했어요. 직원에게 문의해 주세요.'],
        }
      }
      throw error
    }

    const { answer, resolved } = response

    const answerLines = splitAnswerLines(answer ?? '')
    return {
      resolved: resolved && answerLines.length > 0,
      title: TITLE_BY_TOPIC[topic],
      answerLines: answerLines.length > 0 ? answerLines : ['정확한 안내를 위해 직원에게 문의해 주세요.'],
    }
  },
}
