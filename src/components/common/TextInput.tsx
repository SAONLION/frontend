type TextInputProps = {
  ariaLabel?: string
  className?: string
  maxLength?: number
  onChange: (value: string) => void
  placeholder: string
  value: string
}

export default function TextInput({
  ariaLabel = '텍스트 입력',
  className = '',
  maxLength,
  onChange,
  placeholder,
  value,
}: TextInputProps) {
  return (
    <input
      aria-label={ariaLabel}
      className={`stage-entry-text-input ${className}`.trim()}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  )
}
