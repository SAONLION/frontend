import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { realStaffCallService } from '../../api/staffCallService'
import { liveProductContentProvider } from '../../api/liveProductContentProvider'
import { realTryOnRequestService } from '../../api/tryOnRequestService'
import { AppRoutes } from '../routes'
import { shouldRenderDemoShell } from '../../pages/Demo/demoShellEntry'
import { SessionBootstrap } from '../../features/session/SessionBootstrap'
import { SessionProvider } from '../../features/session/SessionProvider'
import { ProductContentProvider } from '../../services/product-content/ProductContentProvider'
import { StaffCallProvider } from '../../features/sa-call/StaffCallContext'
import { PriceInquiryRequestProvider } from '../../features/price-inquiry/PriceInquiryRequestContext'
import { mockPriceInquiryRequestService } from '../../mocks/providers/mockPriceInquiryRequestService'
import { TryOnRequestProvider } from '../../features/try-on/TryOnRequestContext'
import { AiAnswerProvider } from '../../features/ai-answer/AiAnswerContext'
import { ContactProvider } from '../../features/contact/ContactProvider'
import { PendingActionWatcher } from '../../features/blocker/PendingActionWatcher'
import { realAiAnswerService } from '../../api/aiAnswerService'
import { AmbientBronzeBackground } from '../../components/common/AmbientBronzeBackground'
import { LiquidGlassFilterDefinitions } from '../../components/common/LiquidGlassFilterDefinitions'
import { DocentStage } from '../../components/domain/DocentStage'
import type { DocentCue } from '../../components/domain/DocentStage'
import { markDocentReady } from '../../features/docent/docentReadiness'
import { exposeApiLogBridge } from '../../features/demo-tools/apiLogBridge'
import '../../App.css'
import '../../StageExternal.css'
import '../../StageF.css'
import '../../Motion.css'
import '../../PendingAction.css'

const CosmicGoldDust = lazy(async () => {
  const module = await import('../../components/common/CosmicGoldDust')
  return { default: module.CosmicGoldDust }
})

const DemoShellPage = lazy(() => import('../../pages/Demo/DemoShellPage'))

const productContentProvider = liveProductContentProvider
const aiAnswerService = realAiAnswerService
const staffCallService = realStaffCallService
const priceInquiryRequestService = mockPriceInquiryRequestService
const tryOnRequestService = realTryOnRequestService

const DUST_EXIT_DURATION_MS = 700
const DUST_START_DELAY_MS = 550

// 목업 셸(바깥 창)이 앱의 API 호출 기록을 읽을 수 있게 고객 앱에서만 창에 연결한다.
exposeApiLogBridge()

function StageAGoldDust() {
  const { pathname } = useLocation()
  const isStageA = pathname.startsWith('/stage-a/')
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useLayoutEffect(() => {
    if (isStageA) {
      setIsExiting(false)
      const startTimer = window.setTimeout(() => setIsVisible(true), DUST_START_DELAY_MS)
      return () => window.clearTimeout(startTimer)
    }

    if (!isVisible) return

    setIsExiting(true)
    const exitTimer = window.setTimeout(() => {
      setIsVisible(false)
      setIsExiting(false)
    }, DUST_EXIT_DURATION_MS)

    return () => window.clearTimeout(exitTimer)
  }, [isStageA, isVisible])

  if (!isVisible) return null

  return (
    <Suspense fallback={null}>
      <CosmicGoldDust isExiting={isExiting} />
    </Suspense>
  )
}

function PersistentEntryDocent() {
  const { pathname } = useLocation()

  if (pathname === '/stage-b/nfc' || (!pathname.startsWith('/stage-a/') && !pathname.startsWith('/stage-b/'))) {
    return null
  }

  const cue: DocentCue = pathname === '/stage-a/intro'
    ? 'greet'
    : pathname === '/stage-a/nickname'
      ? 'listen'
      : 'scan'

  return (
    <section aria-label="나이비스 AI 도슨트" className="stage-entry-persistent-docent">
      <DocentStage cue={cue} onReady={markDocentReady} />
    </section>
  )
}

function CustomerServiceWorker() {
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

    const register = () => {
      void navigator.serviceWorker.register('/sw.js')
    }

    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })

    return () => window.removeEventListener('load', register)
  }, [])

  return null
}

export default function CustomerApp() {
  // 목업 셸은 iframe으로 앱 전체를 다시 띄운다. 고객 Provider와 도슨트 캔버스가
  // 바깥 프레임에서도 실행되지 않도록 CustomerApp 조합 전에 분기한다.
  if (shouldRenderDemoShell(window.location.pathname)) {
    return (
      <Suspense fallback={null}>
        <DemoShellPage />
      </Suspense>
    )
  }

  return (
    <div className="app-shell">
      <CustomerServiceWorker />
      <LiquidGlassFilterDefinitions />
      <AmbientBronzeBackground />
      <StageAGoldDust />
      <div className="app-shell__content">
        <ProductContentProvider value={productContentProvider}>
          <AiAnswerProvider value={aiAnswerService}>
            <StaffCallProvider value={staffCallService}>
              <PriceInquiryRequestProvider value={priceInquiryRequestService}>
                <TryOnRequestProvider value={tryOnRequestService}>
                  <ContactProvider>
                    <SessionProvider>
                      <SessionBootstrap>
                        <PersistentEntryDocent />
                        <AppRoutes />
                        <PendingActionWatcher />
                      </SessionBootstrap>
                    </SessionProvider>
                  </ContactProvider>
                </TryOnRequestProvider>
              </PriceInquiryRequestProvider>
            </StaffCallProvider>
          </AiAnswerProvider>
        </ProductContentProvider>
      </div>
    </div>
  )
}
