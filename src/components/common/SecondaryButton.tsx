import { PRIMARY_BG, PRIMARY_INSET_HIGHLIGHT, SURFACE_MUTED_BG } from '../../styles/tokens';

interface SecondaryButtonProps {
  label: string;
  onClick?: () => void;
  selected?: boolean;
  fullWidth?: boolean;
  textColor?: string;
  className?: string;
}

export default function SecondaryButton({
  label,
  onClick,
  selected,
  fullWidth = true,
  textColor = 'text-white',
  className = '',
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`liquid-glass-button liquid-glass-button--secondary flex h-13.5 items-center justify-center rounded-full text-[16px] font-medium transition ${
        fullWidth ? 'w-full' : 'flex-1'
      } ${selected ? `${PRIMARY_BG} ${PRIMARY_INSET_HIGHLIGHT}` : SURFACE_MUTED_BG} ${textColor} ${className}`}
    >
      {label}
    </button>
  );
}
