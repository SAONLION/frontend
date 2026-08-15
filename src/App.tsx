import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router'
import { AppRoutes } from './app/routes'
import { SessionProvider } from './features/session/SessionProvider'
import { ProductContentProvider } from './services/product-content/ProductContentProvider'
import { mockProductContentProvider } from './mocks/providers/mockProductContentProvider'
import { StaffCallProvider } from './features/sa-call/StaffCallContext'
import { mockStaffCallService } from './mocks/providers/mockStaffCallService'
import { PriceInquiryRequestProvider } from './features/price-inquiry/PriceInquiryRequestContext'
import { mockPriceInquiryRequestService } from './mocks/providers/mockPriceInquiryRequestService'
import { TryOnRequestProvider } from './features/try-on/TryOnRequestContext'
import { mockTryOnRequestService } from './mocks/providers/mockTryOnRequestService'
import { AiAnswerProvider } from './features/ai-answer/AiAnswerContext'
import { ContactProvider } from './features/contact/ContactProvider'
import { mockAiAnswerService } from './mocks/providers/mockAiAnswerService'
import { AmbientBronzeBackground } from './components/common/AmbientBronzeBackground'
import { LiquidGlassFilterDefinitions } from './components/common/LiquidGlassFilterDefinitions'
import { DocentStage } from './components/domain/DocentStage'
import type { DocentCue } from './components/domain/DocentStage'
import { markDocentReady } from './features/docent/docentReadiness'
import { useSession } from './features/session/useSession'
import './App.css'
import './StageExternal.css'
import './StageF.css'
import './Motion.css'

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

function PersistentEntryDocent() {
  const { pathname } = useLocation()
  const { state } = useSession()
  const [isReturningFromHandoff, setIsReturningFromHandoff] = useState(false)
  const [docentInstance, setDocentInstance] = useState(0)
  const previousOverlay = useRef(state.activeOverlay)

  const isB1Handoff = pathname === '/stage-b/nfc' && state.activeOverlay === 'E'

  useEffect(() => {
    const didCloseB1Overlay = previousOverlay.current === 'E'
      && state.activeOverlay !== 'E'
      && pathname === '/stage-b/nfc'
    previousOverlay.current = state.activeOverlay

    if (isB1Handoff) {
      setIsReturningFromHandoff(false)
      return
    }
    if (!didCloseB1Overlay) return
    setIsReturningFromHandoff(true)
    setDocentInstance((current) => current + 1)
    const timer = window.setTimeout(() => setIsReturningFromHandoff(false), 950)
    return () => window.clearTimeout(timer)
  }, [isB1Handoff, pathname, state.activeOverlay])

  if (!pathname.startsWith('/stage-a/') && !pathname.startsWith('/stage-b/')) {
    return null
  }
  const cue: DocentCue = isB1Handoff
    ? 'handoff'
    : isReturningFromHandoff && pathname === '/stage-b/nfc'
      ? 'return-nfc'
    : pathname === '/stage-a/intro'
    ? 'greet'
    : pathname === '/stage-a/nickname'
      ? 'listen'
      : pathname === '/stage-b/nfc'
        ? 'nfc-guide'
        : 'scan'

  return (
    <section
      aria-label="나이비스 AI 도슨트"
      className={`stage-entry-persistent-docent${isB1Handoff ? ' stage-entry-persistent-docent--handoff' : ''}${isReturningFromHandoff ? ' stage-entry-persistent-docent--returning' : ''}`}
      style={isB1Handoff ? undefined : { opacity: 1, visibility: 'visible' }}
    >
      <DocentStage immediate={isReturningFromHandoff} key={docentInstance} cue={cue} onReady={markDocentReady} />
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
          <StaffCallProvider value={mockStaffCallService}>
            <PriceInquiryRequestProvider value={mockPriceInquiryRequestService}>
              <TryOnRequestProvider value={mockTryOnRequestService}>
                <ContactProvider>
                  <SessionProvider>
                    <PersistentEntryDocent />
                    <AppRoutes />
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
