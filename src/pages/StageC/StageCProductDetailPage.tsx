import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { GlassInfoCard, StageCDetailShell } from '../../components/domain/StageCDetailShell'
import {
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_ROUTES,
  stageCPath,
} from '../../constants/stageC'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { StageCState } from './StageCHubPage'

type Topic = 'craft' | 'heritage' | 'styling'

const topicTitles: Record<Topic, string> = {
  craft: '제작 공정 · 소재',
  heritage: '헤리티지 · 브랜드 스토리',
  styling: '스타일링 · 코디',
}

const topicSummaries: Record<Topic, readonly string[]> = {
  craft: ['소재 : 비세토스 코티드 캔버스', '공정 : 6단계 핸드 피니싱, 엣지 코팅 3회 반복', '내구성 : 스크래치 저항 테스트 통과', '지속가능성 : 업사이클 소재 부분 적용'],
  heritage: ['1976 뮌헨 창립 — 여행 가방에서 출발한 브랜드', '브랜드가 추구하는 가치와 방향성', '비세토스 패턴의 유래와 로고 각인의 의미'],
  styling: ['LOOK 1 — 데일리 · 데님 + 니트', 'LOOK 2 — 트래블 · 셋업 + 스니커즈', 'LOOK 3 — 오피스 · 코트 + 로퍼'],
}

type StageCProductDetailPageProps = {
  topic: Topic
}

export function StageCProductDetailPage({ topic }: StageCProductDetailPageProps) {
  const { sku = '' } = useParams()
  const product = useStageCProduct(sku)
  const { dispatch } = useSession()
  const navigate = useNavigate()
  const exitProduct = useProductExit(sku)
  const viewed = useRef(false)
  const galleryTrackRef = useRef<HTMLDivElement>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

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
      <StageCDetailShell>
        <GlassInfoCard>
          <h1>상품을 찾을 수 없어요</h1>
          <p>태그한 상품의 주소를 다시 확인해 주세요.</p>
          <Link to={productHubPath}>제품 이해로 돌아가기</Link>
        </GlassInfoCard>
      </StageCDetailShell>
    )
  }

  const images = product.detailImages ?? []
  const lines = topicSummaries[topic]
  const imageCount = images.length

  const scrollToImage = (nextIndex: number) => {
    if (imageCount === 0) {
      return
    }

    const normalizedIndex = (nextIndex + imageCount) % imageCount
    const track = galleryTrackRef.current

    if (track) {
      track.scrollTo({
        left: track.clientWidth * normalizedIndex,
        behavior: 'smooth',
      })
    }

    setActiveImageIndex(normalizedIndex)
  }

  const syncActiveImageFromScroll = () => {
    const track = galleryTrackRef.current

    if (!track || imageCount === 0 || track.clientWidth === 0) {
      return
    }

    const nextIndex = Math.max(
      0,
      Math.min(imageCount - 1, Math.round(track.scrollLeft / track.clientWidth)),
    )

    setActiveImageIndex(nextIndex)
  }

  const openPurchaseInquiry = () => {
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku))
  }

  return (
    <StageCDetailShell className="stage-c-product-detail-shell">
      <header className="stage-c-product-detail-topbar">
        <span>{topicTitles[topic]}</span>
        <button aria-label="제품 이해 닫기" onClick={() => navigate(productHubPath)} type="button">×</button>
      </header>

      <section className={`stage-c-product-detail-media stage-c-product-detail-media--${topic}`} aria-label={`${topicTitles[topic]} 안내 미디어`}>
        {topic !== 'styling' && <img alt={product.name} src={product.imageUrl} />}
        {topic === 'styling' && imageCount > 0 && (
          <div className="stage-c-gallery">
            <div
              aria-label="스타일링 제품 이미지"
              className="stage-c-gallery-track"
              onScroll={syncActiveImageFromScroll}
              ref={galleryTrackRef}
              role="region"
              tabIndex={0}
            >
              {images.map((image, imageIndex) => (
                <img
                  alt={`${product.name} ${imageIndex + 1}번째 이미지`}
                  key={image}
                  src={image}
                />
              ))}
            </div>
            <div className="stage-c-gallery-controls">
              <button
                aria-label="이전 제품 이미지"
                onClick={() => scrollToImage(activeImageIndex - 1)}
                type="button"
              >
                ‹
              </button>
              <span aria-live="polite" className="stage-c-gallery-indicators">
                {images.map((image, imageIndex) => <i aria-hidden="true" className={imageIndex === activeImageIndex ? 'is-active' : ''} key={image} />)}
              </span>
              <button
                aria-label="다음 제품 이미지"
                onClick={() => scrollToImage(activeImageIndex + 1)}
                type="button"
              >
                ›
              </button>
            </div>
          </div>
        )}
        {topic === 'styling' && imageCount === 0 && <img alt={product.name} src={product.imageUrl} />}
      </section>

      <section className="stage-c-product-detail-summary">
        {lines.map((line) => (
          <p key={line}>· {line}</p>
        ))}
      </section>

      <div className="stage-c-product-detail-actions">
        <button className="stage-c-action-button stage-c-action-button--primary" onClick={openPurchaseInquiry} type="button">
          착용 및 구매 문의
        </button>
        <button className="stage-c-action-button" onClick={exitProduct} type="button">
          다른 제품 보기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </StageCDetailShell>
  )
}
