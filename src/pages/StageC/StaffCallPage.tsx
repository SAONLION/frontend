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
import type { StaffCallType } from '../../constants/events'
import {
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_ROUTES,
  stageCPath,
} from '../../constants/stageC'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { findLatestFreeQueryForSku, hasOtherStaffCallForQuery } from '../../features/session/freeQueryContext'
import { useStaffCallService } from '../../features/sa-call/useStaffCallService'
import { useSession } from '../../features/session/useSession'

type StaffCallPageProps = {
  completed?: boolean
  callType?: StaffCallType
}

type PendingStaffRequest = {
  sku: string
  type: StaffCallType
  completion: Promise<'completed'>
}

export function StaffCallPage({ completed = false, callType = 'info' }: StaffCallPageProps) {
  const { sku = '' } = useParams()
  const navigate = useNavigate()
  const { state } = useSession()
  const staffCallService = useStaffCallService()
  const pendingRequestRef = useRef<PendingStaffRequest | null>(null)
  const exitProduct = useProductExit(sku)
  const returnPath = stageCPath(callType === 'info' ? STAGE_C_ROUTES.c2 : STAGE_C_ROUTES.c5, sku)
  const completedPath = stageCPath(callType === 'info' ? STAGE_C_PRODUCT_DETAIL_ROUTES.staffCompleted : STAGE_C_PRODUCT_DETAIL_ROUTES.otherStaffCompleted, sku)
  const purchaseInquiryPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku)
  const latestQuery = callType === 'other' ? findLatestFreeQueryForSku(state, sku) : null
  const hasRequestContext = callType === 'other'
    ? Boolean(latestQuery && hasOtherStaffCallForQuery(state, sku, latestQuery.index))
    : state.events.some((event) => event.name === EVENT_NAMES.saCall && event.sku === sku && event.type === callType)

  useEffect(() => {
    let active = true

    if (!hasRequestContext || completed) {
      return () => {
        active = false
      }
    }

    const previousRequest = pendingRequestRef.current
    const request =
      previousRequest?.sku === sku && previousRequest.type === callType
        ? previousRequest
        : {
            sku,
            type: callType,
            completion: staffCallService.request({ sku, type: callType }),
          }

    pendingRequestRef.current = request

    void request.completion.then(() => {
      if (active) {
        navigate(completedPath, { replace: true })
      }
    })

    return () => {
      active = false
    }
  }, [callType, completed, completedPath, hasRequestContext, navigate, sku, staffCallService])

  if (!hasRequestContext) {
    return (
      <StageCDetailShell>
        <GlassInfoCard>
          <h1>직원 호출 정보를 찾을 수 없어요.</h1>
          <Link to={returnPath}>{callType === 'info' ? '제품 이해로 돌아가기' : '기타 질문으로 돌아가기'}</Link>
        </GlassInfoCard>
      </StageCDetailShell>
    )
  }

  return (
    <StageCDetailShell>
      <GlassTopBar
        action={
          <Link className="stage-c-glass-link-button" to={returnPath}>
            ← {callType === 'info' ? '제품 이해' : '기타 질문'}
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
          <Link className="stage-c-glass-link-button" to={returnPath}>
            {callType === 'info' ? '다른 정보 보기' : '다른 것도 물어보기'}
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
          <Link className="stage-c-glass-link-button" to={returnPath}>
            {callType === 'info' ? '제품 이해로 돌아가기' : '기타 질문으로 돌아가기'}
          </Link>
        </GlassBottomActionDock>
      )}
    </StageCDetailShell>
  )
}
