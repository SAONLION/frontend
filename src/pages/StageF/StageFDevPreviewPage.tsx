import { Link } from 'react-router'
import { STAGE_F_ROUTES } from '../../constants/appRoutes'

const PREVIEW_ITEMS = [
  { id: 'F3', description: 'CB6 콘텐츠 수신 제안', to: STAGE_F_ROUTES.cb6Offer, state: { demoScenario: true, triggerId: 'T-CB6-a' } },
  { id: 'F4', description: '이메일 입력', to: STAGE_F_ROUTES.emailInput },
  { id: 'F5', description: '콘텐츠 발송 완료', to: STAGE_F_ROUTES.sendComplete },
  { id: 'F6 · CB3', description: '직원 직접 안내 제안', to: STAGE_F_ROUTES.cb3Prompt, state: { demoScenario: true, triggerId: 'T-CB3-2' } },
  { id: 'F6 · CB5', description: '제품 가치 소구 제안', to: STAGE_F_ROUTES.cb5Prompt, state: { demoScenario: true, triggerId: 'T-CB5-1' } },
  { id: 'F7', description: '제품 가치 소구 콘텐츠', to: STAGE_F_ROUTES.valueContent },
  { id: 'F8', description: '직원 상세 상담 안내', to: STAGE_F_ROUTES.staffHandoff },
] as const

/** Development-only entry point for visual QA; never registered in production. */
export function StageFDevPreviewPage() {
  return (
    <main className="stage-f-dev-preview">
      <section>
        <p>개발 전용 · 고객에게 노출되지 않음</p>
        <h1>STAGE F 화면 확인</h1>
        <div>
          {PREVIEW_ITEMS.map((item) => (
            <Link key={item.id} state={'state' in item ? item.state : undefined} to={item.to}>
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
