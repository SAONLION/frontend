import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { STAGE_B_ROUTES } from '../../constants/appRoutes'
import {
  clearPendingJourneyCompletionCard,
  getPendingJourneyCompletionCard,
} from '../../features/journey-card/journeyCompletionStore'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'

/**
 * 여권 콜라주 4칸이 다 채워진 뒤 "다른 제품 보기"를 눌렀을 때 B1 복귀 대신 뜨는 팝업.
 * `useReturnToB1`이 완성을 확인하며 이미 받아둔 journey-card 응답을 그대로 보여준다.
 */
export function JourneyCardCompletionPopup() {
  const { state, dispatch } = useSession()
  const navigate = usePreparedNavigate()
  const card = getPendingJourneyCompletionCard()
  const nickname = card?.nickname || state.nickname || '고객'

  const viewPassport = () => {
    dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'journey' })
  }

  const dismiss = () => {
    clearPendingJourneyCompletionCard()
    dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null })
    navigate(STAGE_B_ROUTES.nfcPrompt)
  }

  return (
    <div className="fixed inset-0 z-65 pointer-events-none">
      <button aria-label="닫기" className="stage-sheet-backdrop" onClick={dismiss} type="button" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
        <div className="pointer-events-auto flex w-full max-w-[320px] flex-col items-center gap-2.5 overflow-hidden rounded-[23px] bg-[#1e1710] px-6 pt-5.25 pb-4.75 shadow-[0_1rem_2.5rem_rgba(0,0,0,0.32)]">
          <p className="text-center text-[17.6px] leading-tight font-semibold text-white">
            {nickname}님의 여권이 완성되었어요!
            <br />
            지금 바로 확인해보세요.
          </p>
          <div className="flex h-[43.2px] w-full items-center gap-2">
            <button
              className="h-[36.8px] flex-1 rounded-[30px] bg-[#8a5111] text-[12.8px] font-medium text-white shadow-[inset_0_-1.6px_3.2px_rgba(255,255,255,0.25)]"
              onClick={viewPassport}
              type="button"
            >
              여권 보러가기
            </button>
            <button
              className="h-[36.8px] flex-1 rounded-[48px] bg-white/15 text-[12.8px] font-medium text-white"
              onClick={dismiss}
              type="button"
            >
              괜찮아요
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
