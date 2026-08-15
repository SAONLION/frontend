import { useState } from 'react';
import { PRIMARY_BG, PRIMARY_INSET_HIGHLIGHT, SURFACE_MUTED_BG } from '../../styles/tokens';

interface SecondaryButtonProps {
  label: string;
  onClick?: () => void;
  selected?: boolean;
  fullWidth?: boolean;
  textColor?: string;
  className?: string;
  pendingOnClick?: boolean;
}

export default function SecondaryButton({
  label,
  onClick,
  selected,
  fullWidth = true,
  textColor = 'text-white',
  className = '',
  pendingOnClick = false,
}: SecondaryButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = () => {
    if (isPending) return;
    if (pendingOnClick) setIsPending(true);
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      data-navigation-pending={isPending || undefined}
      disabled={isPending}
      className={`liquid-glass-button liquid-glass-button--secondary flex h-13.5 items-center justify-center rounded-full text-[16px] font-medium transition ${
        fullWidth ? 'w-full' : 'flex-1'
      } ${selected ? `${PRIMARY_BG} ${PRIMARY_INSET_HIGHLIGHT}` : SURFACE_MUTED_BG} ${textColor} ${className}`}
    >
      {label}
    </button>
  );
}
