import { useState } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import InfoCard from '../../components/common/InfoCard';
import SecondaryButton from '../../components/common/SecondaryButton';

interface SelectedProduct {
  image: string;
  name: string;
  description: string | string[];
}

interface D21ProductLocationGuideProps {
  selectedProduct: SelectedProduct;
  headline?: [string, string];
  subtext?: string;
  buttonLabel?: string;
  onViewOtherProducts?: () => void;
  /** D4에서는 안내 중인 제품을 눌러 바로 그 제품의 StageC로 넘어간다. */
  onSelectProduct?: () => void;
  /** AI 추천에 sku가 없어 데모 제품 정보로 대체해 안내하는 중이면 상단에 알린다. */
  isFallbackProduct?: boolean;
}

export default function D21ProductLocationGuide({
  selectedProduct,
  headline = ['곧 직원이 제품 위치를', '안내해드릴거예요!'],
  subtext = '제품 앞에 이름표를 태그해보세요.',
  buttonLabel = '다른 제품 보기 →',
  onViewOtherProducts,
  onSelectProduct,
  isFallbackProduct = false,
}: D21ProductLocationGuideProps) {
  const [isProductVisible, setIsProductVisible] = useState(false);

  return (
    <div className="stage-external-page">
      <img src={backgroundImage} alt="" className="stage-external-page__background" />
      {isFallbackProduct && (
        <p className="stage-external-page__fallback-notice" role="status">
          AI 추천에 제품 코드가 없어 <b>데모 제품 정보</b>로 안내 중이에요
        </p>
      )}
      <div className="stage-external-page__content stage-external-page__content--docent stage-external-page__content--d21">
        <div className="stage-external-page__d21-main">
          <DocentStage cue="guide" className="stage-external-page__docent" />
          <ScreenHeadline headline={headline} onRevealComplete={() => setIsProductVisible(true)} reveal subtext={subtext} variant="md" className="stage-external-page__headline" />
          {isProductVisible && <InfoCard
            image={selectedProduct.image}
            imageSurface="transparent"
            imageVariant="primary-cutout"
            name={selectedProduct.name}
            description={selectedProduct.description}
            onSelect={onSelectProduct}
            className="stage-external-page__headline"
          />}
        </div>
        {isProductVisible && <div className="stage-external-page__actions">
          <SecondaryButton label={buttonLabel} onClick={onViewOtherProducts} pendingOnClick />
        </div>}
      </div>
    </div>
  );
}
