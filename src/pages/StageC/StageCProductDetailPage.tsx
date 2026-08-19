import { useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router'
import stylingLifestyleImage from '../../assets/images/product-styling-lifestyle.webp'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { PreparedLink } from '../../components/common/PreparedLink'
import { ProductCoverflow } from '../../components/domain/ProductCoverflow'
import { GlassInfoCard, StageCDetailShell } from '../../components/domain/StageCDetailShell'
import {
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_ROUTES,
  stageCPath,
} from '../../constants/stageC'
import { useProductExit } from '../../features/product-explore/useProductExit'
import type { Product } from '../../types/product'
import { useSelectedProductImages } from '../../features/product-explore/useSelectedProductImages'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { StageCState } from './StageCHubPage'
import { StageFDevFlowOverlay, type StageFDevScenario } from '../StageF/StageFDevFlowOverlay'
import { BRAND_HERITAGE_LINES } from '../../constants/brandHeritage'

// `LOOK 1 — …` 형태의 줄은 앞머리를 굵게 보여준다. 시안과 같은 강조 방식이다.
function renderSummaryLine(line: string) {
  const look = /^(LOOK\s*\d+)(\s*[—-].*)$/.exec(line)
  if (!look) return line

  return <><strong className="stage-c-product-detail-summary__look">{look[1]}</strong>{look[2]}</>
}

type MaterialFact = { label: string; value: string }

function getMaterialFacts(product: Product): readonly MaterialFact[] {
  return [
    { label: '소재', value: product.materialDetail?.material },
    { label: '하드웨어', value: product.materialDetail?.hardware },
    { label: '안감', value: product.materialDetail?.lining },
    { label: '제조국', value: product.origin },
    { label: '지속가능성', value: product.materialDetail?.sustainability },
  ].filter((fact): fact is MaterialFact => Boolean(fact.value))
}

// 훅 순서를 지키기 위한 자리표시자. 로딩·실패 시에도 useSelectedProductImages를 호출한다.
const EMPTY_PRODUCT = { sku: '', name: '', imageUrl: '', dimensions: '' }

type Topic = 'craft' | 'heritage' | 'styling'

const topicTitles: Record<Topic, string> = {
  craft: '소재 · 마감',
  heritage: '헤리티지 · 브랜드 스토리',
  styling: '스타일링 · 코디',
}

type StageCProductDetailPageProps = {
  topic: Topic
}

export function StageCProductDetailPage({ topic }: StageCProductDetailPageProps) {
  const { sku = '' } = useParams()
  const location = useLocation()
  const product = useStageCProduct(sku)
  const { dispatch } = useSession()
  const selectedImages = useSelectedProductImages(product ?? EMPTY_PRODUCT)
  const navigate = usePreparedNavigate()
  const exitProduct = useProductExit(sku)
  const viewed = useRef(false)
  const devScenario = import.meta.env.DEV && isStageFDevScenario(location.state)
    ? location.state.stageFDevScenario
    : null

  useEffect(() => {
    if (product && !viewed.current) {
      viewed.current = true
      dispatch({ type: SESSION_ACTIONS.recordTabView, topic, sku })
    }
  }, [dispatch, product, sku, topic])

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  const productHubPath = stageCPath(STAGE_C_ROUTES.c2, sku)

  if (!product) {
    return (
      <StageCDetailShell className="stage-c-fallback-screen">
        <GlassInfoCard>
          <h1>상품을 찾을 수 없어요</h1>
          <p>태그한 상품의 주소를 다시 확인해 주세요.</p>
          <PreparedLink to={productHubPath}>제품 이해로 돌아가기</PreparedLink>
        </GlassInfoCard>
      </StageCDetailShell>
    )
  }

  // C2-3은 모델 착장샷만 크게 보여준다. 나머지 제품 컷은 대표 컷과 함께 이미지 갤러리로 옮겼다.
  const images = topic === 'styling'
    ? product.stylingImages ?? [stylingLifestyleImage]
    : [selectedImages.imageUrl, ...selectedImages.detailImages]
  // C2-1은 카탈로그에 실제로 있는 항목만 `라벨 : 값`으로 보여준다(가방 기준 하드웨어 97% · 안감 94% ·
  // 소재 90% · 제조국 100%). 없는 항목은 문구로 때우지 않고 줄을 감춘다.
  const materialFacts = topic === 'craft' ? getMaterialFacts(product) : []
  const topicLines = product.productDetail?.[topic] ?? []
  // 룩 설명은 카탈로그에 없다. 문구가 채워지기 전까지 착장컷 수만큼 자리만 만들어 둔다 —
  // 개수가 이미지와 어긋나면 어떤 컷을 가리키는지 알 수 없기 때문이다.
  // 헤리티지는 브랜드 서사가 먼저고 제품 이야기가 뒤따른다. 브랜드 문구는 제품과 무관하게 같다.
  const lines = topic === 'heritage'
    ? [...BRAND_HERITAGE_LINES, ...topicLines]
    : topic === 'styling' && topicLines.length === 0
      ? images.map((_, index) => `LOOK ${index + 1} — AI 생성 필요`)
      : topicLines.length > 0 ? topicLines : ['정확한 제품 안내는 직원에게 문의해 주세요.']
  const imageCount = images.length

  const openPurchaseInquiry = () => {
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku))
  }

  const requestStaffDetails = () => {
    dispatch({ type: SESSION_ACTIONS.recordSaCall, sku, callType: 'info' })
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.staffPending, sku))
  }

  return (
    <StageCDetailShell className={`stage-c-product-detail-shell stage-c-product-detail-shell--${topic}`}>
      <header className="stage-c-product-detail-topbar">
        <span>{topicTitles[topic]}</span>
      </header>

      <section className={`stage-c-product-detail-media stage-c-product-detail-media--${topic}`} aria-label={`${topicTitles[topic]} 안내 미디어`}>
        {imageCount > 0 && <ProductCoverflow alt={product.name} images={images} label={`${topicTitles[topic]} 제품 이미지`} variant={topic === 'styling' ? 'styling' : 'product'} />}
        {topic === 'styling' && imageCount === 0 && <img alt={product.name} className="stage-c-primary-cutout" decoding="async" fetchPriority="high" src={product.imageUrl} />}
      </section>

      {topic !== 'styling' && (
        <section className="stage-c-product-detail-summary">
          {materialFacts.length > 0
            ? materialFacts.map((fact) => (
              <p key={fact.label}>· <span className="stage-c-product-detail-summary__label">{fact.label}</span> : {fact.value}</p>
            ))
            : lines.map((line) => <p key={line}>· {renderSummaryLine(line)}</p>)}
        </section>
      )}

      {topic !== 'styling' && (
        <button className="stage-c-action-button stage-c-product-detail-more-button" onClick={requestStaffDetails} type="button">
          더 자세한 내용이 궁금하다면
        </button>
      )}
      <div className="stage-c-product-detail-actions">
        <button className="stage-c-action-button stage-c-action-button--primary" onClick={openPurchaseInquiry} type="button">
          착용 및 구매 문의
        </button>
        <button className="stage-c-action-button" onClick={exitProduct} type="button">
          다른 제품 보기 <span aria-hidden="true">→</span>
        </button>
      </div>
      {devScenario && <StageFDevFlowOverlay product={product} scenario={devScenario} onExit={() => navigate('/__dev/stage-f')} />}
    </StageCDetailShell>
  )
}

function isStageFDevScenario(state: unknown): state is { stageFDevScenario: StageFDevScenario } {
  if (typeof state !== 'object' || state === null || !('stageFDevScenario' in state)) return false
  const scenario = state.stageFDevScenario
  return scenario === 'f2' || scenario === 'f3' || scenario === 'f4'
}
