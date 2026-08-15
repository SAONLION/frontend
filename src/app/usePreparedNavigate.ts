import { useCallback, useRef } from 'react'
import { useNavigate, type NavigateOptions, type To } from 'react-router'
import { preloadDocentStage } from '../features/docent/preloadDocentStage'
import { markNavigationTriggerPending } from './navigationTrigger'

type NavigationTarget = To | number

const MINIMUM_PENDING_FEEDBACK_MS = 180

function waitForMinimumFeedback() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, MINIMUM_PENDING_FEEDBACK_MS))
}

/**
 * Keeps the current screen visible while the next screen's required docent
 * resources are fetched. Future route data requests belong in this boundary.
 */
export function usePreparedNavigate() {
  const navigate = useNavigate()
  const isPreparing = useRef(false)

  return useCallback((target: NavigationTarget, options?: NavigateOptions) => {
    if (typeof target === 'number') {
      navigate(target)
      return
    }

    if (isPreparing.current) {
      return
    }

    isPreparing.current = true
    markNavigationTriggerPending()

    void Promise.all([
      preloadDocentStage().catch(() => undefined),
      waitForMinimumFeedback(),
    ]).then(() => {
      isPreparing.current = false
      navigate(target, options)
    })
  }, [navigate])
}
