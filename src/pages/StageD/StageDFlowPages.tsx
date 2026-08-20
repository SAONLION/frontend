import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { usePreparedNavigate } from '../../app/usePreparedNavigate';
import emblemImage from '../../assets/images/mcm-emblem.png';
import { fetchRecommendations } from '../../api/recommendations';
import { getVisitPurpose, postVisitPurpose } from '../../api/visitPurpose';
import { toVisitPurposeLabel, toVisitPurposeType } from '../../api/visitPurposeType';
import { DEFAULT_PRODUCT_SKU, STAGE_D_ROUTES } from '../../constants/appRoutes';
import { STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { mockD2Recommendations } from '../../mocks/fixtures/demoContent';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { setServerProduct } from '../../features/product-explore/serverProduct';
import { useReturnToB1 } from '../../app/useReturnToB1';
import D1VisitPurpose from './D1VisitPurpose';
import D2ProductRecommendation, { type ProductCardData } from './D2ProductRecommendation';
import D21ProductLocationGuide from './D21ProductLocationGuide';

interface SelectedProduct {
  sku: string;
  productId?: number;
  skuId?: number;
  image: string;
  name: string;
  description: string | string[];
  /** 서버 SKU가 없는 fixture 추천을 데모 제품으로 안내하는 중인지 */
  isFallbackSku?: boolean;
}

const FALLBACK_SELECTED_PRODUCT: SelectedProduct = {
  sku: DEFAULT_PRODUCT_SKU,
  image: '',
  name: '선택하신 제품',
  description: '',
  isFallbackSku: true,
};

// D3 헤드라인의 목적 문구. D1에서 아직 디자인이 확정되지 않은 값은 같은 패턴으로 채운다.
const PURPOSE_PHRASE_MAP: Record<string, string> = {
  여행: '여행에 어울리는 제품',
  선물: '선물하기 좋은 제품',
  구경: '둘러보기 좋은 제품',
  기타: '이런 제품',
};

function toSelectedProduct(product: ProductCardData): SelectedProduct {
  const hasServerSku = Number.isInteger(product.skuId) && (product.skuId ?? 0) > 0
  return {
    // 라우트는 문자열 키를 쓰지만, Live mapper는 서버 제품 store로 실제 제품을 식별한다.
    sku: hasServerSku ? `tag-${product.skuId}` : product.sku ?? DEFAULT_PRODUCT_SKU,
    productId: product.productId,
    skuId: product.skuId,
    image: product.image,
    name: product.name,
    description: product.description,
    isFallbackSku: !hasServerSku && product.sku === undefined,
  };
}

/**
 * 기획서 v2.2 Step 6이 정의한 추천 개수. 화면 레이아웃과 진입 모션 스태거도 이 값 기준이다.
 * 서버는 0~5개로 불안정하게 돌려주므로(BACKEND_REQUEST P1-7) 여기서 잘라 스펙에 맞춘다.
 */
const RECOMMENDATION_LIMIT = 3;

/**
 * D2·D3이 공유하는 AI 추천 조회.
 * 추천이 없거나(태그 이력 없음) 조회에 실패하면 fixture 추천으로 대체하고 그 사실을 화면에 알린다.
 */
function useRecommendedProducts() {
  const { state } = useSession();
  const sessionId = state.sessionId;
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<readonly ProductCardData[] | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    fetchRecommendations(sessionId).then((recommendations) => {
      if (cancelled) return;
      // 빈 배열(태그 이력 없음)도 null(오류·타임아웃)과 같게 다룬다 — 데모 추천으로 대체한다.
      if (recommendations === null || recommendations.length === 0) {
        setProducts(null);
      } else {
        setProducts(recommendations.slice(0, RECOMMENDATION_LIMIT).map((item) => ({
          id: String(item.productId),
          productId: item.productId,
          skuId: item.skuId,
          image: item.imageUrl ?? emblemImage,
          name: item.productName,
          description: item.reason ?? '',
        })));
      }
      setIsLoading(false);
    }).catch((error: unknown) => {
      console.error('추천 조회에 실패했습니다.', error);
      if (cancelled) return;
      setProducts(null);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [sessionId]);

  // products가 null이면 fixture로 대체된 상태다.
  return { products: products ?? mockD2Recommendations, isLoading, isFallback: products === null };
}

function getPersonalizedHeadline(nickname: string | null, purpose: string | null): [string, string] {
  const phrase = (purpose && PURPOSE_PHRASE_MAP[purpose]) ?? (purpose ? `${purpose}에 어울리는 제품` : '이런 제품');
  return [`${nickname ?? '고객'} 님에게`, `${phrase}은 어떠신가요?`];
}

// StageC의 useProductExit가 첫 이탈 시 이동시키는 comingSoon 스텁 경로에 매핑된다.
export function StageD1Page() {
  const navigate = usePreparedNavigate();
  const { state, dispatch } = useSession();
  const sessionId = state.sessionId;

  // 방문 목적은 세션당 1회다. 새로고침으로 프론트 상태가 날아가도 서버에 답이 남아 있으면
  // 다시 묻지 않고 추천으로 넘어간다.
  useEffect(() => {
    if (!sessionId || state.visitPurpose) return;
    let cancelled = false;

    getVisitPurpose(sessionId).then((result) => {
      if (cancelled || !result.answered || !result.purposeType) return;
      dispatch({ type: SESSION_ACTIONS.setVisitPurpose, visitPurpose: toVisitPurposeLabel(result.purposeType) });
      navigate(STAGE_D_ROUTES.recommend, { replace: true });
    }).catch((error: unknown) => {
      // 조회에 실패하면 그냥 다시 묻는다. 서버가 멱등 처리하므로 중복 저장은 문제되지 않는다.
      console.error('방문 목적 조회에 실패했습니다.', error);
    });

    return () => { cancelled = true; };
  }, [dispatch, navigate, sessionId, state.visitPurpose]);

  return (
    <D1VisitPurpose
      onSelectPurpose={(purpose) => {
        dispatch({ type: SESSION_ACTIONS.setVisitPurpose, visitPurpose: purpose });
        navigate(STAGE_D_ROUTES.recommend);

        if (state.sessionId) {
          void postVisitPurpose(state.sessionId, toVisitPurposeType(purpose)).catch((error: unknown) => {
            console.error('방문 목적 저장에 실패했습니다.', error);
          });
        }
      }}
      onCallStaff={() => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'E' })}
    />
  );
}

