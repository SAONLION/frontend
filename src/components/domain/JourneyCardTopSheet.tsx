import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import html2canvas from 'html2canvas-pro'
import { ApiError } from '../../api/client'
import { createContact } from '../../api/contacts'
import { fetchJourneyCard, type JourneyCardResponse } from '../../api/journeyCard'
import { clearDegraded, DEGRADATION_KEYS, markDegraded } from '../../features/degradation/degradationStore'
import { registerPersonalizedMailRecipient, retryPendingPersonalizedMail } from '../../features/email/personalizedMailStore'
import {
  clearPendingJourneyCompletionCard,
  getPendingJourneyCompletionCard,
} from '../../features/journey-card/journeyCompletionStore'
import ScreenHeadline from '../common/ScreenHeadline'
import { consumeBlockerExposureGroup } from '../../features/session/sessionStorage'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { JourneyPassportCard } from './JourneyPassportCard'

const CLOSE_ANIMATION_MS = 420
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSPORT_CAPTURE_SCALE = 2

function usesPortalExportSource(userAgent: string): boolean {
  // Safari의 Canvas 렌더러는 화면에 있는 여권 프레임을 정확히 보존한다. Chromium은
  // 스크롤 시트 밖 포털 프레임을 써야 absolute 요소의 좌표가 흔들리지 않는다.
  return !/AppleWebKit/.test(userAgent) || /(?:Chrome|Chromium|CriOS|Edg|OPR)\//.test(userAgent)
}

