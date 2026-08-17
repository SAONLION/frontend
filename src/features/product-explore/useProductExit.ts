import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { EVENT_NAMES } from '../../constants/events'
import { STAGE_D_ROUTES } from '../../constants/appRoutes'
import { STAGE_C_SCREEN_IDS, stageCComingSoonPath } from '../../constants/stageC'
import { SESSION_ACTIONS } from '../session/sessionTypes'
import { useSession } from '../session/useSession'

// 첫 제품 이탈은 D1 방문 목적 확인(→ D2 → D2-1)으로, 두 번째 이후 이탈은
// D3 개인화 추천(→ D4 위치 안내)으로 이어진다.
export function useProductExit(sku: string) {
  const { state, dispatch } = useSession()
  const navigate = usePreparedNavigate()

  return () => {
    const exitCount = state.events.filter((event) => event.name === EVENT_NAMES.productExit).length
    dispatch({ type: SESSION_ACTIONS.recordProductExit, sku })

    if (exitCount === 0) {
      navigate(stageCComingSoonPath(sku, STAGE_C_SCREEN_IDS.stageD1))
      return
    }

    navigate(STAGE_D_ROUTES.personalizedRecommend)
  }
}
