import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router'
import {
  clearJourneyPulse,
  getJourneyPulse,
  markJourneyPulse,
  subscribeJourneyPulse,
} from '../../features/journey-card/journeyPulse'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'

/**
 * C·D 화면 우측 상단의 여권 버튼. 누르면 여권 카드 탑시트가 열린다.
 * 아이콘은 Frame 50 시안과 같은 여권(카드) 글리프를 인라인 SVG로 그린 것이다.
 */
// C5-1(AI 답변)·C5-2(직원 연결)에는 닫기 X가 이미 우측 상단에 있다. 그 화면에서만 왼쪽으로 비킨다.
const SCREENS_WITH_CLOSE = /^\/stage-c\/[^/]+\/other\/(answer|staff-call)/

export function JourneyCardTrigger() {
  const { state, dispatch } = useSession()
  const { pathname } = useLocation()
  // 태그한 제품이 늘어나면 누를 때까지 아이콘이 주기적으로 흔들린다. 버튼은 제자리를 지킨다 —
  // 누르려는 대상이 움직이면 조준이 어긋난다.
  const pulses = useSyncExternalStore(subscribeJourneyPulse, getJourneyPulse, getJourneyPulse)
  const taggedCount = state.taggedSkus.length

  // 렌더 중에 표식을 세우면 StrictMode의 이중 호출과 얽힌다. 커밋 뒤에 판정한다.
  useEffect(() => {
    markJourneyPulse(taggedCount)
  }, [taggedCount])

  if (state.activeOverlay !== null) return null

  const besideClose = SCREENS_WITH_CLOSE.test(pathname)

  const openJourney = () => {
    clearJourneyPulse()
    dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'journey' })
  }

  return (
    <div className={`stage-journey-trigger-slot${besideClose ? ' stage-journey-trigger-slot--beside-close' : ''}`}>
    <button
      aria-label={pulses ? '내 여권 보기 (새로 담긴 제품 있음)' : '내 여권 보기'}
      className="stage-journey-trigger"
      onClick={openJourney}
      type="button"
    >
      {/* 책갈피는 상단 중앙이 아니라 살짝 오른쪽에 둔다 */}
      <svg aria-hidden="true" className={`stage-journey-trigger__icon${pulses ? ' stage-journey-trigger__icon--pulsing' : ''}`} fill="none" height="17" viewBox="0 0 16 18" width="15">
        <rect height="16.4" rx="2.2" stroke="currentColor" strokeWidth="1.5" width="14.5" x="0.75" y="0.8" />
        <path d="M8.6 0.8h3.9v5.6l-1.95-1.4-1.95 1.4V0.8Z" fill="currentColor" />
      </svg>
    </button>
    </div>
  )
}
