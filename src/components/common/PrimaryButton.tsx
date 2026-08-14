import { PRIMARY_BG, PRIMARY_INSET_HIGHLIGHT } from '../../styles/tokens';

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function PrimaryButton({ label, onClick, className = '' }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-13 items-center justify-center rounded-[30px] ${PRIMARY_BG} text-[16px] font-medium text-white ${PRIMARY_INSET_HIGHLIGHT} ${className}`}
    >
      {label}
    </button>
  );
}
