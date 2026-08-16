import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useLocation } from 'react-router';
import { usePreparedNavigate } from './usePreparedNavigate';
import { STAGE_B_ROUTES } from '../constants/appRoutes';
import { useSession } from '../features/session/useSession';
import { SESSION_ACTIONS } from '../features/session/sessionTypes';
import E1StaffCallTray from '../pages/StageE/E1StaffCallTray';
import E2RequestReceived from '../pages/StageE/E2RequestReceived';

// 배경 화면을 완전히 가리지 않는 논블로킹 바텀시트: 뒤쪽 라우트는 언마운트되지 않고
// 화면 상단은 계속 보이며 클릭도 가능하다(시트 바깥에 백드롭을 깔지 않음).
export default function EOverlay() {
  const { dispatch } = useSession();
  const navigate = usePreparedNavigate();
  const location = useLocation();
  // B1은 이미 재태그 지점이라 시트 안에서 `다른 제품 보기`를 다시 제안하지 않는다.
  const isOverStageB1 = location.pathname === STAGE_B_ROUTES.nfcPrompt;
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  const close = () => {
    if (isClosing) return;
    const closeDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    if (closeDelay === 0) {
      dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null });
      return;
    }
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null });
    }, closeDelay);
  };

  const viewOtherProducts = () => {
    dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null });
    navigate(STAGE_B_ROUTES.nfcPrompt);
  };

  const startSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragStartYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    const startY = dragStartYRef.current;
    if (startY === null) return;
    const nextOffset = Math.max(0, event.clientY - startY);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const endSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragStartYRef.current === null) return;
    dragStartYRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const sheetHeight = event.currentTarget.closest('.stage-external-page')?.clientHeight ?? 0;
    if (dragOffsetRef.current >= Math.max(96, sheetHeight * 0.24)) {
      close();
      return;
    }
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  const sheetHandle = <span aria-label="아래로 끌어 직원 호출 시트 닫기" className="stage-overlay__drag-handle" onPointerCancel={endSheetDrag} onPointerDown={startSheetDrag} onPointerMove={moveSheetDrag} onPointerUp={endSheetDrag} />;

  return (
    <div className={`stage-overlay${isClosing ? ' stage-overlay--closing' : ''}`}>
      {/* 뒤 화면을 덮어 어둡게 하고 그 영역의 조작을 막는다. 눌러서 닫을 수도 있다. */}
      <button aria-label="직원 호출 닫기" className="stage-sheet-backdrop" onClick={close} type="button" />
      {submitted ? (
        <E2RequestReceived isDragging={isDragging} selectedRequests={selectedRequests} sheetHandle={sheetHandle} sheetOffset={dragOffset} />
      ) : (
        <E1StaffCallTray
          isDragging={isDragging}
          onChangeSelectedRequests={(selected) => {
            const latest = selected[selected.length - 1];
            if (latest) {
              setSelectedRequests([latest]);
              setSubmitted(true);
            }
          }}
          onSelectOther={() => {
            setSelectedRequests(['기타']);
            setSubmitted(true);
          }}
          onViewOtherProducts={viewOtherProducts}
          sheetHandle={sheetHandle}
          sheetOffset={dragOffset}
          showViewOtherProducts={!isOverStageB1}
        />
      )}
    </div>
  );
}
