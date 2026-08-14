import { useNavigate } from 'react-router'
import { EVENT_NAMES } from '../../constants/events'
import { STAGE_B_ROUTES, STAGE_G_ROUTES } from '../../constants/appRoutes'
import { STAGE_C_SCREEN_IDS, stageCComingSoonPath } from '../../constants/stageC'
import { SESSION_ACTIONS } from '../session/sessionTypes'
import { useSession } from '../session/useSession'
import { shouldShowStageG } from '../../app/stageGGate'

// loopCount>=2(=D1을 건너뛰는 턴)일 때는 곧장 B1로 보내는 대신, StageG를 아직
// 안 보여줬으면 G1로 먼저 보낸다 — StageD2-1의 "다른 제품 보기"와 동일한 게이트.
export function useProductExit(sku: string) {
  const { state, dispatch } = useSession()
  const navigate = useNavigate()

  return () => {
    const exitCount = state.events.filter((event) => event.name === EVENT_NAMES.productExit).length
    dispatch({ type: SESSION_ACTIONS.recordProductExit, sku })

    if (exitCount === 0) {
      navigate(stageCComingSoonPath(sku, STAGE_C_SCREEN_IDS.stageD1))
      return
    }

    if (shouldShowStageG(state)) {
      dispatch({ type: SESSION_ACTIONS.markStageGShown })
      navigate(STAGE_G_ROUTES.content)
      return
    }

    dispatch({ type: SESSION_ACTIONS.incrementLoopCount })
    navigate(STAGE_B_ROUTES.nfcPrompt)
  }
}
