import backgroundImage from '../../assets/images/stage-a-background.png';
import closeIcon from '../../assets/images/icon-close.svg';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import CircleIconButton from '../../components/common/CircleIconButton';

interface E2RequestReceivedProps {
  selectedRequests: string[];
  subtext?: string;
  onClose?: () => void;
}

function buildRequestSummary(selectedRequests: string[]): string {
  return selectedRequests.length > 0 ? selectedRequests.join(', ') : '내용';
}

export default function E2RequestReceived({
  selectedRequests,
  subtext = '그동안 다른 제품들도 태그하여 확인해 보세요.',
  onClose,
}: E2RequestReceivedProps) {
  const requestSummary = buildRequestSummary(selectedRequests);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <CircleIconButton
        icon={closeIcon}
        ariaLabel="닫기"
        onClick={onClose}
        iconClassName="h-4 w-auto"
        className="absolute right-5 top-17.25 z-10"
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-6 pt-82.25">
        <DocentStage cue="greet" className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25" />
        <ScreenHeadline
          headline={[`요청하신 ${requestSummary}에 대해`, '직원이 곧 안내드릴 예정이에요!']}
          subtext={subtext}
          variant="md"
          className="mt-7.5"
        />
      </div>
    </div>
  );
}
