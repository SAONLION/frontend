let lastNavigationTrigger: HTMLElement | null = null

export function rememberNavigationTrigger(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return
  }

  const trigger = target.closest('button, a')
  lastNavigationTrigger = trigger instanceof HTMLElement ? trigger : null
}

export function markNavigationTriggerPending() {
  const activeElement = document.activeElement
  const trigger = lastNavigationTrigger
    ?? (activeElement instanceof HTMLElement && activeElement.matches('button, a') ? activeElement : null)

  if (!trigger) {
    return
  }

  trigger.dataset.navigationPending = 'true'

  if (trigger instanceof HTMLButtonElement) {
    trigger.disabled = true
  }
}
