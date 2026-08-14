import { useEffect, useState } from 'react';
import { useSession } from '../features/session/useSession';
import { SESSION_ACTIONS } from '../features/session/sessionTypes';
import { useProductContent } from '../services/product-content/useProductContent';
import type { Product } from '../types/product';
import F1OtherStoreStockNotice from '../pages/StageF/F1OtherStoreStockNotice';
import F2AlternativeSkuRecommendation from '../pages/StageF/F2AlternativeSkuRecommendation';

// F2의 priorityFactor(중요시하는 부분)는 세션에 대응 필드가 없어 임시 기본값으로 둔다.
// 실제로는 StageC 방문 이력(예: 사이즈/컬러 조회 여부)에서 도출해야 한다.
const FALLBACK_PRIORITY_FACTOR = '수납 공간';

export default function FOverlay() {
  const { state, dispatch } = useSession();
  const { getProduct } = useProductContent();
  const [product, setProduct] = useState<Product | null>(null);
  const [screen, setScreen] = useState<'F1' | 'F2'>('F1');

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

  const close = () => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: null });
  const colorCode = product?.fitDefaults?.colorCode;
  const colorName = product?.colorOptions?.find((option) => option.code === colorCode)?.label
    ?? product?.colorOptions?.[0]?.label
    ?? '선택하신';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 h-[88dvh] overflow-y-auto rounded-t-[24px] shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
      {screen === 'F1' ? (
        <F1OtherStoreStockNotice
          colorName={colorName}
          onRequestHold={close}
          onScheduleDelivery={close}
          onRecommendAlternative={() => setScreen('F2')}
        />
      ) : (
        <F2AlternativeSkuRecommendation
          purpose={state.visitPurpose ?? '방문'}
          priorityFactor={FALLBACK_PRIORITY_FACTOR}
          productName={product?.name}
          productImage={product?.imageUrl}
          onViewProductDetail={close}
          onReserveOriginal={close}
          onGoBack={() => setScreen('F1')}
        />
      )}
    </div>
  );
}
