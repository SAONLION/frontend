import { useNavigate } from 'react-router';
import { STAGE_B_ROUTES, STAGE_G_ROUTES } from '../constants/appRoutes';
import { SESSION_ACTIONS } from '../features/session/sessionTypes';
import { useSession } from '../features/session/useSession';
import { shouldShowStageG } from './stageGGate';

// D2-1/G4의 "다른 제품 보기 →"가 공유하는 복귀 로직: G를 아직 안 보여줬고
// 보여줄 차례면 G1로, 아니면 loopCount를 올리고 B1로 바로 복귀한다.
export function useReturnToB1() {
  const navigate = useNavigate();
  const { state, dispatch } = useSession();

  return () => {
    if (shouldShowStageG(state)) {
      dispatch({ type: SESSION_ACTIONS.markStageGShown });
      navigate(STAGE_G_ROUTES.content);
      return;
    }

    dispatch({ type: SESSION_ACTIONS.incrementLoopCount });
    navigate(STAGE_B_ROUTES.nfcPrompt);
  };
}
