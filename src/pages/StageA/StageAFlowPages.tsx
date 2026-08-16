import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { updateNickname } from '../../api/session'
import { STAGE_A_ROUTES, STAGE_B_ROUTES } from '../../constants/appRoutes'
import { preloadJourneyCardFrame } from '../../features/journey-card/preloadJourneyCardFrame'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import A1DocentIntro from './A1DocentIntro'
import A2NicknameSetup from './A2NicknameSetup'

export function StageAIntroPage() {
  const navigate = usePreparedNavigate()

  return <A1DocentIntro onContinue={() => navigate(STAGE_A_ROUTES.nickname)} />
}

export function StageANicknamePage() {
  const navigate = usePreparedNavigate()
  const { state, dispatch } = useSession()

  const saveNickname = (nickname: string) => {
    dispatch({ type: SESSION_ACTIONS.setNickname, nickname })
    // B1은 도슨트가 없고 여권 카드가 주인공이다. 카드 틀을 다 받은 뒤 넘어가야
    // 텍스처가 뒤늦게 깔리는 게 안 보인다. 사진·텍스트는 도착 순서대로 채워진다.
    navigate(STAGE_B_ROUTES.nfcPrompt, { prepare: preloadJourneyCardFrame, skipDocentPreload: true })

    if (state.sessionId) {
      void updateNickname(state.sessionId, nickname).catch((error: unknown) => {
        console.error('닉네임 저장에 실패했습니다.', error)
      })
    }
  }

  return <A2NicknameSetup onSubmit={saveNickname} />
}
