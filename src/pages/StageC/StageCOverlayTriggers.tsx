import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';

// StageC 내부에는 단일 "직원 호출"/"재고 없음" 콜백이 없어서, 두 핸드오프
// 경로(useProductExit이 쓰는 comingSoon/STAGE-E1, 허브의 재고확인 메뉴)에
// 이 얇은 트리거만 매핑한다: 오버레이를 띄우고 배경은 StageC 허브로 되돌린다.
function useOverlayTrigger(overlay: 'E' | 'F') {
  const { sku = '' } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useSession();

  useEffect(() => {
    dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay });
    navigate(stageCPath(STAGE_C_ROUTES.c1, sku), { replace: true });
  }, [dispatch, navigate, overlay, sku]);

  return null;
}

export function StageCStaffCallTriggerPage() {
  return useOverlayTrigger('E');
}

export function StageCStockOverlayTriggerPage() {
  return useOverlayTrigger('F');
}
