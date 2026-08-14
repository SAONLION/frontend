import { useNavigate } from 'react-router';
import { STAGE_B_ROUTES } from '../constants/appRoutes';

// 재태그를 선택한 뒤 B1로 복귀하는 공통 흐름이다.
export function useReturnToB1() {
  const navigate = useNavigate();

  return () => {
    navigate(STAGE_B_ROUTES.nfcPrompt);
  };
}
