import { useSession } from '../features/session/useSession';
import { SESSION_ACTIONS } from '../features/session/sessionTypes';
import { PRIMARY_BG, PRIMARY_INSET_HIGHLIGHT } from '../styles/tokens';

export default function FloatingStaffCallButton() {
  const { state, dispatch } = useSession();

  if (state.activeOverlay) return null;

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'E' })}
      className={`fixed bottom-6 right-5 z-40 rounded-full px-5 py-3 text-[14px] font-medium text-white ${PRIMARY_BG} ${PRIMARY_INSET_HIGHLIGHT}`}
    >
      직원 호출
    </button>
  );
}
