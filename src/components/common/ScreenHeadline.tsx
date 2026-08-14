import { useEffect, useState } from 'react';
import { KineticTextReveal } from '../ui/kinetic-text-reveal';

interface ScreenHeadlineProps {
  headline: string | readonly string[];
  subtext?: string;
  align?: 'left' | 'center';
  variant?: 'lg' | 'md';
  className?: string;
  reveal?: boolean;
  onRevealComplete?: () => void;
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
  onRevealComplete,
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
                } : undefined}
                splitBy="characters"
                stagger={0.035}
                text={line}
              />
            ) : line}
          </span>
        ))}
      </h1>
      {subtext && isSubtextVisible && (
        <p className={`font-medium text-[#d1d1d1] ${SUBTEXT_STYLES[variant]}`}>
          {reveal ? <KineticTextReveal autoPlay blur={false} distance={8} splitBy="words" stagger={0.1} text={subtext} /> : subtext}
        </p>
      )}
    </div>
  );
}
