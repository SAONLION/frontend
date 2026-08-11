interface ScreenHeadlineProps {
  headline: string;
  subtext: string;
  className?: string;
}

export default function ScreenHeadline({ headline, subtext, className = '' }: ScreenHeadlineProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <h1 className="text-[32px] font-semibold leading-normal text-white">{headline}</h1>
      <p className="text-[18px] font-medium leading-normal text-[#d1d1d1]">{subtext}</p>
    </div>
  );
}
