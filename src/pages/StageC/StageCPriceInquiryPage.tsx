import { useEffect, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { DocentStage } from '../../components/domain/DocentStage';
import { GlassBottomActionDock, GlassInfoCard, GlassSpeechBubble, GlassTopBar, StageCDetailShell } from '../../components/domain/GlassShell';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { EVENT_NAMES } from '../../constants/events';
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { usePriceInquiryRequestService } from '../../features/price-inquiry/usePriceInquiryRequestService';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { StageCState } from './StageCHubPage';

type PriceInquiryPageState = 'request' | 'pending' | 'completed';

interface StageCPriceInquiryPageProps {
  state: PriceInquiryPageState;
}

export default function StageCPriceInquiryPage({ state: pageState }: StageCPriceInquiryPageProps) {
  const { sku = '' } = useParams();
  const product = useStageCProduct(sku);

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />;
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />;
  }

  return <PriceInquiryContent pageState={pageState} productName={product.name} productImageUrl={product.imageUrl} sku={sku} />;
}

interface PriceInquiryContentProps {
  pageState: PriceInquiryPageState;
  productName: string;
  productImageUrl: string;
  sku: string;
}

function PriceInquiryContent({ pageState, productName, productImageUrl, sku }: PriceInquiryContentProps) {
  const navigate = useNavigate();
  const { dispatch, state } = useSession();
  const requestService = usePriceInquiryRequestService();
  const requestStartedRef = useRef(false);
  const exitProduct = useProductExit(sku);
  const purchaseHubPath = stageCPath(STAGE_C_ROUTES.c4, sku);
  const priceRequestPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiry, sku);
  const pendingPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryPending, sku);
  const completedPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryCompleted, sku);
  const fitTryOnPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku);
  const hasRequestContext = state.events.some((event) => event.name === EVENT_NAMES.priceInquiryRequest && event.sku === sku);

  useEffect(() => {
    let active = true;

    if (pageState !== 'pending' || !hasRequestContext) {
      return () => {
        active = false;
      };
    }

    const completion = requestService.requestPriceInquiry(sku);
    void completion.then(() => {
      if (active) navigate(completedPath, { replace: true });
    });

    return () => {
      active = false;
    };
  }, [completedPath, hasRequestContext, navigate, pageState, requestService, sku]);

  const submitRequest = () => {
    if (requestStartedRef.current || hasRequestContext) return;
    requestStartedRef.current = true;
    dispatch({ type: SESSION_ACTIONS.recordPriceInquiryRequest, sku });
    navigate(pendingPath);
  };

  if (pageState === 'request' && hasRequestContext) {
    return <Navigate replace to={completedPath} />;
  }

  if (pageState !== 'request' && !hasRequestContext) {
    return <PriceInquiryFallback path={priceRequestPath} />;
  }

  return (
    <StageCDetailShell>
      <GlassTopBar
        context="구매 조건"
        action={<SecondaryButton label="← 구매 조건" onClick={() => navigate(purchaseHubPath)} className="w-auto px-4" />}
      />
      <section aria-label="제품과 도슨트 안내" className="relative h-48 w-full overflow-hidden rounded-[15px]">
        <DocentStage cue={pageState === 'completed' ? 'greet' : 'idle'} className="absolute inset-0 z-10 h-full w-full" />
        <img src={productImageUrl} alt={productName} className="absolute inset-0 h-full w-full object-cover" />
      </section>
      {pageState === 'request' && (
        <>
          <GlassInfoCard>
            <h1 className="text-[16px] font-semibold">가격은 직원이 직접 안내해 드려요.</h1>
            <p className="mt-1 text-[13px] text-[#d1d1d1]">가격과 구매 관련 안내를 원하시면 직원에게 요청을 전달할게요.</p>
          </GlassInfoCard>
          <GlassSpeechBubble>원하실 때만 요청해 주세요.</GlassSpeechBubble>
          <GlassBottomActionDock>
            <PrimaryButton label="직원에게 가격 안내 요청하기" onClick={submitRequest} />
            <SecondaryButton label="구매 조건으로 돌아가기" onClick={() => navigate(purchaseHubPath)} />
          </GlassBottomActionDock>
        </>
      )}
      {pageState === 'pending' && (
        <>
          <GlassInfoCard>
            <h1 className="text-[16px] font-semibold">직원에게 가격 안내를 요청하고 있어요.</h1>
            <p className="mt-1 text-[13px] text-[#d1d1d1]">잠시 후 요청 전달 상태를 알려드릴게요.</p>
          </GlassInfoCard>
          <GlassBottomActionDock>
            <SecondaryButton label="다른 정보 보기" onClick={() => navigate(purchaseHubPath)} />
          </GlassBottomActionDock>
        </>
      )}
      {pageState === 'completed' && (
        <>
          <GlassInfoCard>
            <h1 className="text-[16px] font-semibold">요청이 전달됐어요.</h1>
            <p className="mt-1 text-[13px] text-[#d1d1d1]">직원이 가격과 구매 안내를 도와드릴 예정이에요.</p>
          </GlassInfoCard>
          <GlassBottomActionDock>
            <SecondaryButton label="다른 정보 보기" onClick={() => navigate(purchaseHubPath)} />
            <PrimaryButton label="착용 및 구매 문의하기" onClick={() => navigate(fitTryOnPath)} />
            <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} />
          </GlassBottomActionDock>
        </>
      )}
    </StageCDetailShell>
  );
}

function PriceInquiryFallback({ path }: { path: string }) {
  const navigate = useNavigate();
  return (
    <StageCDetailShell>
      <GlassInfoCard>
        <h1 className="text-[16px] font-semibold">가격 안내 요청 정보를 찾을 수 없어요.</h1>
        <p className="mt-1 text-[13px] text-[#d1d1d1]">가격 안내를 원하시면 먼저 요청해 주세요.</p>
        <SecondaryButton label="가격 안내 요청하기" onClick={() => navigate(path)} className="mt-4" />
      </GlassInfoCard>
    </StageCDetailShell>
  );
}
