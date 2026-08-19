import { apiClient } from './client'
import type {
  StaffCallResponse,
  StaffCallTestRequestedAtRequest,
  StaffCallTestStatusRequest,
  TryonRequestResponse,
  TryonRequestTestRequestedAtRequest,
} from './types'

export const STAFF_CALL_TEST_STATUSES = ['requested', 'acknowledged', 'in_progress', 'completed'] as const
export type StaffCallTestStatus = (typeof STAFF_CALL_TEST_STATUSES)[number]

/**
 * PATCH /internal/test/staff-calls/{callId}/status
 *
 * SA 대시보드가 없는 상태에서 시연하기 위한 임시 API다. 정식 기능이 아니며
 * 서버의 `app.internal-test-endpoints.enabled=true`(기본값 false)일 때만 등록된다.
 * 꺼져 있으면 404가 온다.
 *
 * 이 호출이 없으면 STAGE C 직원 호출은 `completed`가 될 때까지 약 3분 폴링하다 시간 초과된다.
 * 개발 진단 패널에서만 사용한다.
 */
export async function setStaffCallTestStatus(
  callId: number,
  status: StaffCallTestStatus,
): Promise<StaffCallResponse> {
  const body: StaffCallTestStatusRequest = { status }
  const { data } = await apiClient.patch<StaffCallResponse>(`/internal/test/staff-calls/${callId}/status`, body)
  return data
}

/** CB3 발동 경계. 서버가 `sa_call` 후 이 시간이 지나면 팝업을 만든다. */
const CB3_THRESHOLD_MINUTES = 5

/** CB6(`T-CB6-a`) 발동 경계. 착장 요청 후 이 시간이 지나면 팝업을 만든다. */
const CB6_THRESHOLD_MINUTES = 15

/** 서버가 받는 오프셋 없는 `LocalDateTime`. 서버도 UTC로 저장한다(실측). */
function toServerLocalDateTime(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString().slice(0, 19)
}

/**
 * PATCH /internal/test/staff-calls/{callId}/requested-at
 *
 * **CB3 팝업을 5분 기다리지 않고 띄우는 유일한 수단이다.** 호출 시각을 과거로 강제해
 * 서버의 5분 타임아웃을 즉시 성립시킨다. 10분 전으로 세팅하면 25초 내에 생성된다(실측).
 *
 * 위 `setStaffCallTestStatus`로는 CB3를 띄울 수 없다 — `status`가 `requested`를 벗어나면
 * 서버가 CB3를 **억제**하기 때문이다(`acknowledged`·`in_progress`·`completed` 전부).
 * 즉 상태 버튼은 CB3를 끄기만 하고, 띄우는 것은 이 API만 할 수 있다.
 *
 * `status`와 같은 플래그(`app.internal-test-endpoints.enabled`)로 등록되며 꺼져 있으면 404다.
 */
export async function backdateStaffCallRequestedAt(
  sessionId: string,
  callId: number,
  minutesAgo: number = CB3_THRESHOLD_MINUTES * 2,
): Promise<StaffCallResponse> {
  const body: StaffCallTestRequestedAtRequest = { sessionId, requestedAt: toServerLocalDateTime(minutesAgo) }
  const { data } = await apiClient.patch<StaffCallResponse>(
    `/internal/test/staff-calls/${callId}/requested-at`,
    body,
  )
  return data
}

/**
 * PATCH /internal/test/tryon-requests/{tryonRequestId}/requested-at
 *
 * CB6를 15분 기다리지 않고 시연하는 테스트 훅이다. 소유 세션 ID를 함께 보내므로
 * 다른 세션의 요청 시각을 변경할 수 없다.
 */
export async function backdateTryonRequestedAt(
  sessionId: string,
  tryonRequestId: number,
  minutesAgo: number = CB6_THRESHOLD_MINUTES * 2,
): Promise<TryonRequestResponse> {
  const body: TryonRequestTestRequestedAtRequest = { sessionId, requestedAt: toServerLocalDateTime(minutesAgo) }
  const { data } = await apiClient.patch<TryonRequestResponse>(
    `/internal/test/tryon-requests/${tryonRequestId}/requested-at`,
    body,
  )
  return data
}
