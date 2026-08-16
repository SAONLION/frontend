import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { usePreparedNavigate } from '../../app/usePreparedNavigate';
import emblemImage from '../../assets/images/mcm-emblem.png';
import { fetchRecommendations } from '../../api/recommendations';
import { postVisitPurpose } from '../../api/visitPurpose';
import { toVisitPurposeType } from '../../api/visitPurposeType';
import { STAGE_D_ROUTES } from '../../constants/appRoutes';
import { mockD2Recommendations } from '../../mocks/fixtures/demoContent';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { useReturnToB1 } from '../../app/useReturnToB1';
import D1VisitPurpose from './D1VisitPurpose';
import D2ProductRecommendation, { type ProductCardData } from './D2ProductRecommendation';
import D21ProductLocationGuide from './D21ProductLocationGuide';

interface SelectedProduct {
  image: string;
  name: string;
  description: string | string[];
}

const FALLBACK_SELECTED_PRODUCT: SelectedProduct = {
  image: '',
  name: '선택하신 제품',
  description: '',
};

// StageC의 useProductExit가 첫 이탈 시 이동시키는 comingSoon 스텁 경로에 매핑된다.
export function StageD1Page() {
  const navigate = usePreparedNavigate();
  const { state, dispatch } = useSession();

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
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState<readonly ProductCardData[] | null>(null);
  const [hasNoRecommendations, setHasNoRecommendations] = useState(false);

  useEffect(() => {
    if (!state.sessionId) {
      setIsLoadingRecommendations(false);
      return;
    }
    let cancelled = false;
    setIsLoadingRecommendations(true);

    fetchRecommendations(state.sessionId).then((recommendations) => {
      if (cancelled) return;
      if (recommendations === null) {
        // 타임아웃/오류 + 캐시 없음 → 추천 섹션을 건너뛰고 기본 추천으로 대체
        setRecommendedProducts(null);
        setHasNoRecommendations(false);
      } else if (recommendations.length === 0) {
        // 태그 스캔 이력 없음 → 정상 응답이지만 추천 결과가 없는 상태
        setRecommendedProducts([]);
        setHasNoRecommendations(true);
      } else {
        setRecommendedProducts(
          recommendations.map((item) => ({
            id: String(item.productId),
            image: emblemImage,
            name: item.productName,
            description: item.reason ?? '',
          })),
        );
        setHasNoRecommendations(false);
      }
      setIsLoadingRecommendations(false);
    }).catch((error: unknown) => {
      console.error('추천 조회에 실패했습니다.', error);
      if (!cancelled) {
        setRecommendedProducts(null);
        setHasNoRecommendations(false);
        setIsLoadingRecommendations(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state.sessionId]);

  return (
    <D2ProductRecommendation
      purpose={state.visitPurpose ?? '방문'}
      products={recommendedProducts ?? mockD2Recommendations}
      isLoadingRecommendations={isLoadingRecommendations}
      hasNoRecommendations={hasNoRecommendations}
      onSelectProduct={(product) => {
        const selectedProduct: SelectedProduct = {
          image: product.image,
          name: product.name,
          description: product.description,
        };
        navigate(STAGE_D_ROUTES.locationGuide, { state: selectedProduct });
      }}
      onTagOtherProduct={returnToB1}
      onCallStaff={() => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'E' })}
    />
  );
}

export function StageD21Page() {
  const location = useLocation();
  const returnToB1 = useReturnToB1();
  const selectedProduct = (location.state as SelectedProduct | null) ?? FALLBACK_SELECTED_PRODUCT;

  return <D21ProductLocationGuide selectedProduct={selectedProduct} onViewOtherProducts={returnToB1} />;
}
