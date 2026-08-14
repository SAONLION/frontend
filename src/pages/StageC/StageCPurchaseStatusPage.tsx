import { useParams } from 'react-router';
import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import SecondaryButton from '../../components/common/SecondaryButton';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { StageCState } from './StageCHubPage';

// dev 원본은 'price' | 'stock' 두 kind였지만, 'stock'은 재고확인 F 오버레이로
// 대체되어 이 화면은 이제 'price' 한 가지 문구만 보여준다.
export default function StageCPurchaseStatusPage() {
  const { sku = '' } = useParams();
  const product = useStageCProduct(sku);
  const exitProduct = useProductExit(sku);

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />;
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />;
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-6 pt-69.25 pb-16.25">
        <DocentStage cue="greet" className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25" />
        <ScreenHeadline
          headline="직원에게 구매 안내 요청을 보냈어요!"
          subtext="가격과 관련 정보들을 곧 안내해 드릴게요!"
          variant="md"
          className="mt-1.75"
        />
        <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} className="mt-auto" />
      </div>
    </div>
  );
}
