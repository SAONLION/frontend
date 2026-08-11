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
      className={`relative flex h-13 items-center justify-center rounded-[30px] bg-[#8a5111] text-[16px] font-medium text-white shadow-[inset_0px_-2px_4px_0px_rgba(255,255,255,0.25)] ${className}`}
    >
      {label}
    </button>
  );
}
