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
  const lines = product.productDetail?.[topic] ?? ['정확한 제품 안내는 직원에게 문의해 주세요.']
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

  const requestStaffDetails = () => {
    dispatch({ type: SESSION_ACTIONS.recordSaCall, sku, callType: 'info' })
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.staffPending, sku))
  }

  return (
    <StageCDetailShell className={`stage-c-product-detail-shell stage-c-product-detail-shell--${topic}`}>
      <header className="stage-c-product-detail-topbar">
        <span>{topicTitles[topic]}</span>
        <button aria-label="제품 이해 닫기" className="stage-c-close-control" onClick={() => navigate(productHubPath)} type="button">×</button>
      </header>

      <section className={`stage-c-product-detail-media stage-c-product-detail-media--${topic}`} aria-label={`${topicTitles[topic]} 안내 미디어`}>
        {topic !== 'styling' && <img alt={product.name} className="stage-c-primary-cutout" src={product.imageUrl} />}
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
        {topic === 'styling' && imageCount === 0 && <img alt={product.name} className="stage-c-primary-cutout" src={product.imageUrl} />}
      </section>

      <section className="stage-c-product-detail-summary">
        {lines.map((line) => (
          <p key={line}>· {line}</p>
        ))}
      </section>

      {topic !== 'styling' && (
        <button className="stage-c-product-detail-more-button" onClick={requestStaffDetails} type="button">
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
    </StageCDetailShell>
  )
}
