import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useSession } from '../features/session/useSession';
import { rememberNavigationTrigger } from './navigationTrigger';
import EOverlay from './EOverlay';
import { DegradationNotice } from '../components/common/DegradationNotice';
import { JourneyCardCompletionPopup } from '../components/domain/JourneyCardCompletionPopup';
import { JourneyCardTopSheet } from '../components/domain/JourneyCardTopSheet';
import { JourneyCardTrigger } from '../components/domain/JourneyCardTrigger';

function useDocumentScrollLock(isLocked: boolean) {
  useLayoutEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      right: body.style.right,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
    };
    const previousRootStyles = {
      overflow: root.style.overflow,
      overscrollBehavior: root.style.overscrollBehavior,
    };

    // iOS Safari는 overflow: hidden만으로 뒤 문서가 밀리는 것을 막지 못한다.
    // body를 현재 위치에 고정해 시트 밖의 드래그가 배경 스크롤로 전달되지 않게 한다.
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.right = '0';
    body.style.left = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    root.style.overflow = 'hidden';
    root.style.overscrollBehavior = 'none';

    return () => {
      Object.assign(body.style, previousBodyStyles);
      Object.assign(root.style, previousRootStyles);
      window.scrollTo(0, scrollY);
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
  useDocumentScrollLock(state.activeOverlay !== null);

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
