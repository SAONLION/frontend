import { Outlet, useLocation } from 'react-router';
import { useSession } from '../features/session/useSession';
import EOverlay from './EOverlay';

export default function AppLayout() {
  const { state } = useSession();
  const location = useLocation();
  const motionKey = location.pathname
    .replace(/\/staff-call\/(?:pending|completed)$/, '/staff-call')
    .replace(/\/fit\/(?:try-on\/(?:pending|completed)|purchase-inquiry\/completed)$/, '/fit/status');

  return (
    <div className="relative min-h-dvh w-full">
      <div className="screen-motion-shell" data-motion-screen key={motionKey}>
        <Outlet />
      </div>
      {state.activeOverlay === 'E' && <EOverlay />}
    </div>
  );
}
