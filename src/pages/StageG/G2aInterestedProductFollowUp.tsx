import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';

interface G2aInterestedProductFollowUpProps {
  productName: string;
  colorName: string;
  lookbookButtonLabel?: string;
  restockButtonLabel?: string;
  onGetLookbook?: () => void;
  onSubscribeRestock?: () => void;
}

export default function G2aInterestedProductFollowUp({
  productName,
  colorName,
  lookbookButtonLabel = '오늘 본 제품 룩북 받기',
  restockButtonLabel = '입고 · 재입고 알림 받기',
  onGetLookbook,
  onSubscribeRestock,
}: G2aInterestedProductFollowUpProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center pt-52.5 pb-18">
        <DocentStage cue="idle" className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25" />
        <ScreenHeadline
          headline={`관심 있게 보시던 ${productName}`}
          subtext={`${colorName} 컬러에 대한 사항들을 가장 먼저 알려드릴까요?`}
          variant="md"
          className="mt-1"
        />
        <div className="mt-auto flex w-[84.6%] max-w-85 flex-col gap-3.25">
          <SecondaryButton label={lookbookButtonLabel} onClick={onGetLookbook} />
          <PrimaryButton label={restockButtonLabel} onClick={onSubscribeRestock} />
        </div>
      </div>
    </div>
  );
}
