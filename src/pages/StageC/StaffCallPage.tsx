import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { DocentStage } from '../../components/domain/DocentStage'
import {
  GlassBottomActionDock,
  GlassInfoCard,
  GlassTopBar,
  StageCDetailShell,
} from '../../components/domain/StageCDetailShell'
import { EVENT_NAMES } from '../../constants/events'
import {
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_ROUTES,
  STAGE_C_SCREEN_IDS,
  stageCComingSoonPath,
  stageCPath,
} from '../../constants/stageC'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStaffCallService } from '../../features/sa-call/useStaffCallService'
import { useSession } from '../../features/session/useSession'

type StaffCallPageProps = {
  completed?: boolean
}

type PendingStaffRequest = {
  sku: string
  completion: Promise<'completed'>
}

export function StaffCallPage({ completed = false }: StaffCallPageProps) {
  const { sku = '' } = useParams()
  const navigate = useNavigate()
  const { state } = useSession()
  const staffCallService = useStaffCallService()
  const pendingRequestRef = useRef<PendingStaffRequest | null>(null)
  const exitProduct = useProductExit(sku)
  const productHubPath = stageCPath(STAGE_C_ROUTES.c2, sku)
  const purchaseInquiryPath = stageCComingSoonPath(sku, STAGE_C_SCREEN_IDS.c33)
  const hasRequestContext = state.events.some(
    (event) => event.name === EVENT_NAMES.saCall && event.sku === sku,
  )

  useEffect(() => {
    let active = true

    if (!hasRequestContext || completed) {
      return () => {
        active = false
      }
    }

    const previousRequest = pendingRequestRef.current
    const request =
      previousRequest?.sku === sku
        ? previousRequest
        : {
            sku,
            completion: staffCallService.requestInfo(sku),
          }

    pendingRequestRef.current = request

    void request.completion.then(() => {
      if (active) {
        navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.staffCompleted, sku), { replace: true })
      }
    })

    return () => {
      active = false
    }
  }, [completed, hasRequestContext, navigate, sku, staffCallService])

  if (!hasRequestContext) {
    return (
      <StageCDetailShell>
        <GlassInfoCard>
          <h1>직원 호출 정보를 찾을 수 없어요.</h1>
          <Link to={productHubPath}>제품 이해로 돌아가기</Link>
        </GlassInfoCard>
      </StageCDetailShell>
    )
  }

  return (
    <StageCDetailShell>
      <GlassTopBar
        action={
          <Link className="stage-c-glass-link-button" to={productHubPath}>
            ← 제품 이해
          </Link>
        }
        context="직원 연결"
      />

      <section className="stage-c-glass-media-frame stage-c-staff-media" aria-label="도슨트 안내">
        <DocentStage cue={completed ? 'greet' : 'idle'} />
      </section>

      <GlassInfoCard>
        <h1>
          {completed
            ? '제가 직원분께 궁금해하시는 부분을 잘 전달했어요!'
            : '더 자세히 설명드리기 위해 직원에게 알림을 보내는 중이에요!'}
        </h1>
      </GlassInfoCard>

      {completed ? (
        <GlassBottomActionDock>
          <Link className="stage-c-glass-link-button" to={productHubPath}>
            다른 정보 보기
          </Link>
          <Link className="stage-c-glass-link-button stage-c-glass-link-button--accent" to={purchaseInquiryPath}>
            착용 및 구매 문의하기
          </Link>
          <button onClick={exitProduct} type="button">
            다른 제품 보기 →
          </button>
        </GlassBottomActionDock>
      ) : (
        <GlassBottomActionDock>
          <Link className="stage-c-glass-link-button" to={productHubPath}>
            제품 이해로 돌아가기
          </Link>
        </GlassBottomActionDock>
      )}
    </StageCDetailShell>
  )
}
