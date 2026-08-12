import { useState } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import emblemImage from '../../assets/images/mcm-emblem.png';
import ImageFrame from '../../components/common/ImageFrame';
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

  const handleSelect = (value: string) => {
    setSelectedPurpose(value);
    onSelectPurpose?.(value);
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center pt-56 pb-16.25">
        <ImageFrame
          src={emblemImage}
          alt="MCM 엠블럼"
          className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25"
        />
        <ScreenHeadline headline={headline} subtext={subtext} variant="md" className="mt-4" />
        <div className="mt-auto flex w-[84.6%] max-w-85 flex-col gap-16">
          <div className="flex flex-col gap-3.25">
            {[0, 1].map((row) => (
              <div key={row} className="flex gap-2.5">
                {purposeOptions.slice(row * 2, row * 2 + 2).map((option) => (
                  <SecondaryButton
                    key={option}
                    label={option}
                    selected={selectedPurpose === option}
                    onClick={() => handleSelect(option)}
                    fullWidth={false}
                  />
                ))}
              </div>
            ))}
          </div>
          <PrimaryButton label={buttonLabel} onClick={onCallStaff} />
        </div>
      </div>
    </div>
  );
}
