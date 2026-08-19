import { useLayoutEffect, useState } from 'react';
import { KineticTextReveal } from '../ui/kinetic-text-reveal';

interface ScreenHeadlineProps {
  headline: string | readonly string[];
  subtext?: string;
  align?: 'left' | 'center';
  variant?: 'lg' | 'md';
  className?: string;
  reveal?: boolean;
  /** 화면에 도슨트가 없으면 false로 준다. 도슨트 준비 신호를 기다리지 않고 바로 등장한다. */
  waitForDocent?: boolean;
  /** 서브텍스트가 나타날 때 아래 요소가 밀리지 않도록 자리를 미리 잡아둔다. */
  reserveSubtextSpace?: boolean;
  /** 제목과 보조 문구까지 끝난 뒤 실행된다. */
  onRevealComplete?: () => void;
  /** 보조 문구까지 다 나타난 뒤 실행된다. 아래 요소를 그다음에 띄울 때 쓴다. */
  onSubtextRevealComplete?: () => void;
}

const HEADLINE_STYLES = {
  lg: 'text-[32px] leading-normal',
  md: 'text-[25px] leading-[1.25]',
} as const;

const SUBTEXT_STYLES = {
  lg: 'text-[18px] leading-normal',
  md: 'text-[16px] leading-normal',
} as const;

export default function ScreenHeadline({
  headline,
  subtext,
  align = 'center',
  variant = 'lg',
  className = '',
  reveal = false,
  waitForDocent = true,
  reserveSubtextSpace = false,
  onRevealComplete,
  onSubtextRevealComplete,
}: ScreenHeadlineProps) {
  const lines = Array.isArray(headline) ? headline : [headline];
  // 드래그처럼 부모만 다시 렌더되는 경우 배열 참조는 매번 달라질 수 있다.
  // 실제 안내 문구가 달라졌을 때만 새 시퀀스로 취급한다.
  const sequenceKey = `${lines.join('\u0000')}\u0001${subtext ?? ''}`;
  const alignClasses = align === 'left' ? 'items-start text-left' : 'items-center text-center';
  // 보조 문구를 애니메이션으로 보여주는 화면은 처음부터 한 줄 자리를 확보한다.
  // 그래야 문구가 나타나는 순간 아래 카드·버튼이 밀리지 않는다.
  const shouldReserveSubtextSpace = reserveSubtextSpace || (reveal && Boolean(subtext));
  const [isSubtextVisible, setIsSubtextVisible] = useState(!reveal);

  // 같은 화면 컴포넌트가 다음 상태를 이어 렌더할 때, 이전 보조 문구가 한 프레임
  // 먼저 보이지 않도록 paint 전에 시퀀스를 리셋한다.
  useLayoutEffect(() => {
    setIsSubtextVisible(!reveal);
  }, [reveal, sequenceKey]);

  const handleHeadlineRevealComplete = () => {
    if (subtext) {
      setIsSubtextVisible(true);
      return;
    }
    onRevealComplete?.();
    onSubtextRevealComplete?.();
  };

  const handleSubtextRevealComplete = () => {
    onSubtextRevealComplete?.();
    onRevealComplete?.();
  };

  return (
    <div className={`flex flex-col gap-1 ${alignClasses} ${className}`}>
      <h1 className={`font-semibold text-white ${HEADLINE_STYLES[variant]}`}>
        {lines.map((line, index) => (
          <span key={index} className="block">
            {reveal ? (
              <KineticTextReveal
                autoPlay
                blur
                delay={index * 0.2}
                distance={16}
                onRevealComplete={index === lines.length - 1 ? handleHeadlineRevealComplete : undefined}
                splitBy="characters"
                stagger={0.035}
                text={line}
                waitForDocent={waitForDocent}
                className={align === 'center' ? 'justify-center' : undefined}
              />
            ) : line}
          </span>
        ))}
      </h1>
      {subtext && (isSubtextVisible || shouldReserveSubtextSpace) && (
        <p
          className={`font-medium text-[#d1d1d1] ${SUBTEXT_STYLES[variant]}`}
          style={shouldReserveSubtextSpace && !isSubtextVisible ? { visibility: 'hidden' } : undefined}
        >
          {/* 자리만 잡아둔 상태에서는 평문을 깔아둔다. 리빌 컴포넌트를 미리 마운트하면
              보이지 않는 채로 애니메이션이 끝나 완료 콜백이 일찍 발생한다. */}
          {reveal && isSubtextVisible ? (
            <KineticTextReveal
              autoPlay
              blur={false}
              distance={8}
              onRevealComplete={handleSubtextRevealComplete}
              splitBy="words"
              stagger={0.1}
              text={subtext}
              waitForDocent={waitForDocent}
            />
          ) : subtext}
        </p>
      )}
    </div>
  );
}
