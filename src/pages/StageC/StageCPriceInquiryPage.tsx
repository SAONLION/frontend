import { useEffect, useRef } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { DocentStage } from '../../components/domain/DocentStage'
import {
  GlassBottomActionDock,
  GlassInfoCard,
  GlassSpeechBubble,
  GlassTopBar,
  StageCDetailShell,
} from '../../components/domain/StageCDetailShell'
import { EVENT_NAMES } from '../../constants/events'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC'
import { usePriceInquiryRequestService } from '../../features/price-inquiry/usePriceInquiryRequestService'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { StageCState } from './StageCHubPage'

type PriceInquiryPageState = 'request' | 'pending' | 'completed'

export function StageCPriceInquiryPage({ state: pageState }: { state: PriceInquiryPageState }) {
  const { sku = '' } = useParams()
  const product = useStageCProduct(sku)

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />
  }

  return <PriceInquiryContent pageState={pageState} productName={product.name} productImageUrl={product.imageUrl} sku={sku} />
}

type PriceInquiryContentProps = {
  pageState: PriceInquiryPageState
  productName: string
  productImageUrl: string
  sku: string
}

function PriceInquiryContent({ pageState, productName, productImageUrl, sku }: PriceInquiryContentProps) {
  const navigate = useNavigate()
  const { dispatch, state } = useSession()
  const requestService = usePriceInquiryRequestService()
  const requestStartedRef = useRef(false)
  const exitProduct = useProductExit(sku)
  const purchaseHubPath = stageCPath(STAGE_C_ROUTES.c4, sku)
  const priceRequestPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiry, sku)
  const pendingPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryPending, sku)
  const completedPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryCompleted, sku)
  const fitTryOnPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku)
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

  return (
    <StageCDetailShell>
      <GlassTopBar context="구매 조건" action={<Link className="stage-c-glass-link-button" to={purchaseHubPath}>← 구매 조건</Link>} />
      <section className="stage-c-glass-media-frame stage-c-fit-media" aria-label="제품과 도슨트 안내">
        <DocentStage cue={pageState === 'completed' ? 'greet' : 'idle'} />
        <img alt={productName} src={productImageUrl} />
      </section>
      {pageState === 'request' && (
        <>
          <GlassInfoCard>
            <h1>가격은 직원이 직접 안내해 드려요.</h1>
            <p>가격과 구매 관련 안내를 원하시면 직원에게 요청을 전달할게요.</p>
          </GlassInfoCard>
          <GlassSpeechBubble>원하실 때만 요청해 주세요.</GlassSpeechBubble>
          <GlassBottomActionDock>
            <button onClick={submitRequest} type="button">직원에게 가격 안내 요청하기</button>
            <Link className="stage-c-glass-link-button" to={purchaseHubPath}>구매 조건으로 돌아가기</Link>
          </GlassBottomActionDock>
        </>
      )}
      {pageState === 'pending' && (
        <>
          <GlassInfoCard><h1>직원에게 가격 안내를 요청하고 있어요.</h1><p>잠시 후 요청 전달 상태를 알려드릴게요.</p></GlassInfoCard>
          <GlassBottomActionDock><Link className="stage-c-glass-link-button" to={purchaseHubPath}>다른 정보 보기</Link></GlassBottomActionDock>
        </>
      )}
      {pageState === 'completed' && (
        <>
          <GlassInfoCard><h1>요청이 전달됐어요.</h1><p>직원이 가격과 구매 안내를 도와드릴 예정이에요.</p></GlassInfoCard>
          <GlassBottomActionDock>
            <Link className="stage-c-glass-link-button" to={purchaseHubPath}>다른 정보 보기</Link>
            <Link className="stage-c-glass-link-button stage-c-glass-link-button--accent" to={fitTryOnPath}>착용 및 구매 문의하기</Link>
            <button onClick={exitProduct} type="button">다른 제품 보기 →</button>
          </GlassBottomActionDock>
        </>
      )}
    </StageCDetailShell>
  )
}

function PriceInquiryFallback({ path }: { path: string }) {
  return <StageCDetailShell><GlassInfoCard><h1>가격 안내 요청 정보를 찾을 수 없어요.</h1><p>가격 안내를 원하시면 먼저 요청해 주세요.</p><Link className="stage-c-glass-link-button" to={path}>가격 안내 요청하기</Link></GlassInfoCard></StageCDetailShell>
}
