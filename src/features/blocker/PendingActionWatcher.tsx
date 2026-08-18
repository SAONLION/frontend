import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { respondToAction } from '../../api/pendingActions'
import { BlockerSheet } from '../../components/domain/BlockerSheet'
import { toCustomerBlockerCode } from './serverBlocker'
import { usePendingActionPolling } from './usePendingActionPolling'
import { SESSION_ACTIONS } from '../session/sessionTypes'
import { useSession } from '../session/useSession'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { STAGE_D_ROUTES } from '../../constants/appRoutes'
import E2RequestReceived from '../../pages/StageE/E2RequestReceived'

const DISMISS_RESPONSE_KEY = 'dismissed'
const SHEET_TITLE_ID = 'blocker-sheet-title'

/**
 * 서버가 선택 결과에 따라 지시하는 후속 단계.
 *
 * 서버 실측값(2026-08-19): CB3 `escalate_call`과 CB6 `ask_staff`는 `STAFF_CALL_CREATED`,
 * CB6 `show_detail_reason`은 `SHOW_RECOMMENDATIONS`를 준다.
 */
const NEXT_STEP_STAFF_CALL = 'STAFF_CALL_CREATED'
const NEXT_STEP_RECOMMENDATIONS = 'SHOW_RECOMMENDATIONS'
const SHEET_CLOSE_ANIMATION_MS = 420

/**
 * 접수 화면 문구에 넣을 요청 이름.
 *
 * E2 헤드라인이 `요청하신 {이름}에 대해`라서 선택지 라벨을 그대로 넣으면
 * "요청하신 우선 호출 **요청**에 대해"처럼 겹친다. 명사형으로 바꿔 넣는다.
 */
const STAFF_REQUEST_LABEL_BY_KEY: Record<string, string> = {
  escalate_call: '우선 호출',
  ask_staff: '직원 상담',
}

const DEFAULT_STAFF_REQUEST_LABEL = '직원 상담'

/**
 * CB3·CB6의 직원 연결 완료 안내도 STAGE E 완료 시트와 같은 바텀시트 규칙을 쓴다.
 *
 * `E2RequestReceived`는 내용만 담당하고, 이 래퍼가 EOverlay와 동일한 백드롭·손잡이·드래그
 * 닫기를 제공한다. 따라서 "요청하신 우선 호출에 대해…" 경로만 손잡이가 빠지거나 다른 높이로
 * 보이지 않는다.
 */
function StaffRequestReceivedSheet({ requestLabel, onClose }: { requestLabel: string; onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const dragStartYRef = useRef<number | null>(null)
  const dragOffsetRef = useRef(0)

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  const close = () => {
    if (isClosing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose()
      return
    }
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(onClose, SHEET_CLOSE_ANIMATION_MS)
  }

  const startDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragStartYRef.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragStartYRef.current === null) return
    const nextOffset = Math.max(0, event.clientY - dragStartYRef.current)
    dragOffsetRef.current = nextOffset
    setDragOffset(nextOffset)
  }

  const endDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragStartYRef.current === null) return
    dragStartYRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    const sheetHeight = event.currentTarget.closest('.stage-external-page')?.clientHeight ?? 0
    if (dragOffsetRef.current >= Math.max(96, sheetHeight * 0.24)) {
      close()
      return
    }
    dragOffsetRef.current = 0
    setDragOffset(0)
  }

  return (
    <div className={`stage-overlay${isClosing ? ' stage-overlay--closing' : ''}`}>
      <button aria-label="접수 안내 닫기" className="stage-sheet-backdrop" type="button" onClick={close} />
      <E2RequestReceived
        isDragging={isDragging}
        selectedRequests={[requestLabel]}
        sheetHandle={(
          <span
            aria-label="아래로 끌어 접수 안내 닫기"
            className="stage-overlay__drag-handle"
            onPointerCancel={endDrag}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
          />
        )}
        sheetOffset={dragOffset}
      />
    </div>
  )
}

/**
 * 서버가 감지한 Blocker 팝업을 폴링해 어느 화면에서든 띄운다.
 *
 * Blocker 감지의 소유자는 서버다. 프론트엔드는 감지하지 않고, 노출·응답만 세션 타임라인에 기록한다.
 * 서버가 트리거 ID를 주지 않아 `T-SERVER`로 기록한다.
 *
 * **선택 이후가 이 컴포넌트의 책임이다.** 서버는 `actionNextStep`으로 다음 단계를 지시하는데,
 * 이 값을 읽지 않으면 고객이 버튼을 눌러도 시트만 닫혀 고장으로 보인다. CB3·CB6가 실제로
 * 발동하기 시작한 2026-08-19부터 실사용 경로가 됐다.
 */
export function PendingActionWatcher() {
  const { action, clear, dismiss } = usePendingActionPolling()
  const { dispatch } = useSession()
  const navigate = usePreparedNavigate()
  const recordedIds = useRef(new Set<number>())
  /** 직원 호출이 만들어졌을 때 띄우는 접수 화면. 눌린 선택지 라벨을 담는다. */
  const [staffRequestLabel, setStaffRequestLabel] = useState<string | null>(null)

  const code = action ? toCustomerBlockerCode(action.blockerType) : null

  useEffect(() => {
    if (!action || !code || recordedIds.current.has(action.actionId)) return
    recordedIds.current.add(action.actionId)
    dispatch({ type: SESSION_ACTIONS.recordBlockerDetected, code, triggerId: 'T-SERVER' })
    dispatch({ type: SESSION_ACTIONS.recordActionImpression, code, triggerId: 'T-SERVER' })
  }, [action, code, dispatch])

  // STAGE E와 같은 오버레이 구조를 그대로 쓴다. 같은 모양을 내는 CSS를 두 벌 두지 않는다.
  if (staffRequestLabel !== null) {
    return (
      <StaffRequestReceivedSheet requestLabel={staffRequestLabel} onClose={() => setStaffRequestLabel(null)} />
    )
  }

  if (!action || !code) return null

  const respond = (responseKey: string) => {
    const declined = responseKey === DISMISS_RESPONSE_KEY
    dispatch(
      declined
        ? { type: SESSION_ACTIONS.recordActionDeclined, code }
        : { type: SESSION_ACTIONS.recordActionAccepted, code },
    )
    const requestLabel = STAFF_REQUEST_LABEL_BY_KEY[responseKey] ?? DEFAULT_STAFF_REQUEST_LABEL
    if (declined) dismiss(action)
    else clear(action.actionId)

    respondToAction(action.actionId, responseKey)
      .then((result) => {
        // 거절은 후속 화면이 없다. 닫히는 것이 곧 응답이다.
        if (declined) return
        if (result.actionNextStep === NEXT_STEP_STAFF_CALL) {
          setStaffRequestLabel(requestLabel)
          return
        }
        if (result.actionNextStep === NEXT_STEP_RECOMMENDATIONS) {
          // D3는 진입 가드가 없다. 방문 목적이 없으면 '방문'으로 대체되고 추천은 새로 조회한다.
          navigate(STAGE_D_ROUTES.personalizedRecommend)
        }
      })
      .catch((error: unknown) => {
        // 후속 화면을 띄우지 못해도 팝업은 이미 닫혔다. 화면을 막지 않는다.
        console.error('팝업 응답 기록에 실패했습니다.', error)
      })
  }

  return (
    <BlockerSheet
      actions={action.options}
      body={action.popupBody}
      labelledById={SHEET_TITLE_ID}
      title={action.popupTitle}
      onDismiss={() => respond(DISMISS_RESPONSE_KEY)}
      onSelect={respond}
    />
  )
}
