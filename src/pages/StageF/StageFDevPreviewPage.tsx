import { Link } from 'react-router'
import { DEFAULT_PRODUCT_SKU } from '../../constants/appRoutes'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, stageCPath } from '../../constants/stageC'
import type { StageFDevScenario } from './StageFDevFlowOverlay'

const PREVIEW_ITEMS = [
  { id: 'F2', description: 'CB6 콘텐츠 제안 → 이메일 접점 확보', scenario: 'f2' },
  { id: 'F3', description: 'CB5 가격 부담 → 제품 가치 소구', scenario: 'f3' },
  { id: 'F4', description: 'CB3 직원 응대 미비 → 상담 유도', scenario: 'f4' },
] as const

const devProductDetailPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.craft, DEFAULT_PRODUCT_SKU)

/** Development-only entry point for visual QA; never registered in production. */
export function StageFDevPreviewPage() {
  return (
    <main className="stage-f-dev-preview">
      <section>
        <p>개발 전용 · 고객에게 노출되지 않음</p>
        <h1>STAGE F 화면 확인</h1>
        <div>
          {PREVIEW_ITEMS.map((item) => (
            <Link key={item.id} state={{ stageFDevScenario: item.scenario satisfies StageFDevScenario }} to={devProductDetailPath}>
              <strong>{item.id}</strong>
              <span>{item.description}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
