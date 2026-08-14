interface CircleIconButtonProps {
  icon: string;
  ariaLabel: string;
  onClick?: () => void;
  iconClassName?: string;
  className?: string;
}

export default function CircleIconButton({
  icon,
  ariaLabel,
  onClick,
  iconClassName = 'h-5 w-auto',
  className = '',
}: CircleIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-10.5 w-10.5 items-center justify-center rounded-full bg-[#d9d9d9]/20 transition hover:bg-[#d9d9d9]/30 ${className}`}
    >
      <img src={icon} alt="" className={iconClassName} />
    </button>
  );
}
