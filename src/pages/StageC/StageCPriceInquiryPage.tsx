import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { PreparedLink } from '../../components/common/PreparedLink'
import { DocentStage } from '../../components/domain/DocentStage'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'
import { GlassInfoCard, StageCDetailShell } from '../../components/domain/StageCDetailShell'
import { EVENT_NAMES } from '../../constants/events'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC'
import { usePriceInquiryRequestService } from '../../features/price-inquiry/usePriceInquiryRequestService'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { StageCState } from './StageCHubPage'

type PriceInquiryPageState = 'request' | 'pending' | 'completed'

const PRICE_INQUIRY_COPY: Record<PriceInquiryPageState, { cue: 'present' | 'sending' | 'success'; title: string; description: string }> = {
  request: { cue: 'present', title: '가격은 직원이 직접\n안내해 드려요.', description: '가격과 구매 관련 안내를 원하시면 직원에게 요청을 전달할게요.' },
  pending: { cue: 'sending', title: '직원에게 가격 안내를\n요청하고 있어요.', description: '잠시 후 요청 전달 상태를 알려드릴게요.' },
  completed: { cue: 'success', title: '직원에게 구매 안내 요청을 보냈어요!', description: '가격과 관련 정보들을 곧 안내해 드릴게요!' },
}

export function StageCPriceInquiryPage({ state: pageState }: { state: PriceInquiryPageState }) {
  const { sku = '' } = useParams()
  const product = useStageCProduct(sku)

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />
  }

  return <PriceInquiryContent pageState={pageState} sku={sku} />
}

type PriceInquiryContentProps = {
  pageState: PriceInquiryPageState
  sku: string
}

function PriceInquiryContent({ pageState, sku }: PriceInquiryContentProps) {
  const navigate = usePreparedNavigate()
  const { dispatch, state } = useSession()
  const requestService = usePriceInquiryRequestService()
  const requestStartedRef = useRef(false)
  const [areActionsVisible, setAreActionsVisible] = useState(false)
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)
  const exitProduct = useProductExit(sku)
  const purchaseHubPath = stageCPath(STAGE_C_ROUTES.c4, sku)
  const priceRequestPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiry, sku)
  const pendingPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryPending, sku)
  const completedPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryCompleted, sku)
  const hasRequestContext = state.events.some(
    (event) => event.name === EVENT_NAMES.priceInquiryRequest && event.sku === sku,
  )

  useEffect(() => {
    let active = true

    if (pageState !== 'pending' || !hasRequestContext) {
      return () => { active = false }
    }

    const completion = requestService.requestPriceInquiry(sku)
    void completion.then(() => {
      if (active) navigate(completedPath, { replace: true })
    })

    return () => { active = false }
  }, [completedPath, hasRequestContext, navigate, pageState, requestService, sku])

  const submitRequest = () => {
    if (requestStartedRef.current || hasRequestContext) return
    requestStartedRef.current = true
    dispatch({ type: SESSION_ACTIONS.recordPriceInquiryRequest, sku })
    navigate(pendingPath)
  }

  if (pageState === 'request' && hasRequestContext) {
    return <Navigate replace to={completedPath} />
  }

  if (pageState !== 'request' && !hasRequestContext) {
    return <PriceInquiryFallback path={priceRequestPath} />
  }

  const copy = PRICE_INQUIRY_COPY[pageState]
  return (
    <StageCDetailShell className="stage-c-price-inquiry-shell">
      <div className="stage-c-price-inquiry-content">
        <section aria-label="나이비스 AI 도슨트" className="stage-c-price-inquiry-docent"><DocentStage continuityKey="price-inquiry" cue={copy.cue} /></section>
        <h1><KineticTextReveal autoPlay blur className="justify-center" distance={16} onRevealComplete={() => { setIsDescriptionVisible(true); setAreActionsVisible(true) }} splitBy="characters" stagger={0.035} text={copy.title} waitForDocent /></h1>
        {isDescriptionVisible && <p><KineticTextReveal autoPlay blur={false} className="justify-center" distance={8} splitBy="words" stagger={0.1} text={copy.description} waitForDocent /></p>}
        {pageState === 'request' && isDescriptionVisible && <span className="stage-c-price-inquiry-note">원하실 때만 요청해 주세요.</span>}
      </div>
      {areActionsVisible && <div className="stage-c-price-inquiry-actions">
        {pageState === 'request' && <button className="stage-c-action-button stage-c-action-button--primary" onClick={submitRequest} type="button">직원에게 가격 안내 요청하기</button>}
        {pageState === 'request' && <PreparedLink className="stage-c-action-button" to={purchaseHubPath}>구매 조건으로 돌아가기</PreparedLink>}
        {pageState === 'pending' && <PreparedLink className="stage-c-action-button" to={purchaseHubPath}>다른 정보 보기</PreparedLink>}
        {pageState === 'completed' && <button className="stage-c-action-button" onClick={exitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>}
      </div>}
    </StageCDetailShell>
  )
}

function PriceInquiryFallback({ path }: { path: string }) {
  return <StageCDetailShell><GlassInfoCard><h1>가격 안내 요청 정보를 찾을 수 없어요.</h1><p>가격 안내를 원하시면 먼저 요청해 주세요.</p><PreparedLink className="stage-c-glass-link-button" to={path}>가격 안내 요청하기</PreparedLink></GlassInfoCard></StageCDetailShell>
}
