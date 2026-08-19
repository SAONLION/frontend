import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { PreparedLink } from '../../components/common/PreparedLink'
import { DocentStage } from '../../components/domain/DocentStage'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'
import { ProductCoverflow } from '../../components/domain/ProductCoverflow'
import { StageCDetailShell } from '../../components/domain/StageCDetailShell'
import { STAGE_A_ROUTES } from '../../constants/appRoutes'
import { getKoreanColorLabel } from '../../constants/colorLabels'
import { EVENT_NAMES, type SessionEvent } from '../../constants/events'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, stageCPath } from '../../constants/stageC'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { createPurchaseInquiry } from '../../api/purchaseInquiries'
import { clearDegraded, DEGRADATION_KEYS, markDegraded } from '../../features/degradation/degradationStore'
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
            sessionId: state.sessionId,
            skuId: state.currentSkuId,
          }),
        }

    requestRef.current = request
    const minimumDisplayTime = new Promise<void>((resolve) => {
      window.setTimeout(resolve, FIT_REQUEST_TRANSITION_DELAY_MS)
    })

    void Promise.all([request.completion, minimumDisplayTime]).then(() => {
      clearDegraded(DEGRADATION_KEYS.tryOn)
      if (active) {
        navigate(fitSearchPath(paths.completed, selection), { replace: true })
      }
    }).catch((error: unknown) => {
      console.error('착장 요청에 실패했습니다.', error)
      // 요청이 서버에 남지 않았으므로 완료 화면으로 넘기되 전달 실패를 알린다.
      markDegraded(DEGRADATION_KEYS.tryOn)
      requestRef.current = null
      if (active) {
        navigate(fitSearchPath(paths.completed, selection), { replace: true })
      }
    })

    return () => { active = false }
  }, [hasTryOnRequest, kind, navigate, paths.completed, selection, sku, state.currentSkuId, state.sessionId, tryOnRequestService])

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

      // 구매 의사를 명시적으로 표현하는 이벤트라 서버 기록이 누락되면 안 된다.
      if (state.sessionId && state.currentSkuId !== null) {
        void createPurchaseInquiry(state.sessionId, state.currentSkuId)
          .then(() => clearDegraded(DEGRADATION_KEYS.purchaseInquiry))
          .catch((error: unknown) => {
            console.error('구매 문의 기록에 실패했습니다.', error)
            markDegraded(DEGRADATION_KEYS.purchaseInquiry)
          })
      } else {
        markDegraded(DEGRADATION_KEYS.purchaseInquiry)
      }
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
      <FactList rows={getFitFacts(product, selection)} />
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
      <ProductCoverflow
        alt={`${selection.color.label} 컬러 대표 이미지`}
        images={images}
        imageClassName="stage-c-primary-cutout"
        imageStyle={{ '--stage-c-primary-cutout-scale': sizeScale } as CSSProperties}
        label={`${selection.color.label} 컬러 이미지`}
        variant="product"
      />
    </section>
    {children}
  </StageCDetailShell>
}

// 사이즈별 실사 이미지가 없어 선택한 사이즈를 대표 컷의 배율로 표현한다.
// 가장 큰 사이즈가 100%, 가장 작은 사이즈가 SIZE_SCALE_MIN이고 그 사이를 균등 분배하므로
// 사이즈가 2개든 5개든 배율 폭은 같다.
const SIZE_SCALE_MIN = 0.72

function getSizeScale(product: Product, selection: FitSelection): number {
  const options = product.sizeOptions ?? []
  if (options.length < 2) return 1
  const selectedIndex = options.findIndex((option) => option.code === selection.size.code)
  if (selectedIndex < 0) return 1
  return SIZE_SCALE_MIN + (1 - SIZE_SCALE_MIN) * (selectedIndex / (options.length - 1))
}

type Fact = { label: string; value: string }

/**
 * 카탈로그에 실제로 있는 값만 줄로 만든다(가방·트래블 기준 치수·제조국 100%, 수납 80%, 스트랩 85%).
 * 없는 항목은 문구로 때우지 않고 줄 자체를 감춘다.
 */
