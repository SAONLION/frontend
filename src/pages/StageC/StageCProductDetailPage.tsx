import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { StageCDetailShell } from '../../components/domain/GlassShell';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { STAGE_C_PRODUCT_DETAIL_ROUTES } from '../../constants/stageC';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { StageCState } from './StageCHubPage';

type Topic = 'craft' | 'heritage' | 'styling';

const topicTitles: Record<Topic, string> = {
  craft: '제작 공정 · 소재',
  heritage: '헤리티지 · 브랜드 스토리',
  styling: '스타일링 · 코디',
};

const topicSummaries: Record<Topic, readonly string[]> = {
  craft: [
    '소재 : 비세토스 코티드 캔버스',
    '공정 : 6단계 핸드 피니싱, 엣지 코팅 3회 반복',
    '내구성 : 스크래치 저항 테스트 통과',
    '지속가능성 : 업사이클 소재 부분 적용',
  ],
  heritage: [
    '1976 뮌헨 창립 — 여행 가방에서 출발한 브랜드',
    '브랜드가 추구하는 가치와 방향성',
    '비세토스 패턴의 유래와 로고 각인의 의미',
  ],
  styling: ['LOOK 1 — 데일리 · 데님 + 니트', 'LOOK 2 — 트래블 · 셋업 + 스니커즈', 'LOOK 3 — 오피스 · 코트 + 로퍼'],
};

interface StageCProductDetailPageProps {
  topic: Topic;
}

export default function StageCProductDetailPage({ topic }: StageCProductDetailPageProps) {
  const { sku = '' } = useParams();
  const product = useStageCProduct(sku);
  const { dispatch } = useSession();
  const navigate = useNavigate();
  const exitProduct = useProductExit(sku);
  const viewed = useRef(false);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (product && !viewed.current) {
      viewed.current = true;
      dispatch({ type: SESSION_ACTIONS.recordTabView, topic, sku });
    }
  }, [dispatch, product, sku, topic]);

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />;
  }

  const productHubPath = stageCPath(STAGE_C_ROUTES.c2, sku);

  if (!product) {
    return (
      <StageCDetailShell>
        <div className="rounded-[15px] border-[0.6px] border-white/18 bg-[#1c1f26]/70 p-5 text-white">
          <h1 className="text-[16px] font-semibold">상품을 찾을 수 없어요</h1>
          <p className="mt-1 text-[13px] text-[#d1d1d1]">태그한 상품의 주소를 다시 확인해 주세요.</p>
          <SecondaryButton label="제품 이해로 돌아가기" onClick={() => navigate(productHubPath)} className="mt-4" />
        </div>
      </StageCDetailShell>
    );
  }

  const images = product.detailImages ?? [];
  const lines = topicSummaries[topic];
  const imageCount = images.length;

  const scrollToImage = (nextIndex: number) => {
    if (imageCount === 0) return;
    const normalizedIndex = (nextIndex + imageCount) % imageCount;
    const track = galleryTrackRef.current;

    if (track) {
      track.scrollTo({ left: track.clientWidth * normalizedIndex, behavior: 'smooth' });
    }

    setActiveImageIndex(normalizedIndex);
  };

  const syncActiveImageFromScroll = () => {
    const track = galleryTrackRef.current;
    if (!track || imageCount === 0 || track.clientWidth === 0) return;
    const nextIndex = Math.max(0, Math.min(imageCount - 1, Math.round(track.scrollLeft / track.clientWidth)));
    setActiveImageIndex(nextIndex);
  };

  const openPurchaseInquiry = () => {
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku));
  };

  return (
    <StageCDetailShell>
      <header className="flex items-center justify-between text-[14px] text-white">
        <span>{topicTitles[topic]}</span>
        <button aria-label="제품 이해 닫기" onClick={() => navigate(productHubPath)} type="button" className="text-[20px] text-[#d1d1d1]">
          ×
        </button>
      </header>

      <section aria-label={`${topicTitles[topic]} 안내 미디어`} className="w-full">
        {topic !== 'styling' && (
          <img src={product.imageUrl} alt={product.name} className="h-40 w-full rounded-[15px] object-cover" />
        )}
        {topic === 'styling' && imageCount > 0 && (
          <div>
            <div
              ref={galleryTrackRef}
              onScroll={syncActiveImageFromScroll}
              role="region"
              aria-label="스타일링 제품 이미지"
              tabIndex={0}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none]"
            >
              {images.map((image, imageIndex) => (
                <img
                  key={image}
                  src={image}
                  alt={`${product.name} ${imageIndex + 1}번째 이미지`}
                  className="h-40 w-full shrink-0 snap-center rounded-[15px] object-cover"
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <button aria-label="이전 제품 이미지" onClick={() => scrollToImage(activeImageIndex - 1)} type="button" className="text-[18px] text-white">
                ‹
              </button>
              <span aria-live="polite" className="flex gap-1.5">
                {images.map((image, imageIndex) => (
                  <i
                    key={image}
                    aria-hidden="true"
                    className={`block size-1.5 rounded-full ${imageIndex === activeImageIndex ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </span>
              <button aria-label="다음 제품 이미지" onClick={() => scrollToImage(activeImageIndex + 1)} type="button" className="text-[18px] text-white">
                ›
              </button>
            </div>
          </div>
        )}
        {topic === 'styling' && imageCount === 0 && (
          <img src={product.imageUrl} alt={product.name} className="h-40 w-full rounded-[15px] object-cover" />
        )}
      </section>

      <section className="flex flex-col gap-1 text-[13px] text-[#d1d1d1]">
        {lines.map((line) => (
          <p key={line}>· {line}</p>
        ))}
      </section>

      <div className="mt-auto flex w-full flex-col gap-2.75">
        <PrimaryButton label="착용 및 구매 문의" onClick={openPurchaseInquiry} />
        <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} />
      </div>
    </StageCDetailShell>
  );
}
