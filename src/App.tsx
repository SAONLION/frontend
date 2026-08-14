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
import './App.css'
import './StageExternal.css'
import './StageF.css'
import './Motion.css'

function PersistentEntryDocent() {
  const { pathname } = useLocation()

  if (!pathname.startsWith('/stage-a/') && !pathname.startsWith('/stage-b/')) {
    return null
  }

  const cue: DocentCue = pathname === '/stage-a/intro'
    ? 'greet'
    : pathname === '/stage-a/nickname'
      ? 'listen'
      : pathname === '/stage-b/nfc'
        ? 'guide'
        : 'scan'

  return (
    <section aria-label="나이비스 AI 도슨트" className="stage-entry-persistent-docent">
      <DocentStage cue={cue} />
    </section>
  )
}

function AppContent() {
  return (
    <div className="app-shell">
      <LiquidGlassFilterDefinitions />
      <AmbientBronzeBackground />
      <div className="app-shell__content">
        <PersistentEntryDocent />
      <ProductContentProvider value={mockProductContentProvider}>
        <AiAnswerProvider value={mockAiAnswerService}>
          <StaffCallProvider value={mockStaffCallService}>
            <PriceInquiryRequestProvider value={mockPriceInquiryRequestService}>
              <TryOnRequestProvider value={mockTryOnRequestService}>
                <ContactProvider>
                  <SessionProvider>
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
