import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { STAGE_G_ROUTES, SESSION_END_ROUTE } from '../../constants/appRoutes';
import { useSession } from '../../features/session/useSession';
import { useProductContent } from '../../services/product-content/useProductContent';
import type { Product } from '../../types/product';
import { useReturnToB1 } from '../../app/useReturnToB1';
import G1ContentSuggestion from './G1ContentSuggestion';
import G2aInterestedProductFollowUp from './G2aInterestedProductFollowUp';
import G3EmailInput from './G3EmailInput';
import G4SendComplete from './G4SendComplete';

function useCurrentProductSummary() {
  const { state } = useSession();
  const { getProduct } = useProductContent();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!state.currentSku) return;
    let active = true;
    void getProduct(state.currentSku).then((result) => {
      if (active) setProduct(result);
    });
    return () => {
      active = false;
    };
  }, [getProduct, state.currentSku]);

  const colorCode = product?.fitDefaults?.colorCode;
  const colorName = product?.colorOptions?.find((option) => option.code === colorCode)?.label
    ?? product?.colorOptions?.[0]?.label
    ?? '선택하신';

  return { productName: product?.name ?? '관심 제품', colorName };
}

export function StageG1Page() {
  const navigate = useNavigate();
  const { productName } = useCurrentProductSummary();
  const returnToB1 = useReturnToB1();

  return (
    <G1ContentSuggestion
      productName={productName}
      onReceiveContent={() => navigate(STAGE_G_ROUTES.interestFollowup)}
      onViewOtherProducts={returnToB1}
    />
  );
}

export function StageG2Page() {
  const navigate = useNavigate();
  const { productName, colorName } = useCurrentProductSummary();

  return (
    <G2aInterestedProductFollowUp
      productName={productName}
      colorName={colorName}
      onGetLookbook={() => navigate(STAGE_G_ROUTES.email)}
      onSubscribeRestock={() => navigate(STAGE_G_ROUTES.email)}
    />
  );
}

export function StageG3Page() {
  const navigate = useNavigate();

  return <G3EmailInput onSubmit={() => navigate(STAGE_G_ROUTES.complete)} />;
}

export function StageG4Page() {
  const navigate = useNavigate();
  const { productName } = useCurrentProductSummary();
  const returnToB1 = useReturnToB1();

  return (
    <G4SendComplete
      productName={productName}
      onReturnToStart={returnToB1}
      onEndSession={() => navigate(SESSION_END_ROUTE)}
    />
  );
}
