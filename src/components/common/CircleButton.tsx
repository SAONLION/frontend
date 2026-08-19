import arrowUpIcon from '../../assets/images/icon-arrow-up.svg'

type CircleButtonProps = {
  ariaLabel?: string
  className?: string
  disabled?: boolean
  /** 비동기 제출 중에도 누른 상태를 유지한다. */
  isPending?: boolean
  direction?: 'right' | 'up'
  onClick?: () => void
  type?: 'button' | 'submit'
}

export default function CircleButton({
  ariaLabel = '다음',
  className = '',
  disabled = false,
  isPending = false,
  direction = 'up',
  onClick,
  type = 'button',
}: CircleButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={`stage-entry-circle-button stage-entry-circle-button--${direction} ${className}`.trim()}
      data-navigation-pending={isPending || undefined}
      disabled={disabled || isPending}
      onClick={onClick}
      type={type}
    >
      <img alt="" src={arrowUpIcon} />
    </button>
  )
}
