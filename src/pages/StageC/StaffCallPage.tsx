import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DocentStage } from '../../components/domain/DocentStage';
import { GlassInfoCard, StageCDetailShell } from '../../components/domain/GlassShell';
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
      <StageCDetailShell>
        <GlassInfoCard>
          <h1 className="text-[16px] font-semibold">직원 호출 정보를 찾을 수 없어요.</h1>
          <SecondaryButton
            label={callType === 'info' ? '제품 이해로 돌아가기' : '기타 질문으로 돌아가기'}
            onClick={() => navigate(returnPath)}
            className="mt-4"
          />
        </GlassInfoCard>
      </StageCDetailShell>
    );
  }

  if (callType === 'info') {
    return (
      <StageCDetailShell className="items-center justify-center text-center">
        <div className="flex w-full flex-col items-center gap-4">
          <section aria-label="나이비스 AI 도슨트" className="h-48 w-full">
            <DocentStage cue="idle" className="h-full w-full" />
          </section>
          <h1 className="text-[18px] font-semibold text-white">
            {(completed
              ? ['제가 직원분께 궁금해 하시는', '부분을 잘 전달했어요!']
              : ['더 자세히 설명드리기 위해', '직원에게 알림을 보내는 중이에요!']
            ).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
        </div>

        {completed && (
          <div aria-label="직원 문의 후 액션" className="mt-auto flex w-full flex-col gap-2.75">
            <SecondaryButton label="← 다른 정보 보기" onClick={() => navigate(returnPath)} />
            <PrimaryButton label="구매 문의" onClick={() => navigate(purchaseInquiryPath)} />
            <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} />
          </div>
        )}
      </StageCDetailShell>
    );
  }

  return (
    <StageCDetailShell>
      <header className="flex justify-end">
        <button aria-label="기타 질문 닫기" onClick={() => navigate(returnPath)} type="button" className="text-[20px] text-[#d1d1d1]">
          ×
        </button>
      </header>
      <div className="flex flex-col items-center gap-4 text-center">
        <section aria-label="나이비스 AI 도슨트" className="h-48 w-full">
          <DocentStage cue="idle" className="h-full w-full" />
        </section>
        <h1 className="text-[18px] font-semibold text-white">
          <span className="block">직원에게 궁금한 사항에 대해</span>
          <span className="block">문의 알림을 보냈어요!</span>
        </h1>
        <p className="text-[13px] text-[#d1d1d1]">더 자세한 상담을 받아보세요</p>
      </div>
      <div className="mt-auto flex w-full flex-col gap-2.75">
        <SecondaryButton label="다른 것도 물어보기" onClick={() => navigate(returnPath)} />
        <SecondaryButton label="직원에게 문의하기" onClick={() => navigate(returnPath)} />
        <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} />
      </div>
    </StageCDetailShell>
  );
}
