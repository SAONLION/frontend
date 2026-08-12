import { SURFACE_MUTED_BG } from '../../styles/tokens';

interface SecondaryButtonProps {
  label: string;
  onClick?: () => void;
  textColor?: string;
  className?: string;
}

export default function SecondaryButton({
  label,
  onClick,
  textColor = 'text-white',
  className = '',
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-13.5 w-full items-center justify-center rounded-full ${SURFACE_MUTED_BG} text-[16px] font-medium ${textColor} ${className}`}
    >
      {label}
    </button>
  );
}
