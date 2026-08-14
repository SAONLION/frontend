import { Outlet, useLocation } from 'react-router';
import { useSession } from '../features/session/useSession';
import EOverlay from './EOverlay';

export default function AppLayout() {
  const { state } = useSession();
  const location = useLocation();

  return (
    <div className="relative min-h-dvh w-full">
      <div className="screen-motion-shell" data-motion-screen key={location.pathname}>
        <Outlet />
      </div>
      {state.activeOverlay === 'E' && <EOverlay />}
    </div>
  );
}
