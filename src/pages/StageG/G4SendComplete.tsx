// 플로우 메모: "다른 제품 보기 →" 클릭 시 B1(NFC 태그 유도)로 복귀, "종료하기" 클릭 시 세션 종료.
import backgroundImage from '../../assets/images/stage-a-background.png';
import emblemImage from '../../assets/images/mcm-emblem.png';
import ImageFrame from '../../components/common/ImageFrame';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import SecondaryButton from '../../components/common/SecondaryButton';
import PrimaryButton from '../../components/common/PrimaryButton';

interface G4SendCompleteProps {
  productName: string;
  viewOtherProductsButtonLabel?: string;
  endSessionButtonLabel?: string;
  onReturnToStart?: () => void;
  onEndSession?: () => void;
}

export default function G4SendComplete({
  productName,
  viewOtherProductsButtonLabel = '다른 제품 보기 →',
  endSessionButtonLabel = '종료하기',
  onReturnToStart,
  onEndSession,
}: G4SendCompleteProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center pt-69.25 pb-16.75">
        <ImageFrame
          src={emblemImage}
          alt="MCM 엠블럼"
          className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25"
        />
        <ScreenHeadline
          headline={[`등록하신 메일로 ${productName} 관련`, '콘텐츠를 보내드릴게요!']}
          variant="md"
          className="mt-1.75"
        />
        <div className="mt-auto flex w-[84.6%] max-w-85 flex-col gap-3.25">
          <SecondaryButton label={viewOtherProductsButtonLabel} onClick={onReturnToStart} />
          <PrimaryButton label={endSessionButtonLabel} onClick={onEndSession} />
        </div>
      </div>
    </div>
  );
}
