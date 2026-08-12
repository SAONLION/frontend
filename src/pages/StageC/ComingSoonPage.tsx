import { Link, useParams } from 'react-router'
import { MobileShell } from '../../components/common/MobileShell'
import { STAGE_B_ROUTES } from '../../constants/appRoutes'
import { STAGE_C_SCREEN_IDS } from '../../constants/stageC'

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
}

export function ComingSoonPage() {
  const { screenId = '', sku = '' } = useParams()
  const fallback = hubFallbackByScreenId[screenId] ?? {
    label: '제품 상세 허브로 돌아가기',
    path: (currentSku: string) => `/stage-c/${currentSku}`,
  }

  return (
    <MobileShell>
      <section className="stage-c-state-page stage-c-coming-soon-page">
        <p className="stage-c-target-id">{screenId || '다음 화면'}</p>
        <h1>이 안내는 준비 중이에요</h1>
        <p>선택하신 내용을 더 잘 안내할 수 있도록 곧 연결할게요.</p>
        <Link className="stage-c-action-button stage-c-action-button--primary" to={fallback.path(sku)}>
          {fallback.label}
        </Link>
      </section>
    </MobileShell>
  )
}
