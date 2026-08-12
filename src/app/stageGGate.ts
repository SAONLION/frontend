import type { SessionState } from '../features/session/sessionTypes';

// 임시 구현: 항상 loopCount>=2(=D1이 뜨지 않는 턴)이고 아직 안 보여줬으면 true.
// 실제로는 AI 판단(CB6 신호)에 따라 노출 여부를 결정해야 한다.
export function shouldShowStageG(session: SessionState): boolean {
  return !session.hasShownStageG && session.loopCount >= 2;
}
