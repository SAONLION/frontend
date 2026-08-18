import { usePreparedNavigate } from './usePreparedNavigate';
import { STAGE_B_ROUTES } from '../constants/appRoutes';
import { fetchJourneyCard, JOURNEY_CARD_COLLAGE_SLOTS } from '../api/journeyCard';
import { setPendingJourneyCompletionCard } from '../features/journey-card/journeyCompletionStore';
import { SESSION_ACTIONS } from '../features/session/sessionTypes';
import { useSession } from '../features/session/useSession';

// 재태그를 선택한 뒤 B1로 복귀하는 공통 흐름이다.
// 다만 여권 콜라주 4칸이 이미 다 채워진 상태라면, B1로 곧장 보내는 대신
// "여권이 완성되었어요" 팝업을 먼저 보여준다.
export function useReturnToB1() {
  const navigate = usePreparedNavigate();
  const { state, dispatch } = useSession();

  return () => {
    const sessionId = state.sessionId;
    if (!sessionId) {
      navigate(STAGE_B_ROUTES.nfcPrompt);
      return;
    }

    fetchJourneyCard(sessionId)
      .then((journeyCard) => {
        if (journeyCard.collageImages.length >= JOURNEY_CARD_COLLAGE_SLOTS) {
          setPendingJourneyCompletionCard(journeyCard);
          dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'journeyComplete' });
          return;
        }
        navigate(STAGE_B_ROUTES.nfcPrompt);
      })
      .catch((error: unknown) => {
        // 완성 여부를 확인하지 못해도 재태그 흐름 자체를 막지는 않는다.
        console.error('여정 카드 조회에 실패했습니다.', error);
        navigate(STAGE_B_ROUTES.nfcPrompt);
      });
  };
}
