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
  /**
   * 요청이 서버에 닿았는지.
   *
   * 접수 화면은 서버 응답을 기다리지 않고 바로 보여주지만, **전달에 실패했을 때까지
   * "직원이 곧 안내드릴 예정"이라고 말하면 화면이 거짓이 된다.** 실패가 확인되면 문구를 바꾼다.
   */
  delivery?: 'sending' | 'failed';
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
  delivery = 'sending',
}: E2RequestReceivedProps) {
  const requestSummary = buildRequestSummary(selectedRequests);
  const failed = delivery === 'failed';
  const headline = failed
    ? [`${requestSummary} 요청을`, '전달하지 못했어요']
    : [`요청하신 ${requestSummary}에 대해`, '직원이 곧 안내드릴 예정이에요!'];
  // 실패 안내는 고객이 지금 할 수 있는 행동으로 끝낸다. 원인은 말해도 할 수 있는 게 없다.
  const description = failed ? '가까운 직원에게 직접 말씀해 주시면 바로 도와드릴게요.' : subtext;

  return (
    <div className={`stage-external-page${isDragging ? ' stage-external-page--dragging' : ''}`} style={{ translate: `0 ${sheetOffset}px` } as CSSProperties}><img src={backgroundImage} alt="" className="stage-external-page__background" />
      {sheetHandle}
      <div className="stage-external-page__content stage-external-page__content--docent stage-external-page__content--e2">
        <section aria-label="나이비스 AI 도슨트" className="stage-external-page__docent stage-external-page__docent--entry">
          <DocentStage cue={failed ? 'apologize' : 'request-success'} />
        </section>
        <ScreenHeadline
          headline={headline}
          subtext={description}
          reveal
          variant="md"
          className="stage-external-page__headline"
        />
      </div>
    </div>
  );
}
