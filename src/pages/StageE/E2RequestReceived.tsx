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
    <div className="stage-external-page"><img src={backgroundImage} alt="" className="stage-external-page__background" />
      <CircleIconButton
        icon={closeIcon}
        ariaLabel="닫기"
        onClick={onClose}
        iconClassName="h-4 w-auto"
        className="stage-external-page__close"
      />
      <div className="stage-external-page__content stage-external-page__content--docent stage-external-page__content--e2">
        <section aria-label="나이비스 AI 도슨트" className="stage-external-page__docent stage-external-page__docent--entry">
          <DocentStage cue="success" />
        </section>
        <ScreenHeadline
          headline={[`요청하신 ${requestSummary}에 대해`, '직원이 곧 안내드릴 예정이에요!']}
          subtext={subtext}
          variant="md"
          className="stage-external-page__headline"
        />
      </div>
    </div>
  );
}
