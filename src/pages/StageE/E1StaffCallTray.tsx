import { useState, type CSSProperties, type ReactNode } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import SecondaryButton from '../../components/common/SecondaryButton';

const DEFAULT_REQUEST_OPTIONS = ['가격 확인', '착장 요청', '재고 문의', '구매 요청'];

interface E1StaffCallTrayProps {
  headline?: string;
  subtext?: string;
  requestOptions?: string[];
  otherLabel?: string;
  viewOtherProductsLabel?: string;
  onChangeSelectedRequests?: (selected: string[]) => void;
  onSelectOther?: () => void;
  onViewOtherProducts?: () => void;
  sheetHandle?: ReactNode;
  sheetOffset?: number;
  isDragging?: boolean;
}

export default function E1StaffCallTray({
  headline = '직원 도움이 필요하신가요?',
  subtext = '무엇이 필요한지 알려주시면 준비해서 갈게요',
  requestOptions = DEFAULT_REQUEST_OPTIONS,
  otherLabel = '기타',
  viewOtherProductsLabel = '다른 제품 보기 →',
  onChangeSelectedRequests,
  onSelectOther,
  onViewOtherProducts,
  sheetHandle,
  sheetOffset = 0,
  isDragging = false,
}: E1StaffCallTrayProps) {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const toggleRequest = (option: string) => {
    const next = selectedRequests.includes(option)
      ? selectedRequests.filter((item) => item !== option)
      : [...selectedRequests, option];
    setSelectedRequests(next);
    onChangeSelectedRequests?.(next);
  };

  return (
    <div className={`stage-external-page${isDragging ? ' stage-external-page--dragging' : ''}`} style={{ translate: `0 ${sheetOffset}px` } as CSSProperties}>
      <img src={backgroundImage} alt="" className="stage-external-page__background" />
      {sheetHandle}
      <div className="stage-external-page__content">
        <ScreenHeadline headline={headline} subtext={subtext} variant="md" className="stage-external-page__headline" />
        <div className="stage-external-page__stack">
          <div className="stage-external-page__choice-grid stage-e-staff-call-tray__choice-grid">
            {requestOptions.map((option) => (
                <SecondaryButton
                  key={option}
                  label={option}
                  selected={selectedRequests.includes(option)}
                  onClick={() => toggleRequest(option)}
                  fullWidth={false}
                />
            ))}
          </div>
          <SecondaryButton label={otherLabel} onClick={onSelectOther} textColor="text-[#b8b8b8]" />
        </div>
        <div className="stage-external-page__actions"><SecondaryButton label={viewOtherProductsLabel} onClick={onViewOtherProducts} pendingOnClick /></div>
      </div>
    </div>
  );
}
