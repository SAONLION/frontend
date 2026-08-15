import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { EVENT_NAMES } from '../../constants/events'
import { STAGE_B_ROUTES, STAGE_F_ROUTES } from '../../constants/appRoutes'
import { getCb6TriggerId } from '../blocker/shouldOfferCb6'
import { STAGE_C_SCREEN_IDS, stageCComingSoonPath } from '../../constants/stageC'
import { SESSION_ACTIONS } from '../session/sessionTypes'
import { useSession } from '../session/useSession'

// 첫 제품 이탈은 D1 방문 목적 확인으로, 이후 이탈은 B1 재태그로 이어진다.
export function useProductExit(sku: string) {
  const { state, dispatch } = useSession()
  const navigate = usePreparedNavigate()

  return () => {
    const exitCount = state.events.filter((event) => event.name === EVENT_NAMES.productExit).length
    dispatch({ type: SESSION_ACTIONS.recordProductExit, sku })

    // A CB6 intervention replaces this turn's normal D1/B1 handoff, never overlays it.
    const cb6TriggerId = getCb6TriggerId(state, sku)
    if (cb6TriggerId) {
      navigate(STAGE_F_ROUTES.cb6Offer, { state: { triggerId: cb6TriggerId } })
      return
    }

    if (exitCount === 0) {
      navigate(stageCComingSoonPath(sku, STAGE_C_SCREEN_IDS.stageD1))
      return
    }

    navigate(STAGE_B_ROUTES.nfcPrompt)
  }
}
