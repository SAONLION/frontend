import { useLocation } from 'react-router';
import { usePreparedNavigate } from '../../app/usePreparedNavigate';
import { postVisitPurpose } from '../../api/visitPurpose';
import { toVisitPurposeType } from '../../api/visitPurposeType';
import { DEFAULT_PRODUCT_SKU, STAGE_D_ROUTES } from '../../constants/appRoutes';
import { STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { useReturnToB1 } from '../../app/useReturnToB1';
import type { DemoRecommendation } from '../../mocks/fixtures/demoContent';
import D1VisitPurpose from './D1VisitPurpose';
import D2ProductRecommendation from './D2ProductRecommendation';
import D21ProductLocationGuide from './D21ProductLocationGuide';

interface SelectedProduct {
  sku: string;
  image: string;
  name: string;
  description: string | string[];
}

const FALLBACK_SELECTED_PRODUCT: SelectedProduct = {
  sku: DEFAULT_PRODUCT_SKU,
  image: '',
  name: '선택하신 제품',
  description: '',
};

// D3 헤드라인의 목적 문구. D1에서 아직 디자인이 확정되지 않은 값은 같은 패턴으로 채운다.
const PURPOSE_PHRASE_MAP: Record<string, string> = {
  여행: '여행에 어울리는 제품',
  선물: '선물하기 좋은 제품',
  구경: '둘러보기 좋은 제품',
  기타: '이런 제품',
};

function toSelectedProduct(product: DemoRecommendation): SelectedProduct {
  return { sku: product.sku, image: product.image, name: product.name, description: product.description };
}

function getPersonalizedHeadline(nickname: string | null, purpose: string | null): [string, string] {
  const phrase = (purpose && PURPOSE_PHRASE_MAP[purpose]) ?? (purpose ? `${purpose}에 어울리는 제품` : '이런 제품');
  return [`${nickname ?? '고객'} 님에게`, `${phrase}은 어떠신가요?`];
}

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

  return (
    <D2ProductRecommendation
      purpose={state.visitPurpose ?? '방문'}
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

  return (sku: string) => {
    dispatch({ type: SESSION_ACTIONS.recordNfcTag, sku });
    navigate(stageCPath(STAGE_C_ROUTES.c1, sku));
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
      onViewOtherProducts={returnToB1}
      onSelectProduct={() => enterTaggedProduct(selectedProduct.sku)}
    />
  );
}

// 두 번째 이탈부터는 D1 목적 확인을 건너뛰고 D3 개인화 추천 → D4 위치 안내 루프를 반복한다.
export function StageD3Page() {
  const navigate = usePreparedNavigate();
  const { state, dispatch } = useSession();
  const returnToB1 = useReturnToB1();

  return (
    <D2ProductRecommendation
      purpose={state.visitPurpose ?? '방문'}
      headline={getPersonalizedHeadline(state.nickname, state.visitPurpose)}
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
      onViewOtherProducts={returnToB1}
      onSelectProduct={() => enterTaggedProduct(selectedProduct.sku)}
    />
  );
}
