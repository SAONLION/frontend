import { lazy, Suspense, useLayoutEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router'
import { AppRoutes } from './app/routes'
import { realStaffCallService } from './api/staffCallService'
import { liveProductContentProvider } from './api/liveProductContentProvider'
import { realTryOnRequestService } from './api/tryOnRequestService'
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
import { realAiAnswerService } from './api/aiAnswerService'
import { isLiveSource, type DataSourceRow } from './features/dev-diagnostics/dataSources'
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

// 화면·Provider에 실제로 주입하는 구현. 여기 한 곳만 바꾸면 Mock ↔ Live가 전환된다.
const productContentProvider = liveProductContentProvider
const aiAnswerService = realAiAnswerService
const staffCallService = realStaffCallService
const priceInquiryRequestService = mockPriceInquiryRequestService
const tryOnRequestService = realTryOnRequestService

// 개발 진단 패널이 보여줄 출처 표. 위 상수에서 계산하므로 교체하면 자동으로 따라간다.
const DEV_DATA_SOURCES: readonly DataSourceRow[] = [
  // 하이브리드: 서버에 값이 있으면 서버, 비어 있으면 fixture. 현재 이미지·사이즈·상세는 서버가 비어 있다.
  { label: '제품 콘텐츠 (하이브리드)', live: isLiveSource(productContentProvider, mockProductContentProvider) },
  { label: 'AI 답변 (C5)', live: isLiveSource(aiAnswerService, mockAiAnswerService) },
  // 직원 호출은 Mock 구현이 제거되어 비교 대상이 실서비스다. Mock으로 되돌리면 MOCK으로 바뀐다.
  { label: '직원 호출 (C)', live: !isLiveSource(staffCallService, realStaffCallService) },
  { label: '가격 요청 (C4-1)', live: isLiveSource(priceInquiryRequestService, mockPriceInquiryRequestService) },
  { label: '착장 요청 (C3-3)', live: isLiveSource(tryOnRequestService, mockTryOnRequestService) },
  // 구매 문의는 Provider가 아니라 화면이 직접 호출한다. 흐름이 C3-3 하나뿐이라 경계를 만들지 않았다.
  { label: '구매 문의 (C3-3-4)', live: true },
]

// production 빌드에서는 이 분기가 제거되어 패널 코드와 CSS가 번들에 들어가지 않는다.
const DevDiagnosticsPanel = import.meta.env.DEV
  ? lazy(async () => {
      const module = await import('./features/dev-diagnostics/DevDiagnosticsPanel')
      return { default: module.DevDiagnosticsPanel }
    })
  : null

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
      {DevDiagnosticsPanel && (
        <Suspense fallback={null}>
          <DevDiagnosticsPanel dataSources={DEV_DATA_SOURCES} />
        </Suspense>
      )}
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
