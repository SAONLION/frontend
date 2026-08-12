import { useNavigate, useParams } from 'react-router';
import { DocentStage } from '../../components/domain/DocentStage';
import { StageCDetailShell } from '../../components/domain/GlassShell';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { STAGE_C_PRODUCT_DETAIL_ROUTES, stageCPath } from '../../constants/stageC';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { StageCState } from './StageCHubPage';

type PurchaseStatusKind = 'price' | 'stock';

const STATUS_CONTENT: Record<PurchaseStatusKind, { title: string[]; description?: string }> = {
  price: {
    title: ['직원에게 구매 안내 요청을 보냈어요!'],
    description: '가격과 관련 정보들을 곧 안내해 드릴게요!',
  },
  stock: {
    title: ['직원에게 해당 제품의 재고를 문의하고,', '다른 제품들을 추천받아보세요!'],
  },
};

interface StageCPurchaseStatusPageProps {
  kind: PurchaseStatusKind;
}

export default function StageCPurchaseStatusPage({ kind }: StageCPurchaseStatusPageProps) {
  const { sku = '' } = useParams();
  const navigate = useNavigate();
  const product = useStageCProduct(sku);
  const exitProduct = useProductExit(sku);
  const content = STATUS_CONTENT[kind];

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />;
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />;
  }

  return (
    <StageCDetailShell className="items-center justify-center text-center">
      <div className="flex w-full flex-col items-center gap-4">
        <section aria-label="나이비스 AI 도슨트" className="h-48 w-full">
          <DocentStage cue="idle" className="h-full w-full" />
        </section>
        <h1 className="text-[20px] font-semibold text-white">
          {content.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        {content.description && <p className="text-[14px] text-[#d1d1d1]">{content.description}</p>}
      </div>
      <div className="mt-auto flex w-full flex-col gap-2.75">
        {kind === 'stock' && (
          <PrimaryButton
            label="구매 문의"
            onClick={() => navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiry, sku))}
          />
        )}
        <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} />
      </div>
    </StageCDetailShell>
  );
}
