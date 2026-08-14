import { useState } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import SecondaryButton from '../../components/common/SecondaryButton';
import PrimaryButton from '../../components/common/PrimaryButton';

const DEFAULT_PURPOSE_OPTIONS = ['여행', '선물', '구경', '기타'];

interface D1VisitPurposeProps {
  headline?: string;
  subtext?: string;
  purposeOptions?: string[];
  buttonLabel?: string;
  onSelectPurpose?: (value: string) => void;
  onCallStaff?: () => void;
}

export default function D1VisitPurpose({
  headline = '어떤 목적으로 방문하셨나요?',
  subtext = '딱 맞는 제품을 찾아드릴게요',
  purposeOptions = DEFAULT_PURPOSE_OPTIONS,
  buttonLabel = '직원 호출',
  onSelectPurpose,
  onCallStaff,
}: D1VisitPurposeProps) {
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [areActionsVisible, setAreActionsVisible] = useState(false);

  const handleSelect = (value: string) => {
    setSelectedPurpose(value);
    onSelectPurpose?.(value);
  };

  return (
    <div className="stage-external-page">
      <img src={backgroundImage} alt="" className="stage-external-page__background" />
      <div className="stage-external-page__content stage-external-page__content--docent stage-external-page__content--d1">
        <DocentStage cue="listen" className="stage-external-page__docent" />
        <ScreenHeadline headline={headline} onRevealComplete={() => setAreActionsVisible(true)} reveal subtext={subtext} variant="md" className="stage-external-page__headline" />
        {areActionsVisible && <div className="stage-external-page__actions">
          <div className="stage-external-page__choice-grid">
            {purposeOptions.map((option) => (
              <SecondaryButton
                key={option}
                label={option}
                selected={selectedPurpose === option}
                onClick={() => handleSelect(option)}
                fullWidth={false}
              />
            ))}
          </div>
          <PrimaryButton label={buttonLabel} onClick={onCallStaff} />
        </div>}
      </div>
    </div>
  );
}
