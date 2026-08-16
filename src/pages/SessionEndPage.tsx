import { useEffect } from 'react';
import { endSession } from '../api/session';
import { useSession } from '../features/session/useSession';

export default function SessionEndPage() {
  const { state } = useSession();

  useEffect(() => {
    if (!state.sessionId) return;
    void endSession(state.sessionId).catch((error: unknown) => {
      console.error('세션 종료 처리에 실패했습니다.', error);
    });
  }, [state.sessionId]);

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-black px-6 text-center">
      <p className="text-[18px] font-medium text-white">이용해주셔서 감사합니다.</p>
    </div>
  );
}
