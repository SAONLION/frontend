import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { DocentStage } from '../../components/domain/DocentStage'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'
import { StageCDetailShell } from '../../components/domain/StageCDetailShell'
import { STAGE_A_ROUTES } from '../../constants/appRoutes'
import { EVENT_NAMES, type SessionEvent } from '../../constants/events'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, stageCPath } from '../../constants/stageC'
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

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (!product) {
    return <FitFallback />
  }

  const selection = getFitSelection(product, new URLSearchParams(location.search))
  if (!selection) {
    return <FitFallback />
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
  const hasPurchaseInquiry = state.events.some(
    (event) => event.name === EVENT_NAMES.purchaseInquiry && event.sku === sku,
  )

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
    if (!hasPurchaseInquiry) {
      dispatch({ type: SESSION_ACTIONS.recordPurchaseInquiry, sku })
    }
    navigate(fitSearchPath(paths.purchaseCompleted, selection))
  }

  if ((kind === 'pending' || kind === 'completed') && !hasTryOnRequest) {
    return <FitFallback />
  }

  if (kind === 'purchase-completed' && !hasPurchaseInquiry) {
    return <FitFallback />
  }

  if (kind === 'size') {
    return <FitShell kind={kind} selection={selection} sku={sku}>
      <SizeOptions onSelect={setSize} product={product} selection={selection} />
      <dl className="stage-c-fit-reference-facts">
        <div><dt>선택 사이즈</dt><dd>{selection.size.label}</dd></div>
        <div><dt>제품 치수</dt><dd>{selection.size.dimensions}</dd></div>
        <div><dt>수납 구성</dt><dd>{product.fitDetail?.storage ?? '정확한 수납 안내는 직원에게 문의해 주세요.'}</dd></div>
        <div><dt>스트랩</dt><dd>{product.fitDetail?.strap ?? '제품 상태에 따라 직원이 안내해 드려요.'}</dd></div>
      </dl>
      <FitActionRow onExitProduct={exitProduct} onPrimaryAction={confirmSize} />
    </FitShell>
  }

  if (kind === 'color') {
    return <FitShell kind={kind} selection={selection} sku={sku}>
      <ColorOptions onSelect={setColor} product={product} selection={selection} />
      <FitActionRow onExitProduct={exitProduct} onPrimaryAction={() => navigate(fitSearchPath(paths.tryOn, selection))} />
    </FitShell>
  }

  if (kind === 'try-on') {
    return <FitShell kind={kind} selection={selection} sku={sku}>
      <div className="stage-c-fit-try-on-options">
        <SizeOptions label="사이즈" onSelect={setSize} product={product} selection={selection} />
        <ColorOptions label="컬러" onSelect={setColor} product={product} selection={selection} />
      </div>
      <button className="stage-c-fit-proceed-button" onClick={requestTryOn} type="button">위 제품으로 진행 <span aria-hidden="true">→</span></button>
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
  const [revealedStatus, setRevealedStatus] = useState<FitStatus | null>(null)
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)
  const content = {
    pending: { title: '직원이 제품을 준비해서\n가는 중이에요!' },
    completed: { title: '직원에게 충분한 정보를 전달했어요!', description: '착샷 촬영도 요청해보세요.' },
    'purchase-completed': { title: '직원에게 구매 안내 요청을 보냈어요!', description: '가격과 관련 정보들을 곧 안내해 드릴게요!' },
  }[status]

  return (
    <StageCDetailShell className="stage-c-fit-status-shell">
      <div className="stage-c-fit-status-content">
        <section aria-label="나이비스 AI 도슨트" className="stage-c-fit-status-docent"><DocentStage continuityKey="fit-status" cue={status === 'pending' ? 'waiting' : 'success'} /></section>
        <h1 className={status === 'pending' ? 'stage-c-fit-status-title--pending' : 'stage-c-fit-status-title--single-line'}><KineticTextReveal autoPlay blur className="justify-center" distance={16} onRevealComplete={() => { setIsDescriptionVisible(true); setRevealedStatus(status) }} splitBy="characters" stagger={0.035} text={content.title} waitForDocent /></h1>
        {content.description && isDescriptionVisible && <p><KineticTextReveal autoPlay blur={false} className="justify-center" distance={8} splitBy="words" stagger={0.1} text={content.description} waitForDocent /></p>}
      </div>
      {revealedStatus === status && status === 'completed' && onPurchaseInquiry && onExitProduct && (
        <div className="stage-c-fit-status-actions">
          <button className="stage-c-action-button stage-c-action-button--primary" onClick={onPurchaseInquiry} type="button">구매 문의</button>
          <button className="stage-c-action-button" onClick={onExitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
        </div>
      )}
      {revealedStatus === status && status === 'purchase-completed' && onExitProduct && (
        <div className="stage-c-fit-status-actions">
          <button className="stage-c-action-button" onClick={onExitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
        </div>
      )}
    </StageCDetailShell>
  )
}

function FitShell({ children, kind, selection }: { children: ReactNode; kind: FitPageKind; selection: FitSelection; sku: string }) {
  const labels: Record<'size' | 'color' | 'try-on', string> = { size: '사이즈 · 용량', color: '컬러', 'try-on': '착장 요청' }

  return <StageCDetailShell className={`stage-c-fit-reference-shell stage-c-fit-reference-shell--${kind}`}>
    <div className="stage-c-fit-reference-pill">{labels[kind as 'size' | 'color' | 'try-on']}</div>
    <section className="stage-c-fit-reference-media">
      <img alt={`${selection.color.label} 컬러 대표 이미지`} className="stage-c-primary-cutout" src={selection.color.imageUrl} />
    </section>
    {children}
  </StageCDetailShell>
}

function SizeOptions({ label, onSelect, product, selection }: { label?: string; onSelect: (option: SizeOption) => void; product: Product; selection: FitSelection }) {
  const referenceLabels: Record<string, string> = { MNI: '스몰', SML: '미디엄', SMD: '라지' }
  const options = product.sizeOptions?.slice(0, 3) ?? []
  const selectedIndex = Math.max(0, options.findIndex((option) => option.code === selection.size.code))

  return <section className="stage-c-fit-reference-options">
    {label && <h2>{label}</h2>}
    <div aria-label="사이즈 선택" className="stage-c-fit-size-selector" role="group">
      <span aria-hidden="true" className={`stage-c-fit-size-selector__indicator stage-c-fit-size-selector__indicator--${selectedIndex}`} />
      {options.map((option) => (
        <button aria-pressed={option.code === selection.size.code} key={option.code} onClick={() => onSelect(option)} type="button">
          {referenceLabels[option.code] ?? option.label}
        </button>
      ))}
    </div>
  </section>
}

function ColorOptions({ label, onSelect, product, selection }: { label?: string; onSelect: (option: ColorOption) => void; product: Product; selection: FitSelection }) {
  const referenceColors = product.colorOptions?.filter((option) => ['cognac', 'black', 'white'].includes(option.code)) ?? []
  const referenceLabels: Record<string, string> = { cognac: '코냑', black: '블랙', white: '화이트' }

  return <section className="stage-c-fit-reference-options stage-c-fit-reference-options--color">
    {label && <h2>{label}</h2>}
    <div aria-label="컬러 선택" className="stage-c-fit-color-selector" role="group">
      {referenceColors.map((option) => (
        <button aria-pressed={option.code === selection.color.code} key={option.code} onClick={() => onSelect(option)} type="button">
          <i aria-hidden="true" style={{ backgroundColor: option.swatch }} />
          <span>{referenceLabels[option.code] ?? option.label}</span>
        </button>
      ))}
    </div>
  </section>
}

function FitActionRow({ onExitProduct, onPrimaryAction }: { onExitProduct: () => void; onPrimaryAction: () => void }) {
  return <div className="stage-c-fit-reference-actions">
    <button className="stage-c-action-button stage-c-action-button--primary" onClick={onPrimaryAction} type="button">착용 및 구매 문의</button>
    <button className="stage-c-action-button" onClick={onExitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
  </div>
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

function hasMatchingTryOnRequest(events: readonly SessionEvent[], sku: string, selection: FitSelection): boolean {
  return events.some((event) => event.name === EVENT_NAMES.tryonRequest && event.sku === sku && event.size === selection.size.code && event.color === selection.color.code)
}

function FitFallback() {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)
  const [isActionVisible, setIsActionVisible] = useState(false)

  return (
    <StageCDetailShell className="stage-c-fit-status-shell stage-c-fit-error-shell">
      <div className="stage-c-fit-status-content">
        <section aria-label="나이비스 AI 도슨트" className="stage-c-fit-status-docent"><DocentStage cue="apologize" /></section>
        <h1><KineticTextReveal autoPlay blur className="justify-center" distance={16} onRevealComplete={() => setIsDescriptionVisible(true)} splitBy="characters" stagger={0.035} text="오류가 발생했어요" waitForDocent /></h1>
        {isDescriptionVisible && <p><KineticTextReveal autoPlay blur={false} className="justify-center" distance={8} onRevealComplete={() => setIsActionVisible(true)} splitBy="words" stagger={0.1} text="이전 선택을 찾을 수 없어요" waitForDocent /></p>}
      </div>
      {isActionVisible && <div className="stage-c-fit-status-actions"><Link className="stage-c-action-button stage-c-action-button--primary" to={STAGE_A_ROUTES.intro}>메인으로</Link></div>}
    </StageCDetailShell>
  )
}
