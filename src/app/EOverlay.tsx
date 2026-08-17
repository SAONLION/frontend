import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useLocation } from 'react-router';
import { usePreparedNavigate } from './usePreparedNavigate';
import { createStaffCall } from '../api/staffCalls';
import { DEFAULT_PRODUCT_SKU, STAGE_B_ROUTES } from '../constants/appRoutes';
import type { StaffCallType } from '../constants/events'
import { STAFF_CALL_REASONS } from '../constants/staffCallReasons';
import { clearDegraded, DEGRADATION_KEYS, markDegraded } from '../features/degradation/degradationStore';
import { useSession } from '../features/session/useSession';
import { SESSION_ACTIONS } from '../features/session/sessionTypes';
import E1StaffCallTray from '../pages/StageE/E1StaffCallTray';
import E2RequestReceived from '../pages/StageE/E2RequestReceived';

/**
 * E1 선택지를 staff-calls의 `reason`으로 옮긴다.
 *
 * STAGE E 전용 엔드포인트는 없다. 직원 호출 API는 하나뿐이고 C와 E가 함께 쓰며 `reason`으로만
 * 구분한다. 착장·구매는 전용 API(`tryon-requests`, `purchase-inquiries`)가 따로 있지만
 * E1이 그쪽이 요구하는 사이즈·컬러를 묻지 않으므로 기본값을 지어내지 않고 직원 호출로 넘긴다.
 */
const STAFF_CALL_REASON_BY_LABEL: Record<string, string> = {
  '가격 확인': STAFF_CALL_REASONS.price,
  '착장 요청': STAFF_CALL_REASONS.tryOn,
  '재고 문의': STAFF_CALL_REASONS.stock,
  '구매 요청': STAFF_CALL_REASONS.purchase,
  기타: STAFF_CALL_REASONS.other,
};

// 배경 화면을 완전히 가리지 않는 논블로킹 바텀시트: 뒤쪽 라우트는 언마운트되지 않고
// 화면 상단은 계속 보이며 클릭도 가능하다(시트 바깥에 백드롭을 깔지 않음).
export default function EOverlay() {
  const { dispatch, state } = useSession();
  const navigate = usePreparedNavigate();
  const location = useLocation();
  // B1은 이미 재태그 지점이라 시트 안에서 `다른 제품 보기`를 다시 제안하지 않는다.
  const isOverStageB1 = location.pathname === STAGE_B_ROUTES.nfcPrompt;
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  // 요청이 서버에 닿았는지. E2 문구가 이 값을 따라간다.
  const [delivery, setDelivery] = useState<'sending' | 'failed'>('sending');
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

  /**
   * 선택한 요청을 서버 직원 호출로 보내고 세션 타임라인에도 남긴다.
   * 접수 화면(E2)은 서버 응답을 기다리지 않고 바로 보여준다 — 응대는 사람이 하는 일이라
   * 네트워크 왕복 동안 고객을 붙잡아 둘 이유가 없다.
   *
   * 다만 **실패하면 E2 문구를 바꾼다.** 배너만 띄우고 "직원이 곧 안내드릴 예정"을 그대로 두면
   * 서버에 아무것도 닿지 않았는데 화면이 온 것처럼 말하게 된다.
   */
  const submitStaffCall = (label: string) => {
    // 가격·착장·재고·구매는 정보성 요청, 기타는 자유 문의로 구분한다.
    const callType: StaffCallType = label === '기타' ? 'other' : 'info';
    dispatch({ type: SESSION_ACTIONS.recordSaCall, sku: state.currentSku ?? DEFAULT_PRODUCT_SKU, callType });

    // 서버는 productId 없는 호출을 400(MISSING_PRODUCT_ID)으로 거절한다.
    // B1에서 아직 아무것도 태그하지 않았다면 이 값이 없다 — 보내볼 것도 없이 실패다.
    if (!state.sessionId || state.productId === null) {
      markDegraded(DEGRADATION_KEYS.staffCall);
      setDelivery('failed');
      return;
    }

    setDelivery('sending');
    void createStaffCall(state.sessionId, {
      productId: state.productId,
      reason: STAFF_CALL_REASON_BY_LABEL[label] ?? STAFF_CALL_REASONS.other,
    })
      .then(() => clearDegraded(DEGRADATION_KEYS.staffCall))
      .catch((error: unknown) => {
        console.error('직원 호출 요청에 실패했습니다.', error);
        markDegraded(DEGRADATION_KEYS.staffCall);
        setDelivery('failed');
      });
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
        <E2RequestReceived delivery={delivery} isDragging={isDragging} selectedRequests={selectedRequests} sheetHandle={sheetHandle} sheetOffset={dragOffset} />
      ) : (
        <E1StaffCallTray
          isDragging={isDragging}
          onChangeSelectedRequests={(selected) => {
            const latest = selected[selected.length - 1];
            if (latest) {
              setSelectedRequests([latest]);
              setSubmitted(true);
              submitStaffCall(latest);
            }
          }}
          onSelectOther={() => {
            setSelectedRequests(['기타']);
            setSubmitted(true);
            submitStaffCall('기타');
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
