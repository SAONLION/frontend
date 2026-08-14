import { useNavigate } from 'react-router';
import { STAGE_A_ROUTES, STAGE_B_ROUTES } from '../../constants/appRoutes';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import A1DocentIntro from './A1DocentIntro';
import A2NicknameSetup from './A2NicknameSetup';

// A1DocentIntro는 정적 스플래시라 내부에 진행 버튼이 없다 — 화면 컴포넌트는
// 건드리지 않고, 화면 전체를 감싸는 탭 영역으로 다음 화면 진입을 트리거한다.
export function StageAIntroPage() {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="화면을 누르면 닉네임 설정으로 이동"
      onClick={() => navigate(STAGE_A_ROUTES.nickname)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') navigate(STAGE_A_ROUTES.nickname);
      }}
    >
      <A1DocentIntro />
    </div>
  );
}

export function StageANicknamePage() {
  const navigate = useNavigate();
  const { dispatch } = useSession();

  const saveNickname = (nickname: string) => {
    dispatch({ type: SESSION_ACTIONS.setNickname, nickname });
    navigate(STAGE_B_ROUTES.nfcPrompt);
  };

  return <A2NicknameSetup onSubmit={saveNickname} />;
}
