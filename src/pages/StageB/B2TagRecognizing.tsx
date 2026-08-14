import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';

interface B2TagRecognizingProps {
  headline?: string;
  subtext?: string;
  onRecognized?: () => void;
}

export default function B2TagRecognizing({
  headline = '태그를 인식중이에요',
  subtext = '잠시만 기다려주세요',
}: B2TagRecognizingProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-6 pt-69.25">
        <DocentStage cue="idle" className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25" />
        <ScreenHeadline headline={headline} subtext={subtext} className="mt-5" />
      </div>
    </div>
  );
}
