import { useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { DocentStage } from '../../components/domain/DocentStage'
import {
  GlassBottomActionDock,
  GlassChoiceChip,
  GlassInfoCard,
  GlassSegmentedControl,
  GlassTopBar,
  StageCDetailShell,
} from '../../components/domain/StageCDetailShell'
import { SelectionSummary } from '../../components/domain/SelectionSummary'
import { EVENT_NAMES, type SessionEvent } from '../../constants/events'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { useTryOnRequestService } from '../../features/try-on/useTryOnRequestService'
import type { ColorOption, Product, SizeOption } from '../../types/product'
import { StageCState } from './StageCHubPage'
import { fitSearchPath, getFitSelection, type FitSelection } from './stageCFitSelection'

type FitPageKind = 'size' | 'color' | 'try-on' | 'pending' | 'completed' | 'purchase-completed'

const FIT_REQUEST_TRANSITION_DELAY_MS = 2_000

export function StageCFitPage({ kind }: { kind: FitPageKind }) {
  const { sku = '' } = useParams()
  const location = useLocation()
  const product = useStageCProduct(sku)
  const fitHubPath = stageCPath(STAGE_C_ROUTES.c3, sku)

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (!product) {
    return <FitFallback path={fitHubPath} text="태그한 상품의 주소를 다시 확인해 주세요." />
  }

  const selection = getFitSelection(product, new URLSearchParams(location.search))
  if (!selection) {
    return <FitFallback path={fitHubPath} text="선택할 수 있는 기본 옵션을 찾을 수 없어요." />
  }

  return <StageCFitContent kind={kind} product={product} selection={selection} sku={sku} />
}

type StageCFitContentProps = {
  kind: FitPageKind
  product: Product
  selection: FitSelection
  sku: string
}

function StageCFitContent({ kind, product, selection, sku }: StageCFitContentProps) {
  const navigate = useNavigate()
  const { dispatch, state } = useSession()
  const tryOnRequestService = useTryOnRequestService()
  const exitProduct = useProductExit(sku)
  const requestRef = useRef<{ key: string; completion: Promise<'completed'> } | null>(null)
  const paths = getFitPaths(sku)
  const hasTryOnRequest = hasMatchingTryOnRequest(state.events, sku, selection)
  const hasPurchaseInquiryAfterTryOn = hasPurchaseAfterMatchingTryOn(state.events, sku, selection)

  useEffect(() => {
    let active = true

    if (kind !== 'pending' || !hasTryOnRequest) {
      return () => { active = false }
    }

    const key = `${sku}:${selection.size.code}:${selection.color.code}`
    const previousRequest = requestRef.current
    const request = previousRequest?.key === key
      ? previousRequest
      : {
          key,
          completion: tryOnRequestService.requestTryOn({
            sku,
            size: selection.size.code,
            color: selection.color.code,
          }),
        }

    requestRef.current = request
    const minimumDisplayTime = new Promise<void>((resolve) => {
      window.setTimeout(resolve, FIT_REQUEST_TRANSITION_DELAY_MS)
    })

    void Promise.all([request.completion, minimumDisplayTime]).then(() => {
      if (active) {
        navigate(fitSearchPath(paths.completed, selection), { replace: true })
      }
    })

    return () => { active = false }
  }, [hasTryOnRequest, kind, navigate, paths.completed, selection, sku, tryOnRequestService])

  const setSize = (next: SizeOption) => {
    if (next.code === selection.size.code) return
    dispatch({ type: SESSION_ACTIONS.recordSizeCheck, sku, size: next.code })
    navigate(fitSearchPath(kind === 'size' ? paths.size : paths.tryOn, { ...selection, size: next }))
  }

  const setColor = (next: ColorOption) => {
    if (next.code === selection.color.code) return
    dispatch({ type: SESSION_ACTIONS.recordColorSwitch, sku, from: selection.color.code, to: next.code })
    navigate(fitSearchPath(kind === 'color' ? paths.color : paths.tryOn, { ...selection, color: next }))
  }

  const confirmSize = () => {
    const alreadyChecked = state.events.some(
      (event) => event.name === EVENT_NAMES.sizeCheck && event.sku === sku && event.size === selection.size.code,
    )
    if (!alreadyChecked) {
      dispatch({ type: SESSION_ACTIONS.recordSizeCheck, sku, size: selection.size.code })
    }
    navigate(fitSearchPath(paths.tryOn, selection))
  }

  const requestTryOn = () => {
    if (!hasTryOnRequest) {
      dispatch({ type: SESSION_ACTIONS.recordTryonRequest, sku, size: selection.size.code, color: selection.color.code })
    }
    navigate(fitSearchPath(paths.pending, selection))
  }

  const requestPurchase = () => {
    if (!hasPurchaseInquiryAfterTryOn) {
      dispatch({ type: SESSION_ACTIONS.recordPurchaseInquiry, sku })
    }
    navigate(fitSearchPath(paths.purchaseCompleted, selection))
  }

  if ((kind === 'pending' || kind === 'completed') && !hasTryOnRequest) {
    return <FitFallback path={fitSearchPath(paths.tryOn, selection)} text="착장 요청 정보를 찾을 수 없어요." />
  }

  if (kind === 'purchase-completed' && !hasPurchaseInquiryAfterTryOn) {
    return <FitFallback path={fitSearchPath(paths.tryOn, selection)} text="이번 착장 요청의 구매 문의 정보를 찾을 수 없어요." />
  }

  if (kind === 'size') {
    return <FitShell kind={kind} selection={selection} sku={sku}>
      <SizeCard onSelect={setSize} product={product} selection={selection} />
      <GlassBottomActionDock>
        <button onClick={confirmSize} type="button">선택 확인하기</button>
        <button onClick={exitProduct} type="button">다른 제품 보기 →</button>
      </GlassBottomActionDock>
    </FitShell>
  }

  if (kind === 'color') {
    return <FitShell kind={kind} selection={selection} sku={sku}>
      <ColorCard onSelect={setColor} product={product} selection={selection} />
      <GlassBottomActionDock>
        <Link className="stage-c-glass-link-button stage-c-glass-link-button--accent" to={fitSearchPath(paths.tryOn, selection)}>선택 확인하기</Link>
        <button onClick={exitProduct} type="button">다른 제품 보기 →</button>
      </GlassBottomActionDock>
    </FitShell>
  }

  if (kind === 'try-on') {
    return <FitShell kind={kind} selection={selection} sku={sku}>
      <SelectionSummary {...getSummaryProps(selection)} />
      <SizeCard compact onSelect={setSize} product={product} selection={selection} />
      <ColorCard compact onSelect={setColor} product={product} selection={selection} />
      <GlassInfoCard>
        <h1>착장 정보를 직원에게 전달할까요?</h1>
        <p>선택한 옵션을 바탕으로 직원이 제품 준비를 도와드릴게요.</p>
      </GlassInfoCard>
      <GlassBottomActionDock>
        <button onClick={requestTryOn} type="button">착장 요청하기</button>
      </GlassBottomActionDock>
    </FitShell>
  }

  if (kind === 'pending') {
    return <FitStatusScreen status="pending" />
  }

  if (kind === 'completed') {
    return <FitStatusScreen onExitProduct={exitProduct} onPurchaseInquiry={requestPurchase} status="completed" />
  }

  return <FitStatusScreen onExitProduct={exitProduct} status="purchase-completed" />
}

type FitStatus = 'pending' | 'completed' | 'purchase-completed'

function FitStatusScreen({
  onExitProduct,
  onPurchaseInquiry,
  status,
}: {
  onExitProduct?: () => void
  onPurchaseInquiry?: () => void
  status: FitStatus
}) {
  const content = {
    pending: { title: '직원이 제품을 준비해서\n가는 중이에요!' },
    completed: { title: '직원에게 충분한 정보를 전달했어요!', description: '착샷 촬영도 요청해보세요.' },
    'purchase-completed': { title: '직원에게 구매 안내 요청을 보냈어요!', description: '가격과 관련 정보들을 곧 안내해 드릴게요!' },
  }[status]

  return (
    <StageCDetailShell className="stage-c-fit-status-shell">
      <div className="stage-c-fit-status-content">
        <section aria-label="나이비스 AI 도슨트" className="stage-c-fit-status-docent"><DocentStage cue="idle" /></section>
        <h1 className={status === 'pending' ? undefined : 'stage-c-fit-status-title--single-line'}>{content.title}</h1>
        {content.description && <p>{content.description}</p>}
      </div>
      {status === 'completed' && onPurchaseInquiry && onExitProduct && (
        <div className="stage-c-fit-status-actions">
          <button className="stage-c-action-button stage-c-action-button--primary" onClick={onPurchaseInquiry} type="button">구매 문의</button>
          <button className="stage-c-action-button" onClick={onExitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
        </div>
      )}
      {status === 'purchase-completed' && onExitProduct && (
        <div className="stage-c-fit-status-actions">
          <button className="stage-c-action-button" onClick={onExitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
        </div>
      )}
    </StageCDetailShell>
  )
}

function FitShell({ children, kind, selection, sku }: { children: ReactNode; kind: FitPageKind; selection: FitSelection; sku: string }) {
  const fitHubPath = stageCPath(STAGE_C_ROUTES.c3, sku)
  const cue = kind === 'completed' || kind === 'purchase-completed' ? 'greet' : 'idle'

  return <StageCDetailShell>
    <GlassTopBar context="핏 · 취향" action={<Link className="stage-c-glass-link-button" to={fitHubPath}>← 핏 · 취향</Link>} />
    <section className="stage-c-glass-media-frame stage-c-fit-media">
      <DocentStage cue={cue} />
      <img alt={`${selection.color.label} 컬러 대표 이미지`} src={selection.color.imageUrl} />
    </section>
    {children}
  </StageCDetailShell>
}

function SizeCard({ compact = false, onSelect, product, selection }: { compact?: boolean; onSelect: (option: SizeOption) => void; product: Product; selection: FitSelection }) {
  return <GlassInfoCard>
    <h1>{compact ? '사이즈' : '사이즈를 살펴보세요'}</h1>
    {!compact && <p>치수와 확인된 제품 특징을 비교할 수 있어요.</p>}
    <GlassSegmentedControl label="사이즈 선택">
      {product.sizeOptions?.map((option) => <GlassChoiceChip key={option.code} label={option.label} onClick={() => onSelect(option)} selected={option.code === selection.size.code} />)}
    </GlassSegmentedControl>
    {!compact && <dl className="stage-c-fit-facts"><div><dt>치수</dt><dd>{selection.size.dimensions}</dd></div><div><dt>스트랩</dt><dd>{product.fitDetail?.strap}</dd></div><div><dt>수납</dt><dd>{product.fitDetail?.storage}</dd></div></dl>}
  </GlassInfoCard>
}

function ColorCard({ compact = false, onSelect, product, selection }: { compact?: boolean; onSelect: (option: ColorOption) => void; product: Product; selection: FitSelection }) {
  return <GlassInfoCard>
    <h1>{compact ? '컬러' : '컬러를 선택하세요'}</h1>
    {!compact && <p>선택한 컬러의 대표 이미지를 보여드려요.</p>}
    <GlassSegmentedControl label="컬러 선택">
      {product.colorOptions?.map((option) => <GlassChoiceChip key={option.code} label={option.label} onClick={() => onSelect(option)} selected={option.code === selection.color.code} swatch={option.swatch} />)}
    </GlassSegmentedControl>
  </GlassInfoCard>
}

function getFitPaths(sku: string) {
  return {
    size: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitSize, sku),
    color: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitColor, sku),
    tryOn: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku),
    pending: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnPending, sku),
    completed: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnCompleted, sku),
    purchaseCompleted: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitPurchaseInquiryCompleted, sku),
  }
}

