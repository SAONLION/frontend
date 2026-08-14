import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import backgroundImage from '../../assets/images/stage-a-background.png';
import closeIcon from '../../assets/images/icon-close.svg';
import { DocentStage } from '../../components/domain/DocentStage';
import CircleIconButton from '../../components/common/CircleIconButton';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { EVENT_NAMES, type StaffCallType } from '../../constants/events';
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { findLatestFreeQueryForSku, hasOtherStaffCallForQuery } from '../../features/session/freeQueryContext';
import { useStaffCallService } from '../../features/sa-call/useStaffCallService';
import { useSession } from '../../features/session/useSession';

interface StaffCallPageProps {
  completed?: boolean;
  callType?: StaffCallType;
}

interface PendingStaffRequest {
  sku: string;
  type: StaffCallType;
  completion: Promise<'completed'>;
}

const STAFF_CALL_INFO_TRANSITION_DELAY_MS = 2_000;

export default function StaffCallPage({ completed = false, callType = 'info' }: StaffCallPageProps) {
  const { sku = '' } = useParams();
  const navigate = useNavigate();
  const { state } = useSession();
  const staffCallService = useStaffCallService();
  const pendingRequestRef = useRef<PendingStaffRequest | null>(null);
  const exitProduct = useProductExit(sku);
  const returnPath = stageCPath(callType === 'info' ? STAGE_C_ROUTES.c2 : STAGE_C_ROUTES.c5, sku);
  const completedPath = stageCPath(
    callType === 'info' ? STAGE_C_PRODUCT_DETAIL_ROUTES.staffCompleted : STAGE_C_PRODUCT_DETAIL_ROUTES.otherStaffCompleted,
    sku,
  );
  const purchaseInquiryPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku);
  const latestQuery = callType === 'other' ? findLatestFreeQueryForSku(state, sku) : null;
  const hasRequestContext =
    callType === 'other'
      ? Boolean(latestQuery && hasOtherStaffCallForQuery(state, sku, latestQuery.index))
      : state.events.some((event) => event.name === EVENT_NAMES.saCall && event.sku === sku && event.type === callType);

  useEffect(() => {
    let active = true;

    if (!hasRequestContext || completed) {
      return () => {
        active = false;
      };
    }

    const previousRequest = pendingRequestRef.current;
    const request =
      previousRequest?.sku === sku && previousRequest.type === callType
        ? previousRequest
        : { sku, type: callType, completion: staffCallService.request({ sku, type: callType }) };

    pendingRequestRef.current = request;

    const minimumDisplayTime = new Promise<void>((resolve) => {
      window.setTimeout(resolve, callType === 'info' ? STAFF_CALL_INFO_TRANSITION_DELAY_MS : 0);
    });

    void Promise.all([request.completion, minimumDisplayTime]).then(() => {
      if (active) {
        navigate(completedPath, { replace: true });
      }
    });

    return () => {
      active = false;
    };
  }, [callType, completed, completedPath, hasRequestContext, navigate, sku, staffCallService]);

  if (!hasRequestContext) {
    return (
      <div className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-4 overflow-hidden bg-black px-6 text-center">
        <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 flex w-full max-w-100.5 flex-col items-center">
          <h1 className="text-[18px] font-semibold text-white">직원 호출 정보를 찾을 수 없어요.</h1>
          <SecondaryButton
            label={callType === 'info' ? '제품 이해로 돌아가기' : '기타 질문으로 돌아가기'}
            onClick={() => navigate(returnPath)}
            className="mt-4"
          />
        </div>
      </div>
    );
  }

  if (callType === 'info') {
    return (
      <div className="relative min-h-dvh w-full overflow-hidden bg-black">
        <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-6 pt-69.25 pb-16.25">
          <DocentStage
            cue={completed ? 'success' : 'sending'}
            continuityKey={`staff-call-${callType}`}
            className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25"
          />
          <h1 className="mt-8 text-[25px] font-semibold leading-tight text-white">
            {(completed
              ? ['제가 직원분께 궁금해 하시는', '부분을 잘 전달했어요!']
              : ['더 자세히 설명드리기 위해', '직원에게 알림을 보내는 중이에요!']
            ).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          {completed && (
            <div aria-label="직원 문의 후 액션" className="mt-auto flex w-full flex-col gap-4.5">
              <SecondaryButton label="← 다른 정보 보기" onClick={() => navigate(returnPath)} />
              <div className="flex w-full gap-2.5">
                <PrimaryButton label="구매 문의" onClick={() => navigate(purchaseInquiryPath)} className="h-11.5 flex-1" />
                <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} className="h-11.5 flex-1" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <CircleIconButton
        icon={closeIcon}
        ariaLabel="기타 질문 닫기"
        onClick={() => navigate(returnPath)}
        iconClassName="h-4 w-auto"
        className="absolute right-5 top-17.25 z-10"
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-6 pt-82.25 pb-16.25">
        <DocentStage
          cue={completed ? 'success' : 'sending'}
          continuityKey={`staff-call-${callType}`}
          className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25"
        />
        <h1 className="mt-7.5 text-[25px] font-semibold leading-tight text-white">
          <span className="block">직원에게 궁금한 사항에 대해</span>
          <span className="block">문의 알람을 보냈어요!</span>
        </h1>
        <p className="mt-1 text-[18px] font-medium text-[#d1d1d1]">더 자세한 상담을 받아보세요</p>
        <div className="mt-auto flex w-full flex-col gap-3.25">
          <SecondaryButton label="다른 것도 물어보기" onClick={() => navigate(returnPath)} />
          <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} />
        </div>
      </div>
    </div>
  );
}
