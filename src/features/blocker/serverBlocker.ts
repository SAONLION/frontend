import type { BlockerCode, BlockerTriggerId } from '../../constants/events'

/**
 * 서버 `pending-action`의 `blockerType`(임의 문자열)을 프론트엔드 `BlockerCode`로 좁힌다.
 *
 * CB1(재고 없음)은 **고객 팝업으로 노출하지 않기로 결정**했다. SA 대시보드는 이번 범위에서
 * 구현하지 않으며 시연에서 말로 설명한다. 서버가 여전히 CB1을 만들고 있으므로 여기서 걸러낸다.
 *
 * CB3·CB6는 2026-08-19에 서버 발동을 실측 확인했다. CB5는 아직 발동하지 않는다.
 */
const CUSTOMER_FACING_BLOCKER_CODES: readonly BlockerCode[] = ['CB3', 'CB5', 'CB6']

export function toCustomerBlockerCode(blockerType: string): BlockerCode | null {
  const normalized = blockerType.trim().toUpperCase()
  return CUSTOMER_FACING_BLOCKER_CODES.find((code) => code === normalized) ?? null
}

/** 고객에게 팝업으로 띄울 대상인지. CB1과 미지의 코드는 제외된다. */
export function isCustomerFacingBlocker(blockerType: string): boolean {
  return toCustomerBlockerCode(blockerType) !== null
}

const SERVER_BLOCKER_TRIGGER_IDS: readonly Exclude<BlockerTriggerId, 'T-SERVER'>[] = [
  'T-CB3-2',
  'T-CB5-1',
  'T-CB5-2',
  'T-CB6-a',
  'T-CB6-b',
  'T-CB6-c',
]

/** 서버가 보낸 트리거를 세션 이벤트 타입으로 안전하게 좁힌다. */
export function toBlockerTriggerId(triggerId: string | undefined): BlockerTriggerId {
  return SERVER_BLOCKER_TRIGGER_IDS.find((knownId) => knownId === triggerId) ?? 'T-SERVER'
}
