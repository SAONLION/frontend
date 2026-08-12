import backgroundImage from '../../assets/images/stage-a-background.png';
import emblemImage from '../../assets/images/mcm-emblem.png';
import ImageFrame from '../../components/common/ImageFrame';
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
}

export default function D21ProductLocationGuide({
  selectedProduct,
  headline = ['곧 직원이 제품 위치를', '안내해드릴거예요!'],
  subtext = '제품 앞에 이름표를 태그해보세요.',
  buttonLabel = '다른 제품 보기 →',
  onViewOtherProducts,
}: D21ProductLocationGuideProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-[7.71%] pt-44.75 pb-16.25">
        <ImageFrame
          src={emblemImage}
          alt="MCM 엠블럼"
          className="mx-auto aspect-325/203 w-[80.85%] max-w-81.25"
        />
        <ScreenHeadline headline={headline} subtext={subtext} variant="md" className="mt-7.5" />
        <InfoCard
          image={selectedProduct.image}
          name={selectedProduct.name}
          description={selectedProduct.description}
          className="mt-10"
        />
        <SecondaryButton label={buttonLabel} onClick={onViewOtherProducts} className="mt-auto" />
      </div>
    </div>
  );
}
