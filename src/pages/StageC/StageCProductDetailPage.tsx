import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import backgroundImage from '../../assets/images/stage-a-background.png';
import bostonBagHero from '../../assets/images/product-boston-bag-hero.png';
import stylingLifestylePhoto from '../../assets/images/product-styling-lifestyle.png';
import closeIcon from '../../assets/images/icon-close.svg';
import CircleIconButton from '../../components/common/CircleIconButton';
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { StageCState } from './StageCHubPage';

type Topic = 'craft' | 'heritage' | 'styling';

const topicBadgeLabels: Record<Topic, string> = {
  craft: '제품 공정 · 소재',
  heritage: '헤리티지 · 브랜드 스토리',
  styling: '스타일링 · 코디',
};

const topicSummaries: Record<Topic, readonly string[]> = {
  craft: [
    '소재 : 비세토스 코티드 캔버스',
    '공정 : 6단계 핸드 피니싱, 엣지 코팅 3회 반복',
    '내구 : 발수 처리 · 스크래치 저항 테스트 통과',
    '지속가능성 : 업사이클 소재 부분 적용',
  ],
  heritage: [
    '1976 뮌헨 창립 — 여행 가방에서 출발한 브랜드',
    '브랜드가 추구하는 가치와 방향성',
    '비세토스 패턴의 유래와 로고 각인의 의미',
  ],
  styling: [],
};

const stylingLooks = [
  { label: 'LOOK 1', text: '데일리 · 데님 + 니트' },
  { label: 'LOOK 2', text: '트래블 · 셋업 + 스니커즈' },
  { label: 'LOOK 3', text: '오피스 · 코트 + 로퍼' },
];

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
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

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
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />;
  }

  const heroImage = topic === 'styling' ? stylingLifestylePhoto : bostonBagHero;
  const staffPendingPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.staffPending, sku);
  const openPurchaseInquiry = () => navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku));

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />

      <div className="relative h-125 w-full overflow-hidden">
        {!imageLoadFailed && (
          <img
            src={heroImage}
            alt={topicBadgeLabels[topic]}
            onError={() => setImageLoadFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <span className="absolute left-[8.5%] top-[9%] w-fit rounded-[10px] border-[0.8px] border-[#424242] bg-[#d9d9d9]/20 px-3.75 py-1.25 text-[14px] text-white">
        {topicBadgeLabels[topic]}
      </span>
      <CircleIconButton
        icon={closeIcon}
        ariaLabel="제품 이해 닫기"
        onClick={() => navigate(productHubPath)}
        iconClassName="h-4 w-auto"
        className="absolute right-[8.5%] top-[8%]"
      />

      <div className="relative z-10 mx-auto -mt-4 flex w-full max-w-100.5 flex-col gap-2.75 px-[7%] pb-8">
        {topic === 'styling' ? (
          <div className="rounded-[15px] border-[0.6px] border-[#424242] bg-[#d9d9d9]/20 p-3.75 text-[14px] text-white">
            {stylingLooks.map((look) => (
              <p key={look.label}>
                · <span className="font-bold">{look.label}</span> — {look.text}
              </p>
            ))}
          </div>
        ) : (
          <div className="rounded-[15px] border-[0.6px] border-[#424242] bg-[#d9d9d9]/20 p-3.75 text-[14px] text-white">
            {topicSummaries[topic].map((line) => (
              <p key={line}>· {line}</p>
            ))}
          </div>
        )}

        {topic !== 'styling' && (
          <button
            type="button"
            onClick={() => navigate(staffPendingPath)}
            className="flex h-13.5 w-full items-center justify-center rounded-full bg-[#d9d9d9]/15 text-[16px] font-medium text-[#ebebeb]"
          >
            더 자세한 내용이 궁금하다면
          </button>
        )}

        <div className="mt-1 flex w-full gap-2.5">
          <button
            type="button"
            onClick={openPurchaseInquiry}
            className="h-11.5 flex-1 rounded-[30px] bg-[#8a5111] text-[16px] font-medium text-white shadow-[inset_0px_-2px_4px_0px_rgba(255,255,255,0.25)]"
          >
            착용 및 구매 문의
          </button>
          <button
            type="button"
            onClick={exitProduct}
            className="h-11.5 flex-1 rounded-full bg-[#d9d9d9]/15 text-[16px] font-medium text-white"
          >
            다른 제품 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
