import { type ComponentProps, type MouseEvent, useState } from 'react'
import { Link } from 'react-router'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'

type PreparedLinkProps = ComponentProps<typeof Link>

/** A route link that preserves its pressed state until the next screen is prepared. */
export function PreparedLink({ children, onClick, replace, state, to, ...linkProps }: PreparedLinkProps) {
  const navigate = usePreparedNavigate()
  const [isPending, setIsPending] = useState(false)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return
    }

    event.preventDefault()
    event.currentTarget.dataset.navigationPending = 'true'
    setIsPending(true)
    navigate(to, { replace, state })
  }

  return (
    <Link
      {...linkProps}
      aria-disabled={isPending || undefined}
      data-navigation-pending={isPending || undefined}
      onClick={handleClick}
      replace={replace}
      state={state}
      to={to}
    >
      {children}
    </Link>
  )
}
