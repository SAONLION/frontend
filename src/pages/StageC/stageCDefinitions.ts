import { STAGE_C_SCREEN_IDS, type StageCComingSoonScreenId, type StageCHubScreenId } from '../../constants/stageC'
import { FREE_QUERY_TOPICS, type FreeQueryTopic, type HubType } from '../../constants/events'

type HubRouteSegment = 'product' | 'fit' | 'purchase' | 'other'

type PrimaryHubChoice = {
  className?: string
  id: HubType
  label: string
  destination: HubRouteSegment
  hubType: HubType
}

type DetailHubChoice = {
  className?: string
  id: StageCComingSoonScreenId
  label: string
  destination: StageCComingSoonScreenId
}

type HubChoice = PrimaryHubChoice | DetailHubChoice

export type HubScreenDefinition = {
  heading: string
  intro?: string
  choices: readonly HubChoice[]
  purchaseActionLabel: string
}

export const stageCHubDefinitions: Record<StageCHubScreenId, HubScreenDefinition> = {
  [STAGE_C_SCREEN_IDS.c1]: {
    heading: 'MCM의 대표 제품 비세토스 스타크 백팩이네요\n어떤 점이 궁금하신가요?',
    choices: [
      { id: 'product', label: '제품 자체가 궁금해요', destination: 'product', hubType: 'product' },
      { id: 'fit', label: '나에게 맞는지 보고 싶어요', destination: 'fit', hubType: 'fit' },
      { id: 'purchase', label: '구매 조건이 궁금해요', destination: 'purchase', hubType: 'purchase' },
      { id: 'other', label: '그 외 궁금한 점이 있어요', destination: 'other', hubType: 'other', className: 'stage-c-choice-button--muted' },
    ],
    purchaseActionLabel: '구매 문의',
  },
  [STAGE_C_SCREEN_IDS.c2]: {
    heading: '제품의 어떤 이야기가 궁금하세요?',
    choices: [
      { id: STAGE_C_SCREEN_IDS.c21, label: '소재 · 마감', destination: STAGE_C_SCREEN_IDS.c21 },
      { id: STAGE_C_SCREEN_IDS.c22, label: '헤리티지 · 브랜드 스토리', destination: STAGE_C_SCREEN_IDS.c22 },
      { id: STAGE_C_SCREEN_IDS.c23, label: '컬러', destination: STAGE_C_SCREEN_IDS.c23 },
    ],
    purchaseActionLabel: '구매 문의',
  },
  [STAGE_C_SCREEN_IDS.c3]: {
    heading: '제품의 어떤 요소를 더 자세히 알려드릴까요?',
    choices: [
      { id: STAGE_C_SCREEN_IDS.c31, label: '사이즈 · 용량', destination: STAGE_C_SCREEN_IDS.c31 },
      { id: STAGE_C_SCREEN_IDS.c32, label: '스타일링 · 코디', destination: STAGE_C_SCREEN_IDS.c32 },
      { id: STAGE_C_SCREEN_IDS.c33, label: '직접 착용해보기', destination: STAGE_C_SCREEN_IDS.c33 },
    ],
    purchaseActionLabel: '구매 문의',
  },
  [STAGE_C_SCREEN_IDS.c5]: {
    heading: '선택지에 없는 게 궁금하시면',
    intro: '아래에 편하게 적어주세요',
    choices: [],
    purchaseActionLabel: '착용 및 구매 문의',
  },
}

export const quickQueryTopics: readonly { label: string; question: string; topic: FreeQueryTopic }[] = [
  { label: 'A/S · 수선', question: 'A/S · 수선이 가능한가요?', topic: FREE_QUERY_TOPICS.repair },
  { label: '세탁 · 관리', question: '세탁 · 관리 방법이 궁금해요.', topic: FREE_QUERY_TOPICS.care },
  { label: '선물 포장', question: '선물 포장이 가능한가요?', topic: FREE_QUERY_TOPICS.giftWrap },
  { label: '면세 · 환급', question: '면세 · 환급이 가능한가요?', topic: FREE_QUERY_TOPICS.taxRefund },
]
