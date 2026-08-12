import { PRIMARY_BG, PRIMARY_INSET_HIGHLIGHT, SURFACE_MUTED_BG } from '../../styles/tokens';

interface OptionChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export default function OptionChip({ label, selected, onClick, className = '' }: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex h-13.5 flex-1 items-center justify-center rounded-full text-[16px] font-medium text-white transition ${
        selected ? `${PRIMARY_BG} ${PRIMARY_INSET_HIGHLIGHT}` : SURFACE_MUTED_BG
      } ${className}`}
    >
      {label}
    </button>
  );
}
