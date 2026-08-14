import backgroundImage from '../../assets/images/stage-a-background.png';
import trolleyImage from '../../assets/images/product-visetos-trolley.png';
import trolleyHeroImage from '../../assets/images/product-visetos-trolley-hero.png';
import HeroImage from '../../components/common/HeroImage';
import InfoCard from '../../components/common/InfoCard';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';

interface ProductData {
  image: string;
  name: string;
  description: string | string[];
}

interface HeroImageData {
  src: string;
  alt: string;
}

const DEFAULT_PRODUCT: ProductData = {
  image: trolleyImage,
  name: '비세토스 트롤리',
  description: '기내 반입 규격 · 여행 목적 상위 매칭',
};

const DEFAULT_HERO: HeroImageData = {
  src: trolleyHeroImage,
  alt: '비세토스 트롤리',
};

interface G2cInterestedProductFollowUpProps {
  productName: string;
  colorName: string;
  product?: ProductData;
  hero?: HeroImageData;
  lookbookButtonLabel?: string;
  restockButtonLabel?: string;
  onGetLookbook?: () => void;
  onSubscribeRestock?: () => void;
}

export default function G2cInterestedProductFollowUp({
  productName,
  colorName,
  product = DEFAULT_PRODUCT,
  hero = DEFAULT_HERO,
  lookbookButtonLabel = '오늘 본 제품 룩북 받기',
  restockButtonLabel = '입고 · 재입고 알림 받기',
  onGetLookbook,
  onSubscribeRestock,
}: G2cInterestedProductFollowUpProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-[7.71%] pt-48.25 pb-18.75">
        <div className="relative w-full">
          <HeroImage src={hero.src} alt={hero.alt} />
          <InfoCard
            image={product.image}
            name={product.name}
            description={product.description}
            className="absolute inset-x-0 top-17.5"
          />
        </div>
        <ScreenHeadline
          headline={`관심 있게 보시던 ${productName}`}
          subtext={`${colorName} 컬러에 대한 사항들을 가장 먼저 알려드릴까요?`}
          variant="md"
          className="mt-9.25"
        />
        <div className="mt-auto flex w-full flex-col gap-3.25">
          <SecondaryButton label={lookbookButtonLabel} onClick={onGetLookbook} />
          <PrimaryButton label={restockButtonLabel} onClick={onSubscribeRestock} />
        </div>
      </div>
    </div>
  );
}
