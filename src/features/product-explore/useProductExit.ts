import { useNavigate } from 'react-router'
import { EVENT_NAMES } from '../../constants/events'
import { STAGE_B_ROUTES } from '../../constants/appRoutes'
import { STAGE_C_SCREEN_IDS, stageCComingSoonPath } from '../../constants/stageC'
import { SESSION_ACTIONS } from '../session/sessionTypes'
import { useSession } from '../session/useSession'
export function useProductExit(sku: string) {
  const { state, dispatch } = useSession()
  const navigate = useNavigate()

  return () => {
    const exitCount = state.events.filter((event) => event.name === EVENT_NAMES.productExit).length
    const destination = exitCount === 0 ? STAGE_C_SCREEN_IDS.stageD1 : STAGE_C_SCREEN_IDS.stageB1

    dispatch({ type: SESSION_ACTIONS.recordProductExit, sku })
    navigate(destination === STAGE_C_SCREEN_IDS.stageB1 ? STAGE_B_ROUTES.nfcPrompt : stageCComingSoonPath(sku, destination))
  }
}
