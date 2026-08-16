import { useCallback, useRef } from 'react'
import { useNavigate, type NavigateOptions, type To } from 'react-router'
import { preloadDocentStage } from '../features/docent/preloadDocentStage'
import { markNavigationTriggerPending } from './navigationTrigger'

type NavigationTarget = To | number

type PreparedNavigateOptions = NavigateOptions & {
  /** 목적지 화면이 실제로 쓰는 자산을 미리 받아온다. */
  prepare?: () => Promise<unknown>
  /** 도슨트가 없는 화면(B1 등)으로 갈 때 2.2MB 모델 프리로드를 건너뛴다. */
  skipDocentPreload?: boolean
}

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

  return useCallback((target: NavigationTarget, options?: PreparedNavigateOptions) => {
    if (typeof target === 'number') {
      navigate(target)
      return
    }

    if (isPreparing.current) {
      return
    }

    isPreparing.current = true
    markNavigationTriggerPending()

    const { prepare, skipDocentPreload, ...navigateOptions } = options ?? {}

    void Promise.all([
      skipDocentPreload ? Promise.resolve() : preloadDocentStage().catch(() => undefined),
      prepare?.().catch(() => undefined) ?? Promise.resolve(),
      waitForMinimumFeedback(),
    ]).then(() => {
      isPreparing.current = false
      navigate(target, navigateOptions)
    })
  }, [navigate])
}
