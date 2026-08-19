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
  /** 비동기 작업의 대기 상태를 호출부가 제어해야 할 때 사용한다. */
  isPending?: boolean;
  disabled?: boolean;
}

export default function SecondaryButton({
  label,
  onClick,
  selected,
  fullWidth = true,
  textColor = 'text-white',
  className = '',
  pendingOnClick = false,
  isPending = false,
  disabled = false,
}: SecondaryButtonProps) {
  const [localIsPending, setLocalIsPending] = useState(false);
  const pending = localIsPending || isPending;

  const handleClick = () => {
    if (pending || disabled) return;
    if (pendingOnClick) setLocalIsPending(true);
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      data-navigation-pending={pending || undefined}
      disabled={pending || disabled}
      className={`liquid-glass-button liquid-glass-button--secondary flex h-13.5 items-center justify-center rounded-full text-[16px] font-medium transition ${
        fullWidth ? 'w-full' : 'flex-1'
      } ${selected ? `${PRIMARY_BG} ${PRIMARY_INSET_HIGHLIGHT}` : SURFACE_MUTED_BG} ${textColor} ${className}`}
    >
      {label}
    </button>
  );
}
