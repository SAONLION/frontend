import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';

// StageC 내부의 직원 호출 핸드오프 경로에서 E 오버레이를 띄우고,
// 배경은 StageC 허브로 되돌린다.
function useOverlayTrigger() {
  const { sku = '' } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useSession();

  useEffect(() => {
    dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'E' });
    navigate(stageCPath(STAGE_C_ROUTES.c1, sku), { replace: true });
  }, [dispatch, navigate, sku]);

  return null;
}

export function StageCStaffCallTriggerPage() {
  return useOverlayTrigger();
}
