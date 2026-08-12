import { Outlet } from 'react-router';
import { useSession } from '../features/session/useSession';
import FloatingStaffCallButton from './FloatingStaffCallButton';
import EOverlay from './EOverlay';
import FOverlay from './FOverlay';

export default function AppLayout() {
  const { state } = useSession();

  return (
    <div className="relative min-h-dvh w-full">
      <Outlet />
      <FloatingStaffCallButton />
      {state.activeOverlay === 'E' && <EOverlay />}
      {state.activeOverlay === 'F' && <FOverlay />}
    </div>
  );
}
