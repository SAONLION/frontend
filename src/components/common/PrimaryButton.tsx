type PrimaryButtonProps = {
  className?: string
  disabled?: boolean
  label: string
  onClick?: () => void
}

export default function PrimaryButton({ className = '', disabled = false, label, onClick }: PrimaryButtonProps) {
  return (
    <button
      className={`stage-entry-primary-button ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}