export function StageD2Page() {
  const navigate = usePreparedNavigate();
  const { state, dispatch } = useSession();
  const returnToB1 = useReturnToB1();
  const { products, isLoading, isFallback } = useRecommendedProducts();

  return (
    <D2ProductRecommendation
      purpose={state.visitPurpose ?? '방문'}
      products={products}
      isLoadingRecommendations={isLoading}
      isFallbackData={isFallback}
      onSelectProduct={(product) => {
        navigate(STAGE_D_ROUTES.locationGuide, { state: toSelectedProduct(product) });
      }}
      onTagOtherProduct={returnToB1}
      onCallStaff={() => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'E' })}
    />
  );
}

// 위치 안내 화면(D2-1·D4)에서 안내받은 제품을 누르면 그 자리에서 태그한 것과 같은 상태로
// 해당 SKU의 StageC 루프에 진입한다.
function useEnterTaggedProduct() {
  const navigate = usePreparedNavigate();
  const { dispatch } = useSession();

  return (product: SelectedProduct) => {
    if (product.productId !== undefined && product.skuId !== undefined) {
      setServerProduct({
        id: product.productId,
        name: product.name,
        category: '',
        imageUrl: product.image || null,
        sku: product.sku,
        skuId: product.skuId,
      });
      dispatch({ type: SESSION_ACTIONS.setProductId, productId: product.productId });
      dispatch({ type: SESSION_ACTIONS.setCurrentSkuId, skuId: product.skuId });
    }
    dispatch({ type: SESSION_ACTIONS.recordNfcTag, sku: product.sku });
    navigate(stageCPath(STAGE_C_ROUTES.c1, product.sku));
  };
}

export function StageD21Page() {
  const location = useLocation();
  const returnToB1 = useReturnToB1();
  const enterTaggedProduct = useEnterTaggedProduct();
  const selectedProduct = (location.state as SelectedProduct | null) ?? FALLBACK_SELECTED_PRODUCT;

  return (
    <D21ProductLocationGuide
      selectedProduct={selectedProduct}
      isFallbackProduct={selectedProduct.isFallbackSku ?? false}
      onViewOtherProducts={returnToB1}
      onSelectProduct={() => enterTaggedProduct(selectedProduct)}
    />
  );
}

// 두 번째 이탈부터는 D1 목적 확인을 건너뛰고 D3 개인화 추천 → D4 위치 안내 루프를 반복한다.
export function StageD3Page() {
  const navigate = usePreparedNavigate();
  const { state, dispatch } = useSession();
  const returnToB1 = useReturnToB1();
  const { products, isLoading, isFallback } = useRecommendedProducts();

  return (
    <D2ProductRecommendation
      purpose={state.visitPurpose ?? '방문'}
      headline={getPersonalizedHeadline(state.nickname, state.visitPurpose)}
      products={products}
      isLoadingRecommendations={isLoading}
      isFallbackData={isFallback}
      onSelectProduct={(product) => {
        navigate(STAGE_D_ROUTES.personalizedLocationGuide, { state: toSelectedProduct(product) });
      }}
      onTagOtherProduct={returnToB1}
      onCallStaff={() => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'E' })}
    />
  );
}

export function StageD4Page() {
  const location = useLocation();
  const returnToB1 = useReturnToB1();
  const enterTaggedProduct = useEnterTaggedProduct();
  const selectedProduct = (location.state as SelectedProduct | null) ?? FALLBACK_SELECTED_PRODUCT;

  return (
    <D21ProductLocationGuide
      selectedProduct={selectedProduct}
      isFallbackProduct={selectedProduct.isFallbackSku ?? false}
      onViewOtherProducts={returnToB1}
      onSelectProduct={() => enterTaggedProduct(selectedProduct)}
    />
  );
}