/**
 * 여권 카드 탑시트. 배경 화면을 가리거나 조작을 막지 않는 비차단 시트이며,
 * 손잡이를 위로 끌어 닫는다. 닫힘 모션만 하단 직원 호출 시트(EOverlay)와 공유한다.
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
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [hasConsent, setHasConsent] = useState(false)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const closeTimerRef = useRef<number | null>(null)
  const dragStartYRef = useRef<number | null>(null)
  const dragOffsetRef = useRef(0)
  const visibleCaptureFrameRef = useRef<HTMLDivElement>(null)
  const portalCaptureFrameRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    if (!state.sessionId) return
    let cancelled = false

    // 앞선 추천 메일 발송이 실패해 남아 있다면 여권을 열어본 이 시점에 다시 시도한다.
    retryPendingPersonalizedMail(state.sessionId)

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

  const close = useCallback(() => {
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
  }, [dispatch, isClosing])

  useEffect(() => {
    const closeOnOutsidePointerDown = (event: globalThis.PointerEvent) => {
      if (!(event.target instanceof Node) || panelRef.current?.contains(event.target)) return
      close()
    }

    document.addEventListener('pointerdown', closeOnOutsidePointerDown, true)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointerDown, true)
  }, [close])

  const startSheetDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    dragStartYRef.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveSheetDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const startY = dragStartYRef.current
    if (startY === null) return
    event.preventDefault()
    // 위로 끌 때만 따라간다. 아래로는 늘어나지 않는다.
    const nextOffset = Math.min(0, event.clientY - startY)
    dragOffsetRef.current = nextOffset
    setDragOffset(nextOffset)
  }

  const endSheetDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStartYRef.current === null) return
    event.preventDefault()
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
    const captureFrame = usesPortalExportSource(navigator.userAgent)
      ? portalCaptureFrameRef.current
      : visibleCaptureFrameRef.current
    if (!captureFrame || isSavingImage) return
    setIsSavingImage(true)
    try {
      // 캡처 직전에 번들 글꼴 로딩까지 기다려 웹 카드와 PNG의 글자 모양을 맞춘다.
      await document.fonts.ready
      // 선택된 프레임 자체가 갈색 배경과 사방 1rem 여백을 가진다. S3가 CORS를
      // 허용하므로 useCORS를 켠다.
      const canvas = await html2canvas(captureFrame, {
        backgroundColor: '#1e1710',
        scale: PASSPORT_CAPTURE_SCALE,
        useCORS: true,
        imageTimeout: 15_000,
        onclone: (_, clonedCaptureFrame) => {
          // Chromium은 탑시트 바깥 포털 프레임을, Safari는 화면 프레임을 사용한다.
          // 화면에서 이미 끝난 카드 채움 모션만 저장본에서 최종 상태로 고정한다.
          clonedCaptureFrame.querySelectorAll<HTMLElement>('.stage-b-journey-card-photo').forEach((element) => {
            element.style.opacity = '1'
            element.style.transform = 'scale(1)'
            element.style.transition = 'none'
          })
          clonedCaptureFrame.querySelectorAll<HTMLElement>('.stage-b-journey-card-value').forEach((element) => {
            element.style.opacity = '0.75'
            element.style.transition = 'none'
          })
          clonedCaptureFrame.querySelectorAll<HTMLElement>('.stage-b-journey-card-completion-stamp').forEach((element) => {
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

  /**
   * CB6(F2-2)에 도달하기 전에도 같은 콘텐츠를 받을 수 있는 경로.
   *
   * 저장·발송 규칙은 F2-2와 같다. 연락처를 서버에 남기고 개인화 추천 메일을 곧바로 보낸다 —
   * 콜라주가 덜 찼으면 그때까지 채워진 PICK만 담겨 나간다.
   */
  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmittingContact) return
    const normalizedEmail = email.trim()
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setContactMessage('이메일 주소를 확인해주세요.')
      return
    }
    if (!state.sessionId) {
      setContactMessage('세션을 확인하지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsSubmittingContact(true)
    setContactMessage('')
    try {
      await createContact(state.sessionId, {
        email: normalizedEmail,
        productId: state.productId ?? undefined,
        contentTopic: 'personalized_product_content',
      })
      registerPersonalizedMailRecipient(state.sessionId, normalizedEmail)
      // 고객이 먼저 신청한 경로라 '제안(contact_offer)'은 남기지 않는다. 수집 사실만 기록하면
      // 세션 상태의 cb6Handled·contactCaptured가 함께 세워진다.
      dispatch({ type: SESSION_ACTIONS.recordContactCaptured, channel: 'email', blockerCode: 'CB6' })
      if (state.currentSku) dispatch({ type: SESSION_ACTIONS.recordContentSent, sku: state.currentSku })
      // 새로고침 뒤에도 서버가 뒤늦게 보낸 CB5·CB6 제안이 다시 뜨지 않도록 노출분을 소진시킨다.
      consumeBlockerExposureGroup(state.sessionId, 'CB56')
      setIsContactFormOpen(false)
      setEmail('')
      setHasConsent(false)
    } catch (error: unknown) {
      console.error('콘텐츠 발송 요청에 실패했습니다.', error)
      setContactMessage('발송 요청을 전달하지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const hasRequestedContent = state.blocker.contactCaptured
  const nickname = journeyCard?.nickname || state.nickname || '고객'

  return (
    <>
    <div className={`stage-top-sheet${isClosing ? ' stage-top-sheet--closing' : ''}`}>
      {/* 여권은 비차단 탑시트다. 바깥 화면을 가리거나 조작을 막지 않으며, 손잡이로 닫는다. */}
      <div
        className={`stage-top-sheet__panel${isDragging ? ' stage-top-sheet__panel--dragging' : ''}`}
        ref={panelRef}
        style={{ translate: `0 ${dragOffset}px` } as CSSProperties}
      >
        <div className="stage-top-sheet__content">
          <ScreenHeadline
            className="stage-top-sheet__headline"
            headline={`${nickname}님을 위한 여권을 저장해보세요!`}
            variant="md"
          />
          <div className="stage-b-journey-card-capture" ref={visibleCaptureFrameRef}>
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
            <button
              aria-expanded={isContactFormOpen}
              className="stage-c-action-button"
              disabled={hasRequestedContent}
              onClick={() => { setIsContactFormOpen((isOpen) => !isOpen); setContactMessage('') }}
              type="button"
            >
              {hasRequestedContent ? '컨텐츠 신청 완료' : '컨텐츠 받기'}
            </button>
          </div>
          {hasRequestedContent && (
            <p className="stage-top-sheet__contact-note">
              등록하신 이메일로 콘텐츠를 보내드렸어요.
            </p>
          )}
          {isContactFormOpen && !hasRequestedContent && (
            <form className="stage-top-sheet__contact-form" onSubmit={submitContact}>
              <label className="sr-only" htmlFor="journey-card-contact-email">이메일</label>
              <input
                autoComplete="email"
                className="stage-top-sheet__contact-input"
                disabled={isSubmittingContact}
                id="journey-card-contact-email"
                inputMode="email"
                placeholder="이메일"
                type="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setContactMessage('') }}
              />
              {contactMessage && <p className="stage-top-sheet__contact-error" role="alert">{contactMessage}</p>}
              <label className="stage-top-sheet__contact-consent">
                <input
                  checked={hasConsent}
                  disabled={isSubmittingContact}
                  type="checkbox"
                  onChange={(event) => setHasConsent(event.target.checked)}
                />
                <span>본인은 제품 관련 콘텐츠 제공을 위해 ㈜엠씨엠코리아의 개인정보처리방침에 따라 본인의 이메일 주소가 1회에 한해 수집·이용되며, 목적 달성 후 즉시 파기됨에 동의합니다.</span>
              </label>
              <button
                className="stage-c-action-button stage-c-action-button--primary stage-top-sheet__contact-submit"
                disabled={!email.trim() || !hasConsent || isSubmittingContact}
                type="submit"
              >
                {isSubmittingContact ? '보내는 중…' : '콘텐츠 받기'}
              </button>
            </form>
          )}
        </div>
        <button
          aria-label="위로 끌어 여권 닫기"
          className="stage-top-sheet__drag-handle"
          onPointerCancel={endSheetDrag}
          onPointerDown={startSheetDrag}
          onPointerMove={moveSheetDrag}
          onPointerUp={endSheetDrag}
          type="button"
        />
      </div>
    </div>
    {createPortal(
      <div aria-hidden="true" className="stage-journey-card-export-source" ref={portalCaptureFrameRef}>
        <JourneyPassportCard journeyCard={journeyCard} />
      </div>,
      document.body,
    )}
    </>
  )
}
