import { useNavigate, useLocation } from 'react-router';
import { STAGE_D_ROUTES } from '../../constants/appRoutes';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { useReturnToB1 } from '../../app/useReturnToB1';
import D1VisitPurpose from './D1VisitPurpose';
import D2ProductRecommendation from './D2ProductRecommendation';
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
  const navigate = useNavigate();
  const { dispatch } = useSession();

  return (
    <D1VisitPurpose
      onSelectPurpose={(purpose) => {
        dispatch({ type: SESSION_ACTIONS.setVisitPurpose, visitPurpose: purpose });
        navigate(STAGE_D_ROUTES.recommend);
      }}
      onCallStaff={() => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'E' })}
    />
  );
}

export function StageD2Page() {
  const navigate = useNavigate();
  const { state, dispatch } = useSession();

  return (
    <D2ProductRecommendation
      purpose={state.visitPurpose ?? '방문'}
      onSelectProduct={(product) => {
        const selectedProduct: SelectedProduct = {
          image: product.image,
          name: product.name,
          description: product.description,
        };
        navigate(STAGE_D_ROUTES.locationGuide, { state: selectedProduct });
      }}
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
