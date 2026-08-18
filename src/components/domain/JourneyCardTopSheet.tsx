import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { toPng } from 'html-to-image'
import { ApiError } from '../../api/client'
import { fetchJourneyCard, type JourneyCardResponse } from '../../api/journeyCard'
import { clearDegraded, DEGRADATION_KEYS, markDegraded } from '../../features/degradation/degradationStore'
import {
  clearPendingJourneyCompletionCard,
  getPendingJourneyCompletionCard,
} from '../../features/journey-card/journeyCompletionStore'
import ScreenHeadline from '../common/ScreenHeadline'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { JourneyPassportCard } from './JourneyPassportCard'

const CLOSE_ANIMATION_MS = 420

// 콜라주 사진은 S3에서 바로 내려오는데 버킷이 CORS를 열어주지 않는다(백엔드/인프라 확인 필요).
// html-to-image가 못 읽는 이미지를 빈 문자열로 남기면 캡처 자체가 통째로 실패하니,
// 최소한 투명 1x1 픽셀로 대체해 나머지(틀·텍스트)는 저장되게 한다.
const TRANSPARENT_PIXEL_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg=='

/**
 * 여권 카드 탑시트. 배경 화면을 언마운트하지 않는 비차단 시트라는 점, 손잡이를 끌어 닫는 방식,
 * 닫힘 모션까지 하단 직원 호출 시트(EOverlay)와 같은 규칙을 따른다. 방향만 위쪽이다.
 * 디자인상 닫기(X) 버튼은 두지 않는다 — 손잡이 드래그와 배경 탭으로 닫는다.
 */
export function JourneyCardTopSheet() {
  const { state, dispatch } = useSession()
  // 완성 팝업(useReturnToB1)이 4칸 확인차 이미 받아둔 응답이 있으면 그걸로 먼저 그려서,
  // "여권 보러가기"를 눌렀을 때 빈 카드가 잠깐 보이지 않게 한다. 아래 effect가 최신 상태로 다시 갱신한다.
  const [journeyCard, setJourneyCard] = useState<JourneyCardResponse | null>(() => {
    const pending = getPendingJourneyCompletionCard()
    if (pending) clearPendingJourneyCompletionCard()
    return pending
  })
  const [isClosing, setIsClosing] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const dragStartYRef = useRef<number | null>(null)
  const dragOffsetRef = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    if (!state.sessionId) return
    let cancelled = false

    fetchJourneyCard(state.sessionId)
      .then((data) => {
        if (!cancelled) setJourneyCard(data)
        clearDegraded(DEGRADATION_KEYS.journeyCard)
      })
      .catch((error: unknown) => {
        // 404는 B1의 세션 재발급 경로가 처리한다. 여기서 중복으로 알리지 않는다.
        if (error instanceof ApiError && error.status === 404) return
        console.error('여정 카드 조회에 실패했습니다.', error)
        markDegraded(DEGRADATION_KEYS.journeyCard)
      })

    return () => { cancelled = true }
  }, [state.sessionId])

  const close = () => {
    if (isClosing) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null })
      return
    }
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null })
    }, CLOSE_ANIMATION_MS)
  }

  const startSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragStartYRef.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    const startY = dragStartYRef.current
    if (startY === null) return
    // 위로 끌 때만 따라간다. 아래로는 늘어나지 않는다.
    const nextOffset = Math.min(0, event.clientY - startY)
    dragOffsetRef.current = nextOffset
    setDragOffset(nextOffset)
  }

  const endSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragStartYRef.current === null) return
    dragStartYRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    const sheetHeight = event.currentTarget.closest('.stage-top-sheet__panel')?.clientHeight ?? 0
    if (Math.abs(dragOffsetRef.current) >= Math.max(96, sheetHeight * 0.24)) {
      close()
      return
    }
    dragOffsetRef.current = 0
    setDragOffset(0)
  }

  // 콜라주 초기화 — 서버 태그 이력을 지우는 API가 스펙에 없어 화면 표시용 상태만 비운다.
  // TODO: 서버 쪽 태그 이력까지 초기화해야 하는지는 백엔드팀 확인 필요.
  const resetCollage = () => {
    setJourneyCard((current) => (current ? { ...current, collageImages: [] } : current))
  }

  const saveImage = async () => {
    if (!cardRef.current || isSavingImage) return
    setIsSavingImage(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        imagePlaceholder: TRANSPARENT_PIXEL_PLACEHOLDER,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `MCM_passport_${journeyCard?.sessionCode ?? state.sessionId ?? 'card'}.png`
      link.click()
    } catch (error) {
      console.error('여권 카드 이미지 저장에 실패했습니다.', error)
    } finally {
      setIsSavingImage(false)
    }
  }

  const nickname = journeyCard?.nickname || state.nickname || '고객'

  return (
    <div className={`stage-top-sheet${isClosing ? ' stage-top-sheet--closing' : ''}`}>
      {/* 뒤 화면을 덮어 어둡게 하고 그 영역의 조작을 막는다. 눌러서 닫을 수도 있다. */}
      <button aria-label="여권 닫기" className="stage-sheet-backdrop" onClick={close} type="button" />
      <div
        className={`stage-top-sheet__panel${isDragging ? ' stage-top-sheet__panel--dragging' : ''}`}
        style={{ translate: `0 ${dragOffset}px` } as CSSProperties}
      >
        <div className="stage-top-sheet__content">
          <ScreenHeadline
            className="stage-top-sheet__headline"
            headline={`${nickname}님을 위한 여권을 저장해보세요!`}
            variant="md"
          />
          <JourneyPassportCard journeyCard={journeyCard} onReset={resetCollage} ref={cardRef} />
          <div className="stage-top-sheet__actions">
            <button
              className="stage-c-action-button stage-c-action-button--primary"
              disabled={!journeyCard || isSavingImage}
              onClick={saveImage}
              type="button"
            >
              {isSavingImage ? '저장 중…' : '이미지 저장하기'}
            </button>
          </div>
        </div>
        <span
          aria-label="위로 끌어 여권 닫기"
          className="stage-top-sheet__drag-handle"
          onPointerCancel={endSheetDrag}
          onPointerDown={startSheetDrag}
          onPointerMove={moveSheetDrag}
          onPointerUp={endSheetDrag}
        />
      </div>
    </div>
  )
}
