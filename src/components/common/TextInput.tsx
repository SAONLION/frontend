interface TextInputProps {
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  className?: string;
}

export default function TextInput({ ariaLabel, value, onChange, placeholder, maxLength, className = '' }: TextInputProps) {
  return (
    <input
      type="text"
      aria-label={ariaLabel}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-[46px] rounded-xl bg-[rgba(217,217,217,0.38)] pl-[19px] text-[14px] font-medium leading-[1.5] text-white outline-none placeholder:text-[#d4d4d4] ${className}`}
    />
  );
}
