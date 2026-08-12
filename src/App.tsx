import { BrowserRouter, useLocation } from 'react-router'
import { AppRoutes } from './app/routes'
import { SessionProvider } from './features/session/SessionProvider'
import { mockProductContentProvider } from './mocks/providers/mockProductContentProvider'
import { ProductContentProvider } from './services/product-content/ProductContentProvider'
import { StaffCallProvider } from './features/sa-call/StaffCallContext'
import { mockStaffCallService } from './mocks/providers/mockStaffCallService'
import { TryOnRequestProvider } from './features/try-on/TryOnRequestContext'
import { mockTryOnRequestService } from './mocks/providers/mockTryOnRequestService'
import { PriceInquiryRequestProvider } from './features/price-inquiry/PriceInquiryRequestContext'
import { mockPriceInquiryRequestService } from './mocks/providers/mockPriceInquiryRequestService'
import { AiAnswerProvider } from './features/ai-answer/AiAnswerContext'
import { mockAiAnswerService } from './mocks/providers/mockAiAnswerService'
import { AmbientBronzeBackground } from './components/common/AmbientBronzeBackground'
import { DocentStage } from './components/domain/DocentStage'
import './App.css'

function PersistentEntryDocent() {
  const { pathname } = useLocation()

  if (!pathname.startsWith('/stage-a/') && !pathname.startsWith('/stage-b/')) {
    return null
  }

  return (
    <section aria-label="나이비스 AI 도슨트" className="stage-entry-persistent-docent">
      <DocentStage cue="idle" />
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AmbientBronzeBackground />
        <div className="app-shell__content">
          <PersistentEntryDocent />
          <ProductContentProvider value={mockProductContentProvider}>
            <AiAnswerProvider value={mockAiAnswerService}>
              <StaffCallProvider value={mockStaffCallService}>
                <PriceInquiryRequestProvider value={mockPriceInquiryRequestService}>
                  <TryOnRequestProvider value={mockTryOnRequestService}>
                    <SessionProvider>
                      <AppRoutes />
                    </SessionProvider>
                  </TryOnRequestProvider>
                </PriceInquiryRequestProvider>
              </StaffCallProvider>
            </AiAnswerProvider>
          </ProductContentProvider>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
