import { useEffect, useId, useRef } from 'react'
import type { BlockerPromptVariant } from '../../features/blocker/blockerTypes'
import { mockBlockerPromptCopy } from '../../mocks/fixtures/demoContent'

type BlockerPromptProps = {
  variant: BlockerPromptVariant
  productName: string
  onAccept: () => void
  onDecline: () => void
}

/** The shared F6 bottom-sheet shell. Behaviour is deliberately variant-specific. */
export function BlockerPrompt({ variant, productName, onAccept, onDecline }: BlockerPromptProps) {
  const copy = mockBlockerPromptCopy[variant]
  const acceptButtonRef = useRef<HTMLButtonElement>(null)
  const declineButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const declineRef = useRef(onDecline)
  const titleId = useId()

  useEffect(() => { declineRef.current = onDecline }, [onDecline])

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    acceptButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') declineRef.current()
      if (event.key === 'Tab') {
        const active = document.activeElement
        if (event.shiftKey && active === acceptButtonRef.current) {
          event.preventDefault()
          declineButtonRef.current?.focus()
        } else if (!event.shiftKey && active === declineButtonRef.current) {
          event.preventDefault()
          acceptButtonRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      openerRef.current?.focus()
    }
  }, [])

  return (
    <section aria-labelledby={titleId} aria-modal="true" className="blocker-prompt" role="dialog">
      <span aria-hidden="true" className="blocker-prompt__handle" />
      <h1 id={titleId}>{copy.title(productName)}</h1>
      <div className="blocker-prompt__actions">
        <button className="blocker-prompt__button blocker-prompt__button--primary" ref={acceptButtonRef} type="button" onClick={onAccept}>{copy.accept}</button>
        <button className="blocker-prompt__button blocker-prompt__button--secondary" ref={declineButtonRef} type="button" onClick={onDecline}>{copy.decline}</button>
      </div>
    </section>
  )
}