function getFitFacts(product: Product, selection: FitSelection): readonly Fact[] {
  return [
    // 사이즈 이름은 바로 위 선택 버튼에 이미 있으므로 여기서는 치수만 보여준다.
    { label: '제품 치수', value: selection.size.dimensions },
    { label: '수납 구성', value: product.fitDetail?.storage },
    { label: '스트랩 · 핸들', value: product.fitDetail?.strap },
    { label: '제조국', value: product.origin },
  ].filter((row): row is Fact => Boolean(row.value))
}

function FactList({ rows }: { rows: readonly Fact[] }) {
  if (rows.length === 0) return null

  return <dl className="stage-c-fit-reference-facts">
    {rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
  </dl>
}

function SizeOptions({ label, onSelect, product, selection }: { label?: string; onSelect: (option: SizeOption) => void; product: Product; selection: FitSelection }) {
  // 라벨은 제품 데이터를 그대로 쓴다. MCM의 사이즈 이름은 제품마다 달라서(미니·S·S–M, 41cm·45cm,
  // 스몰·캐빈…) 스몰/미디엄/라지로 고정하면 실제 제품과 어긋난다. 개수도 제품마다 다르므로 제한하지 않는다.
  const options = product.sizeOptions ?? []
  const selectedIndex = Math.max(0, options.findIndex((option) => option.code === selection.size.code))

  return <section className="stage-c-fit-reference-options">
    {label && <h2>{label}</h2>}
    <div
      aria-label="사이즈 선택"
      className="stage-c-fit-size-selector"
      role="group"
      style={{
        '--stage-c-fit-size-count': options.length,
        '--stage-c-fit-size-index': selectedIndex,
      } as CSSProperties}
    >
      {/* 선택 표시는 옵션 수만큼 균등 분할하고 선택 인덱스만큼 옆으로 민다. 개수 제한이 없다. */}
      <span aria-hidden="true" className="stage-c-fit-size-selector__indicator" />
      {options.map((option) => (
        <button aria-pressed={option.code === selection.size.code} key={option.code} onClick={() => onSelect(option)} type="button">
          {option.label}
        </button>
      ))}
    </div>
  </section>
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
          type="button"
        >
          {/* 칩은 단색이 아니라 그 색상으로 찍힌 실제 제품 사진이다.
              색상은 40가지인데 hex 원본이 없어 단색으로는 34가지가 틀린 색으로 칠해진다.
              사진을 쓰면 매핑이 필요 없고 `Beige + Black`·`Multi` 같은 복합 색도 그대로 맞는다. */}
          <i aria-hidden="true" style={{ backgroundColor: option.swatch }}>
            <img alt="" decoding="async" loading="lazy" src={option.imageUrl} />
          </i>
          <span>{getKoreanColorLabel(option.label)}</span>
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
    <StageCDetailShell className="stage-c-fit-status-shell stage-c-fit-error-shell stage-c-fallback-screen">
      <div className="stage-c-fit-status-content">
        <section aria-label="나이비스 AI 도슨트" className="stage-c-fit-status-docent"><DocentStage cue="apologize" /></section>
        <h1><KineticTextReveal autoPlay blur className="justify-center" distance={16} onRevealComplete={() => setIsDescriptionVisible(true)} splitBy="characters" stagger={0.035} text="오류가 발생했어요" waitForDocent /></h1>
        {isDescriptionVisible && <p><KineticTextReveal autoPlay blur={false} className="justify-center" distance={8} onRevealComplete={() => setIsActionVisible(true)} splitBy="words" stagger={0.1} text="이전 선택을 찾을 수 없어요" waitForDocent /></p>}
      </div>
      {isActionVisible && <div className="stage-c-fit-status-actions"><PreparedLink className="stage-c-action-button stage-c-action-button--primary" to={STAGE_A_ROUTES.intro}>메인으로</PreparedLink></div>}
    </StageCDetailShell>
  )
}
