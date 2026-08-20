import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import html2canvas from 'html2canvas-pro'
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
  const cardCaptureRef = useRef<HTMLDivElement>(null)

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

  const saveImage = async () => {
    if (!cardCaptureRef.current || isSavingImage) return
    setIsSavingImage(true)
    try {
      // 캡처 직전에 번들 글꼴 로딩까지 기다려 웹 카드와 PNG의 글자 모양을 맞춘다.
      await document.fonts.ready
      // 웹에서는 카드 바깥의 시트 색과 그림자까지 함께 보인다. 카드 본체만 캡처하면
      // 그림자가 잘리고 저장본이 다른 카드처럼 보이므로, 동일한 배경 여백을 둔 래퍼를 캡처한다.
      // html-to-image(svg foreignObject 방식)는 WebKit/Safari에서 카드 오른쪽이 잘리는 문제가 있어
      // DOM을 직접 순회해 그리는 html2canvas를 계속 사용한다. S3가 CORS를 허용하므로
      // useCORS를 켜야 콜라주 제품 이미지를 오염 없이 PNG에 포함할 수 있다.
      const canvas = await html2canvas(cardCaptureRef.current, {
        backgroundColor: '#1e1710',
        scale: 2,
        useCORS: true,
        imageTimeout: 15_000,
        onclone: (document) => {
          // 화면에서 이미 끝난 카드 채움 모션을 저장본에서도 같은 최종 상태로 고정한다.
          document.querySelectorAll<HTMLElement>('.stage-b-journey-card-photo').forEach((element) => {
            element.style.opacity = '1'
            element.style.transform = 'scale(1)'
            element.style.transition = 'none'
          })
          document.querySelectorAll<HTMLElement>('.stage-b-journey-card-value').forEach((element) => {
            element.style.opacity = '0.75'
            element.style.transition = 'none'
          })
          document.querySelectorAll<HTMLElement>('.stage-b-journey-card-completion-stamp').forEach((element) => {
            element.style.opacity = '1'
            element.style.animation = 'none'
            element.style.transform = 'scale(1) rotate(0deg)'
          })
        },
      })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
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
          <div className="stage-b-journey-card-capture" ref={cardCaptureRef}>
            <JourneyPassportCard journeyCard={journeyCard} />
          </div>
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
