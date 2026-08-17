import { Outlet, useLocation } from 'react-router';
import { useSession } from '../features/session/useSession';
import { rememberNavigationTrigger } from './navigationTrigger';
import EOverlay from './EOverlay';
import { DegradationNotice } from '../components/common/DegradationNotice';
import { JourneyCardTopSheet } from '../components/domain/JourneyCardTopSheet';
import { JourneyCardTrigger } from '../components/domain/JourneyCardTrigger';

export default function AppLayout() {
  const { state } = useSession();
  const location = useLocation();
  const motionKey = location.pathname
    .replace(/\/staff-call\/(?:pending|completed)$/, '/staff-call')
    .replace(/\/fit\/(?:try-on\/(?:pending|completed)|purchase-inquiry\/completed)$/, '/fit/status');

  // 여권 버튼은 StageC·StageD 화면에만 둔다.
  const showsJourneyTrigger = location.pathname.startsWith('/stage-c/') || location.pathname.startsWith('/stage-d/');

  return (
    <div className="relative min-h-dvh w-full" onPointerDownCapture={(event) => rememberNavigationTrigger(event.target)}>
      <div className="screen-motion-shell" data-motion-screen key={motionKey}>
        <Outlet />
      </div>
      {/* 화면이 바뀔 때마다 다시 마운트돼 진입 모션을 함께 탄다. */}
      {showsJourneyTrigger && <JourneyCardTrigger key={`journey-${motionKey}`} />}
      {state.activeOverlay === 'E' && <EOverlay />}
      {state.activeOverlay === 'journey' && <JourneyCardTopSheet />}
      <DegradationNotice />
    </div>
  );
}
