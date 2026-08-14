import { useState } from 'react';
import { useSession } from '../features/session/useSession';
import { SESSION_ACTIONS } from '../features/session/sessionTypes';
import E1StaffCallTray from '../pages/StageE/E1StaffCallTray';
import E2RequestReceived from '../pages/StageE/E2RequestReceived';

// 배경 화면을 완전히 가리지 않는 논블로킹 바텀시트: 뒤쪽 라우트는 언마운트되지 않고
// 화면 상단은 계속 보이며 클릭도 가능하다(시트 바깥에 백드롭을 깔지 않음).
export default function EOverlay() {
  const { dispatch } = useSession();
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const close = () => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null });

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 h-[88dvh] overflow-y-auto rounded-t-[24px] shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
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
          onClose={close}
        />
      )}
    </div>
  );
}
