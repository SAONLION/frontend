import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { STAGE_B_ROUTES } from '../constants/appRoutes';
import { useSession } from '../features/session/useSession';
import { SESSION_ACTIONS } from '../features/session/sessionTypes';
import E1StaffCallTray from '../pages/StageE/E1StaffCallTray';
import E2RequestReceived from '../pages/StageE/E2RequestReceived';

// 배경 화면을 완전히 가리지 않는 논블로킹 바텀시트: 뒤쪽 라우트는 언마운트되지 않고
// 화면 상단은 계속 보이며 클릭도 가능하다(시트 바깥에 백드롭을 깔지 않음).
export default function EOverlay() {
  const { dispatch } = useSession();
  const navigate = useNavigate();
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  const close = () => {
    if (isClosing) return;
    const closeDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    if (closeDelay === 0) {
      dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null });
      return;
    }
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null });
    }, closeDelay);
  };

  const viewOtherProducts = () => {
    dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null });
    navigate(STAGE_B_ROUTES.nfcPrompt);
  };

  return (
    <div className={`stage-overlay${isClosing ? ' stage-overlay--closing' : ''}`}>
      {submitted ? (
        <E2RequestReceived selectedRequests={selectedRequests} onClose={close} />
      ) : (
        <E1StaffCallTray
          onChangeSelectedRequests={(selected) => {
            const latest = selected[selected.length - 1];
            if (latest) {
              setSelectedRequests([latest]);
              setSubmitted(true);
            }
          }}
          onSelectOther={() => {
            setSelectedRequests(['기타']);
            setSubmitted(true);
          }}
          onViewOtherProducts={viewOtherProducts}
          onClose={close}
        />
      )}
    </div>
  );
}
