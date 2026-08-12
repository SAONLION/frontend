import { useNavigate, useParams } from 'react-router';
import backgroundImage from '../../assets/images/stage-a-background.png';
import PrimaryButton from '../../components/common/PrimaryButton';
import { STAGE_B_ROUTES } from '../../constants/appRoutes';
import { STAGE_C_SCREEN_IDS } from '../../constants/stageC';

const hubFallbackByScreenId: Record<string, { label: string; path: (sku: string) => string }> = {
  [STAGE_C_SCREEN_IDS.c21]: { label: '제품 이해로 돌아가기', path: (sku) => `/stage-c/${sku}/product` },
  [STAGE_C_SCREEN_IDS.c22]: { label: '제품 이해로 돌아가기', path: (sku) => `/stage-c/${sku}/product` },
  [STAGE_C_SCREEN_IDS.c23]: { label: '제품 이해로 돌아가기', path: (sku) => `/stage-c/${sku}/product` },
  [STAGE_C_SCREEN_IDS.c31]: { label: '핏 · 취향으로 돌아가기', path: (sku) => `/stage-c/${sku}/fit` },
  [STAGE_C_SCREEN_IDS.c32]: { label: '핏 · 취향으로 돌아가기', path: (sku) => `/stage-c/${sku}/fit` },
  [STAGE_C_SCREEN_IDS.c33]: { label: '핏 · 취향으로 돌아가기', path: (sku) => `/stage-c/${sku}/fit` },
  [STAGE_C_SCREEN_IDS.c41]: { label: '구매 조건으로 돌아가기', path: (sku) => `/stage-c/${sku}/purchase` },
  [STAGE_C_SCREEN_IDS.c42]: { label: '구매 조건으로 돌아가기', path: (sku) => `/stage-c/${sku}/purchase` },
  [STAGE_C_SCREEN_IDS.c43]: { label: '구매 조건으로 돌아가기', path: (sku) => `/stage-c/${sku}/purchase` },
  [STAGE_C_SCREEN_IDS.c51]: { label: '기타 질문으로 돌아가기', path: (sku) => `/stage-c/${sku}/other` },
  [STAGE_C_SCREEN_IDS.c52]: { label: '기타 질문으로 돌아가기', path: (sku) => `/stage-c/${sku}/other` },
  [STAGE_C_SCREEN_IDS.stageB1]: { label: '다른 제품 태그하기', path: () => STAGE_B_ROUTES.nfcPrompt },
  [STAGE_C_SCREEN_IDS.stageD1]: { label: '제품 상세 허브로 돌아가기', path: (sku) => `/stage-c/${sku}` },
  [STAGE_C_SCREEN_IDS.stageE1]: { label: '제품 태그 안내로 돌아가기', path: () => STAGE_B_ROUTES.nfcPrompt },
};

export default function ComingSoonPage() {
  const { screenId = '', sku = '' } = useParams();
  const navigate = useNavigate();
  const fallback = hubFallbackByScreenId[screenId] ?? {
    label: '제품 상세 허브로 돌아가기',
    path: (currentSku: string) => `/stage-c/${currentSku}`,
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 flex w-full max-w-100.5 flex-col items-center">
        <p className="text-[12px] text-[#a6a6a6]">{screenId || '다음 화면'}</p>
        <p className="mt-2 text-[18px] font-semibold text-white">이 안내는 준비 중이에요</p>
        <p className="mt-1 text-[14px] text-[#d1d1d1]">선택하신 내용을 더 잘 안내할 수 있도록 곧 연결할게요.</p>
        <PrimaryButton
          label={fallback.label}
          onClick={() => navigate(fallback.path(sku))}
          className="mt-8 w-full"
        />
      </div>
    </div>
  );
}
