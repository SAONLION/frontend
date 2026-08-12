import { useState } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import closeIcon from '../../assets/images/icon-close.svg';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import OptionChip from '../../components/common/OptionChip';
import SecondaryButton from '../../components/common/SecondaryButton';
import CircleIconButton from '../../components/common/CircleIconButton';

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
  onClose?: () => void;
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
  onClose,
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
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <CircleIconButton
        icon={closeIcon}
        ariaLabel="닫기"
        onClick={onClose}
        iconClassName="h-4 w-auto"
        className="absolute right-5 top-17.25 z-10"
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-[7.71%] pt-82.25 pb-16.25">
        <ScreenHeadline headline={headline} subtext={subtext} variant="md" />
        <div className="mt-6 flex w-full flex-col gap-3.25">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-2.5">
              {requestOptions.slice(row * 2, row * 2 + 2).map((option) => (
                <OptionChip
                  key={option}
                  label={option}
                  selected={selectedRequests.includes(option)}
                  onClick={() => toggleRequest(option)}
                />
              ))}
            </div>
          ))}
          <SecondaryButton label={otherLabel} onClick={onSelectOther} textColor="text-[#b8b8b8]" />
        </div>
        <SecondaryButton label={viewOtherProductsLabel} onClick={onViewOtherProducts} className="mt-auto" />
      </div>
    </div>
  );
}
