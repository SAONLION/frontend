import arrowUpIcon from '../../assets/images/icon-arrow-up.svg';

interface CircleButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export default function CircleButton({ onClick, ariaLabel = '다음', className = '' }: CircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#d9d9d9]/20 transition hover:bg-[#d9d9d9]/30 ${className}`}
    >
      <img src={arrowUpIcon} alt="" className="h-5 w-auto" />
    </button>
  );
}
