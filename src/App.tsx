import { lazy, Suspense, useLayoutEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router'
import { AppRoutes } from './app/routes'
import { shouldRenderDemoShell } from './pages/Demo/demoShellEntry'
import { realStaffCallService } from './api/staffCallService'
import { liveProductContentProvider } from './api/liveProductContentProvider'
import { realTryOnRequestService } from './api/tryOnRequestService'
import { SessionBootstrap } from './features/session/SessionBootstrap'
import { SessionProvider } from './features/session/SessionProvider'
import { ProductContentProvider } from './services/product-content/ProductContentProvider'
import { StaffCallProvider } from './features/sa-call/StaffCallContext'
import { PriceInquiryRequestProvider } from './features/price-inquiry/PriceInquiryRequestContext'
import { mockPriceInquiryRequestService } from './mocks/providers/mockPriceInquiryRequestService'
import { TryOnRequestProvider } from './features/try-on/TryOnRequestContext'
import { AiAnswerProvider } from './features/ai-answer/AiAnswerContext'
import { ContactProvider } from './features/contact/ContactProvider'
import { PendingActionWatcher } from './features/blocker/PendingActionWatcher'
import { realAiAnswerService } from './api/aiAnswerService'
import { AmbientBronzeBackground } from './components/common/AmbientBronzeBackground'
import { LiquidGlassFilterDefinitions } from './components/common/LiquidGlassFilterDefinitions'
import { DocentStage } from './components/domain/DocentStage'
import type { DocentCue } from './components/domain/DocentStage'
import { markDocentReady } from './features/docent/docentReadiness'
import './App.css'
import './StageExternal.css'
import './StageF.css'
import './Motion.css'
import './PendingAction.css'

const CosmicGoldDust = lazy(async () => {
  const module = await import('./components/common/CosmicGoldDust')
  return { default: module.CosmicGoldDust }
})

// 시연용 목업 셸. 앱 본체와 CSS를 공유하지 않도록 별도 청크로 떼어 둔다.
const DemoShellPage = lazy(() => import('./pages/Demo/DemoShellPage'))

// 화면·Provider에 실제로 주입하는 구현. 여기 한 곳만 바꾸면 Mock ↔ Live가 전환된다.
const productContentProvider = liveProductContentProvider
const aiAnswerService = realAiAnswerService
const staffCallService = realStaffCallService
const priceInquiryRequestService = mockPriceInquiryRequestService
const tryOnRequestService = realTryOnRequestService

const DUST_EXIT_DURATION_MS = 700
const DUST_START_DELAY_MS = 550

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

    if (!isVisible) {
      return
    }

    setIsExiting(true)
    const exitTimer = window.setTimeout(() => {
      setIsVisible(false)
      setIsExiting(false)
    }, DUST_EXIT_DURATION_MS)

    return () => window.clearTimeout(exitTimer)
  }, [isStageA, isVisible])

  if (!isVisible) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <CosmicGoldDust isExiting={isExiting} />
    </Suspense>
  )
}

// B1(/stage-b/nfc)은 여권 카드 디자인으로 교체되면서 도슨트를 이 화면에서는 보여주지 않는다.
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

function AppContent() {
  return (
    <div className="app-shell">
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

function App() {
  // 목업 셸은 iframe으로 앱 전체를 다시 띄운다. 세션 부트스트랩과 도슨트 캔버스가
  // 바깥 프레임에서도 돌지 않도록 Provider 트리에 들어가기 전에 갈라놓는다.
  if (shouldRenderDemoShell(window.location.pathname)) {
    return (
      <Suspense fallback={null}>
        <DemoShellPage />
      </Suspense>
    )
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
