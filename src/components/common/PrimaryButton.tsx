import { useState } from 'react';
import { PRIMARY_BG, PRIMARY_INSET_HIGHLIGHT } from '../../styles/tokens';

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  pendingOnClick?: boolean;
  /** 비동기 작업의 대기 상태를 호출부가 제어해야 할 때 사용한다. */
  isPending?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({ label, onClick, className = '', pendingOnClick = false, isPending = false, disabled = false }: PrimaryButtonProps) {
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
      data-navigation-pending={pending || undefined}
      disabled={pending || disabled}
      className={`liquid-glass-button liquid-glass-button--primary relative flex h-13 items-center justify-center rounded-[30px] ${PRIMARY_BG} text-[16px] font-medium text-white ${PRIMARY_INSET_HIGHLIGHT} ${className}`}
    >
      {label}
    </button>
  );
}
