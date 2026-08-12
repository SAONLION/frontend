interface ScreenHeadlineProps {
  headline: string | string[];
  subtext?: string;
  align?: 'left' | 'center';
  variant?: 'lg' | 'md';
  className?: string;
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
}: ScreenHeadlineProps) {
  const lines = Array.isArray(headline) ? headline : [headline];
  const alignClasses = align === 'left' ? 'items-start text-left' : 'items-center text-center';

  return (
    <div className={`flex flex-col gap-1 ${alignClasses} ${className}`}>
      <h1 className={`font-semibold text-white ${HEADLINE_STYLES[variant]}`}>
        {lines.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </h1>
      {subtext && <p className={`font-medium text-[#d1d1d1] ${SUBTEXT_STYLES[variant]}`}>{subtext}</p>}
    </div>
  );
}
