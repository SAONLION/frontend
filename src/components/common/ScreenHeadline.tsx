import { useEffect, useState } from 'react';
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
  const alignClasses = align === 'left' ? 'items-start text-left' : 'items-center text-center';
  const [isSubtextVisible, setIsSubtextVisible] = useState(!reveal);

  useEffect(() => {
    setIsSubtextVisible(!reveal);
  }, [headline, reveal]);

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
                onRevealComplete={index === lines.length - 1 ? () => {
                  setIsSubtextVisible(true);
                  onRevealComplete?.();
                  if (!subtext) onSubtextRevealComplete?.();
                } : undefined}
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
      {subtext && (isSubtextVisible || reserveSubtextSpace) && (
        <p
          className={`font-medium text-[#d1d1d1] ${SUBTEXT_STYLES[variant]}`}
          style={reserveSubtextSpace && !isSubtextVisible ? { visibility: 'hidden' } : undefined}
        >
          {/* 자리만 잡아둔 상태에서는 평문을 깔아둔다. 리빌 컴포넌트를 미리 마운트하면
              보이지 않는 채로 애니메이션이 끝나 완료 콜백이 일찍 발생한다. */}
          {reveal && isSubtextVisible ? (
            <KineticTextReveal
              autoPlay
              blur={false}
              distance={8}
              onRevealComplete={onSubtextRevealComplete}
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
