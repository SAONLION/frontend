import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import PrimaryButton from '../../components/common/PrimaryButton';

interface B1NfcPromptProps {
  headline?: string[];
  subtext?: string;
  buttonLabel?: string;
  onNfcDetected?: () => void;
  onCallStaff?: () => void;
}

export default function B1NfcPrompt({
  headline = ['마음에 드는 제품이 있나요?', '휴대폰을 태그에 가까이 대보세요'],
  subtext = '제품에 대해 알려드릴게요',
  buttonLabel = '직원 호출',
  onCallStaff,
}: B1NfcPromptProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center pt-69.25 pb-16.25">
        <DocentStage cue="guide" className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25" />
        <ScreenHeadline headline={headline} subtext={subtext} variant="md" className="mt-1.75" />
        <PrimaryButton label={buttonLabel} onClick={onCallStaff} className="mt-auto w-[84.6%] max-w-85" />
      </div>
    </div>
  );
}
