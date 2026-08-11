import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { DocentStage } from '../../components/domain/DocentStage'
import {
  GlassBottomActionDock,
  GlassInfoCard,
  GlassSpeechBubble,
  GlassTopBar,
  StageCDetailShell,
} from '../../components/domain/StageCDetailShell'
import {
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_ROUTES,
  STAGE_C_SCREEN_IDS,
  stageCComingSoonPath,
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
  const lines = product.productDetail?.[topic] ?? []
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

  const openStaffCall = () => {
    dispatch({ type: SESSION_ACTIONS.recordSaCall, sku })
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.staffPending, sku))
  }

  const openPurchaseInquiry = () => {
    navigate(stageCComingSoonPath(sku, STAGE_C_SCREEN_IDS.c33))
  }

  return (
    <StageCDetailShell>
      <GlassTopBar
        action={
          <button onClick={() => navigate(productHubPath)} type="button">
            ← 돌아가기
          </button>
        }
        context={topicTitles[topic]}
      />

      <section className="stage-c-glass-media-frame" aria-label={`${topicTitles[topic]} 안내 미디어`}>
        <DocentStage cue={topic === 'craft' ? 'greet' : 'idle'} />
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
                이전
              </button>
              <span aria-live="polite">
                {activeImageIndex + 1} / {imageCount}
              </span>
              <button
                aria-label="다음 제품 이미지"
                onClick={() => scrollToImage(activeImageIndex + 1)}
                type="button"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </section>

      <GlassInfoCard>
        <h1>{topicTitles[topic]}</h1>
        {lines.map((line) => (
          <p key={line}>· {line}</p>
        ))}
      </GlassInfoCard>

      <GlassSpeechBubble>
        <button onClick={openStaffCall} type="button">
          더 자세한 내용에 대해 궁금하신가요? ›
        </button>
      </GlassSpeechBubble>

      <GlassBottomActionDock>
        <button onClick={openPurchaseInquiry} type="button">
          착용 및 구매 문의하기
        </button>
        <button onClick={exitProduct} type="button">
          다른 제품 보기 →
        </button>
      </GlassBottomActionDock>
    </StageCDetailShell>
  )
}