function getSummaryProps(selection: FitSelection) {
  return { productName: selection.size.productName, sizeLabel: selection.size.label, colorLabel: selection.color.label, dimensions: selection.size.dimensions, imageUrl: selection.color.imageUrl }
}

function hasMatchingTryOnRequest(events: readonly SessionEvent[], sku: string, selection: FitSelection): boolean {
  return events.some((event) => event.name === EVENT_NAMES.tryonRequest && event.sku === sku && event.size === selection.size.code && event.color === selection.color.code)
}

function hasPurchaseAfterMatchingTryOn(events: readonly SessionEvent[], sku: string, selection: FitSelection): boolean {
  const tryOnIndex = events.map((event, index) => ({ event, index })).findLast(({ event }) => event.name === EVENT_NAMES.tryonRequest && event.sku === sku && event.size === selection.size.code && event.color === selection.color.code)?.index
  return tryOnIndex !== undefined && events.slice(tryOnIndex + 1).some((event) => event.name === EVENT_NAMES.purchaseInquiry && event.sku === sku)
}

function FitFallback({ path, text }: { path: string; text: string }) {
  return <StageCDetailShell><GlassInfoCard><h1>이전 선택을 찾을 수 없어요.</h1><p>{text}</p><Link className="stage-c-glass-link-button" to={path}>핏 · 취향으로 돌아가기</Link></GlassInfoCard></StageCDetailShell>
}
