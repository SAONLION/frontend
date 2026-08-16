import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { PreparedLink } from '../../components/common/PreparedLink'
import { DocentStage } from '../../components/domain/DocentStage'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'
import { ProductImageGallery } from '../../components/domain/ProductImageGallery'
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
  const { state } = useSession()

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (!product) {
    return <FitFallback />
  }

  const selection = getFitSelection(product, new URLSearchParams(location.search), {
    sizeCode: state.selectedSizeCode,
    colorCode: state.selectedColorCode,
  })
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
  const navigate = usePreparedNavigate()
  const navigateSelection = useNavigate()
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
    // 선택을 바꿀 때마다 히스토리가 쌓이면 뒤로가기가 색상·사이즈 이력을 되짚게 된다.
    navigateSelection(fitSearchPath(kind === 'size' ? paths.size : paths.tryOn, { ...selection, size: next }), { replace: true })
  }

  const setColor = (next: ColorOption) => {
    if (next.code === selection.color.code) return
    dispatch({ type: SESSION_ACTIONS.recordColorSwitch, sku, from: selection.color.code, to: next.code })
    navigateSelection(fitSearchPath(kind === 'color' ? paths.color : paths.tryOn, { ...selection, color: next }), { replace: true })
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
    return <FitShell kind={kind} selection={selection} sizeScale={getSizeScale(product, selection)} sku={sku}>
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
    return <FitShell kind={kind} selection={selection} sizeScale={getSizeScale(product, selection)} sku={sku}>
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

function FitShell({ children, kind, selection, sizeScale = 1 }: { children: ReactNode; kind: FitPageKind; selection: FitSelection; sizeScale?: number; sku: string }) {
  const labels: Record<'size' | 'color' | 'try-on', string> = { size: '사이즈 · 용량', color: '컬러', 'try-on': '착장 요청' }
  // 다른 각도 컷도 선택한 색상으로 찍힌 것만 쓴다. 없으면 대표 컷 한 장만 보여준다.
  const images = [selection.color.imageUrl, ...(selection.color.detailImages ?? [])]

  return <StageCDetailShell className={`stage-c-fit-reference-shell stage-c-fit-reference-shell--${kind}`}>
    <div className="stage-c-fit-reference-pill">{labels[kind as 'size' | 'color' | 'try-on']}</div>
    <section className={`stage-c-fit-reference-media${images.length > 1 ? ' stage-c-fit-reference-media--gallery' : ''}`}>
      <ProductImageGallery
        alt={`${selection.color.label} 컬러 대표 이미지`}
        images={images}
        imageStyle={{ '--stage-c-primary-cutout-scale': sizeScale } as CSSProperties}
      />
    </section>
    {children}
  </StageCDetailShell>
}

// 사이즈별 실사 이미지가 없어 선택한 사이즈를 대표 컷의 배율로 표현한다.
// 가장 큰 사이즈가 100%이고 한 단계 내려갈 때마다 SIZE_SCALE_STEP만큼 줄어든다.
const SIZE_SCALE_STEP = 0.12

function getSizeScale(product: Product, selection: FitSelection): number {
  const options = product.sizeOptions?.slice(0, 3) ?? []
  if (options.length < 2) return 1
  const selectedIndex = options.findIndex((option) => option.code === selection.size.code)
  if (selectedIndex < 0) return 1
  return 1 - (options.length - 1 - selectedIndex) * SIZE_SCALE_STEP
}

function SizeOptions({ label, onSelect, product, selection }: { label?: string; onSelect: (option: SizeOption) => void; product: Product; selection: FitSelection }) {
  const referenceLabels: Record<string, string> = { MNI: '스몰', SML: '미디엄', SMD: '라지' }
  const options = product.sizeOptions?.slice(0, 3) ?? []
  const selectedIndex = Math.max(0, options.findIndex((option) => option.code === selection.size.code))

  return <section className="stage-c-fit-reference-options">
    {label && <h2>{label}</h2>}
    <div
      aria-label="사이즈 선택"
      className="stage-c-fit-size-selector"
      role="group"
      style={{ '--stage-c-fit-size-count': options.length } as CSSProperties}
    >
      {/* 선택 표시는 옵션 수만큼 균등 분할한다. 사이즈가 2개뿐인 제품에서도 폭과 위치가 맞아야 한다. */}
      <span aria-hidden="true" className={`stage-c-fit-size-selector__indicator stage-c-fit-size-selector__indicator--${selectedIndex}`} />
      {options.map((option) => (
        <button aria-pressed={option.code === selection.size.code} key={option.code} onClick={() => onSelect(option)} type="button">
          {referenceLabels[option.code] ?? option.label}
        </button>
      ))}
    </div>
  </section>
}

// 한국어 라벨이 정해진 색만 옮겨 쓰고, 새로 들어오는 색은 데이터의 label을 그대로 보여준다.
const COLOR_LABELS: Record<string, string> = {
  cognac: '코냑',
  black: '블랙',
  white: '화이트',
  beige: '베이지',
  'soft-pink': '소프트 핑크',
  cinnamon: '시나몬',
}

function ColorOptions({ label, onSelect, product, selection }: { label?: string; onSelect: (option: ColorOption) => void; product: Product; selection: FitSelection }) {
  const referenceColors = product.colorOptions ?? []

  return <section className="stage-c-fit-reference-options stage-c-fit-reference-options--color">
    {label && <h2>{label}</h2>}
    <div
      aria-label="컬러 선택"
      className="stage-c-fit-color-selector"
      role="group"
      style={{ '--stage-c-fit-color-count': referenceColors.length } as CSSProperties}
    >
      {referenceColors.map((option) => (
        <button
          aria-pressed={option.code === selection.color.code}
          key={option.code}
          onClick={() => onSelect(option)}
          style={{ '--stage-c-selected-swatch': option.swatch } as CSSProperties}
          type="button"
        >
          <i aria-hidden="true" style={{ backgroundColor: option.swatch }} />
          <span>{COLOR_LABELS[option.code] ?? option.label}</span>
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
      {isActionVisible && <div className="stage-c-fit-status-actions"><PreparedLink className="stage-c-action-button stage-c-action-button--primary" to={STAGE_A_ROUTES.intro}>메인으로</PreparedLink></div>}
    </StageCDetailShell>
  )
}
