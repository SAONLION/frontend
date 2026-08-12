import backgroundImage from '../../assets/images/stage-a-background.png';
import emblemImage from '../../assets/images/mcm-emblem.png';
import ImageFrame from '../../components/common/ImageFrame';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';

interface G1ContentSuggestionProps {
  productName: string;
  headline?: string;
  receiveContentButtonLabel?: string;
  viewOtherProductsButtonLabel?: string;
  onReceiveContent?: () => void;
  onViewOtherProducts?: () => void;
}

export default function G1ContentSuggestion({
  productName,
  headline = '오늘 결정이 어려우시면,',
  receiveContentButtonLabel = '콘텐츠 받아보기',
  viewOtherProductsButtonLabel = '다른 제품 보기 →',
  onReceiveContent,
  onViewOtherProducts,
}: G1ContentSuggestionProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center pt-69.25 pb-16.25">
        <ImageFrame
          src={emblemImage}
          alt="MCM 엠블럼"
          className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25"
        />
        <ScreenHeadline
          headline={headline}
          subtext={`${productName}과 관련된 콘텐츠를 보내드릴까요?`}
          variant="md"
          className="mt-1.75"
        />
        <div className="mt-auto flex w-[84.6%] max-w-85 flex-col gap-3.25">
          <PrimaryButton label={receiveContentButtonLabel} onClick={onReceiveContent} />
          <SecondaryButton label={viewOtherProductsButtonLabel} onClick={onViewOtherProducts} />
        </div>
      </div>
    </div>
  );
}
