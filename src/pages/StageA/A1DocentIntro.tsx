import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';

interface A1DocentIntroProps {
  headline?: string;
  subtext?: string;
}

export default function A1DocentIntro({
  headline = '안녕하세요',
  subtext = 'MCM의 나이비스 AI 도슨트입니다',
}: A1DocentIntroProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-6 pt-69.25">
        <DocentStage cue="greet" className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25" />
        <ScreenHeadline headline={headline} subtext={subtext} className="mt-5" />
      </div>
    </div>
  );
}
