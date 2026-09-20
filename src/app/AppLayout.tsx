import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useSession } from '../features/session/useSession';
import { rememberNavigationTrigger } from './navigationTrigger';
import EOverlay from './EOverlay';
import { DegradationNotice } from '../components/common/DegradationNotice';
import { JourneyCardCompletionPopup } from '../components/domain/JourneyCardCompletionPopup';
import { JourneyCardTopSheet } from '../components/domain/JourneyCardTopSheet';
import { JourneyCardTrigger } from '../components/domain/JourneyCardTrigger';

function useDocumentScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // body를 fixed로 바꾸면 iOS Safari가 하단 Liquid Glass 아래의 페이지 합성을
    // 중단한다. 문서 레이아웃은 그대로 두고, 시트가 열려 있는 동안만 스크롤 제스처를 막는다.
    const preventTouchScroll = (event: TouchEvent) => event.preventDefault();
    const preventWheelScroll = (event: WheelEvent) => event.preventDefault();

    document.addEventListener('touchmove', preventTouchScroll, { passive: false });
    document.addEventListener('wheel', preventWheelScroll, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventTouchScroll);
      document.removeEventListener('wheel', preventWheelScroll);
    };
  }, [isLocked]);
}

export default function AppLayout() {
  const { state } = useSession();
  const location = useLocation();
  const motionKey = location.pathname
    .replace(/\/staff-call\/(?:pending|completed)$/, '/staff-call')
    .replace(/\/fit\/(?:try-on\/(?:pending|completed)|purchase-inquiry\/completed)$/, '/fit/status');

  // 여권 버튼은 StageC·StageD 화면에만 둔다.
  const showsJourneyTrigger = location.pathname.startsWith('/stage-c/') || location.pathname.startsWith('/stage-d/');
  // 여권 탑시트는 배경을 보며 위쪽에서 확인하는 비차단 시트다. 열려 있는 동안에도
  // 문서를 스크롤할 수 있어야 하므로, 조작을 완전히 막는 직원 호출·완성 팝업만 잠근다.
  useDocumentScrollLock(state.activeOverlay === 'E' || state.activeOverlay === 'journeyComplete');

  return (
    <div className="relative min-h-dvh w-full" onPointerDownCapture={(event) => rememberNavigationTrigger(event.target)}>
      <div className="screen-motion-shell" data-motion-screen key={motionKey}>
        <Outlet />
      </div>
      {/* 화면이 바뀔 때마다 다시 마운트돼 진입 모션을 함께 탄다. */}
      {showsJourneyTrigger && <JourneyCardTrigger key={`journey-${motionKey}`} />}
      {state.activeOverlay === 'E' && <EOverlay />}
      {state.activeOverlay === 'journey' && <JourneyCardTopSheet />}
      {state.activeOverlay === 'journeyComplete' && <JourneyCardCompletionPopup />}
      <DegradationNotice />
    </div>
  );
}
