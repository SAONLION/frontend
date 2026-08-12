import arrowUpIcon from '../../assets/images/icon-arrow-up.svg'

type CircleButtonProps = {
  ariaLabel?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}

export default function CircleButton({
  ariaLabel = '다음',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: CircleButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={`stage-entry-circle-button ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      <img alt="" src={arrowUpIcon} />
    </button>
  )
}
