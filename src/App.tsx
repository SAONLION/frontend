import { lazy, Suspense, useLayoutEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router'
import { AppRoutes } from './app/routes'
import { realStaffCallService } from './api/staffCallService'
import { SessionBootstrap } from './features/session/SessionBootstrap'
import { SessionProvider } from './features/session/SessionProvider'
import { ProductContentProvider } from './services/product-content/ProductContentProvider'
import { mockProductContentProvider } from './mocks/providers/mockProductContentProvider'
import { StaffCallProvider } from './features/sa-call/StaffCallContext'
import { PriceInquiryRequestProvider } from './features/price-inquiry/PriceInquiryRequestContext'
import { mockPriceInquiryRequestService } from './mocks/providers/mockPriceInquiryRequestService'
import { TryOnRequestProvider } from './features/try-on/TryOnRequestContext'
import { mockTryOnRequestService } from './mocks/providers/mockTryOnRequestService'
import { AiAnswerProvider } from './features/ai-answer/AiAnswerContext'
import { ContactProvider } from './features/contact/ContactProvider'
import { PendingActionWatcher } from './features/blocker/PendingActionWatcher'
import { mockAiAnswerService } from './mocks/providers/mockAiAnswerService'
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
      <ProductContentProvider value={mockProductContentProvider}>
        <AiAnswerProvider value={mockAiAnswerService}>
          <StaffCallProvider value={realStaffCallService}>
            <PriceInquiryRequestProvider value={mockPriceInquiryRequestService}>
              <TryOnRequestProvider value={mockTryOnRequestService}>
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
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
