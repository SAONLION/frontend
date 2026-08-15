import type { CSSProperties, ReactNode } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';

interface E2RequestReceivedProps {
  selectedRequests: string[];
  subtext?: string;
  sheetHandle?: ReactNode;
  sheetOffset?: number;
  isDragging?: boolean;
}

function buildRequestSummary(selectedRequests: string[]): string {
  return selectedRequests.length > 0 ? selectedRequests.join(', ') : '내용';
}

export default function E2RequestReceived({
  selectedRequests,
  subtext = '그동안 다른 제품들도 태그하여 확인해 보세요.',
  sheetHandle,
  sheetOffset = 0,
  isDragging = false,
}: E2RequestReceivedProps) {
  const requestSummary = buildRequestSummary(selectedRequests);

  return (
    <div className={`stage-external-page${isDragging ? ' stage-external-page--dragging' : ''}`} style={{ translate: `0 ${sheetOffset}px` } as CSSProperties}><img src={backgroundImage} alt="" className="stage-external-page__background" />
      {sheetHandle}
      <div className="stage-external-page__content stage-external-page__content--docent stage-external-page__content--e2">
        <section aria-label="나이비스 AI 도슨트" className="stage-external-page__docent stage-external-page__docent--entry">
          <DocentStage cue="request-success" />
        </section>
        <ScreenHeadline
          headline={[`요청하신 ${requestSummary}에 대해`, '직원이 곧 안내드릴 예정이에요!']}
          subtext={subtext}
          reveal
          variant="md"
          className="stage-external-page__headline"
        />
      </div>
    </div>
  );
}
