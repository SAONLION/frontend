import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { DocentStage } from '../../components/domain/DocentStage'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'
import {
  GlassInfoCard,
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

const STAFF_CALL_INFO_TRANSITION_DELAY_MS = 2_000

export function StaffCallPage({ completed = false, callType = 'info' }: StaffCallPageProps) {
  const { sku = '' } = useParams()
  const navigate = useNavigate()
  const { state } = useSession()
  const staffCallService = useStaffCallService()
  const pendingRequestRef = useRef<PendingStaffRequest | null>(null)
  const [areActionsVisible, setAreActionsVisible] = useState(false)
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

    const minimumDisplayTime = new Promise<void>((resolve) => {
      window.setTimeout(resolve, callType === 'info' ? STAFF_CALL_INFO_TRANSITION_DELAY_MS : 0)
    })

    void Promise.all([request.completion, minimumDisplayTime]).then(() => {
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

  if (callType === 'info') {
    return (
      <StageCDetailShell className="stage-c-staff-call-shell">
        <div className="stage-c-staff-call-content">
          <section aria-label="나이비스 AI 도슨트" className="stage-c-staff-call-docent">
            <DocentStage continuityKey={`staff-call-${callType}`} cue={completed ? 'success' : 'sending'} />
          </section>
          <h1><KineticTextReveal autoPlay blur distance={16} onRevealComplete={() => setAreActionsVisible(true)} splitBy="characters" stagger={0.035} text={completed
              ? '제가 직원분께 궁금해 하시는\n부분을 잘 전달했어요!'
              : '더 자세히 설명드리기 위해\n직원에게 알림을 보내는 중이에요!'} /></h1>
        </div>

        {completed && areActionsVisible && (
          <div className="stage-c-staff-call-actions" aria-label="직원 문의 후 액션">
            <Link className="stage-c-action-button" to={returnPath}>← 다른 정보 보기</Link>
            <div>
              <Link className="stage-c-action-button stage-c-action-button--primary" to={purchaseInquiryPath}>구매 문의</Link>
              <button className="stage-c-action-button" onClick={exitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
            </div>
          </div>
        )}
      </StageCDetailShell>
    )
  }

  return (
    <StageCDetailShell className="stage-c-c5-response-shell">
      <header className="stage-c-c5-response-topbar">
        <Link aria-label="기타 질문 닫기" className="stage-c-close-control" to={returnPath}>×</Link>
      </header>
      <div className="stage-c-c5-staff-content">
        <section aria-label="나이비스 AI 도슨트" className="stage-c-c5-staff-docent"><DocentStage continuityKey={`staff-call-${callType}`} cue={completed ? 'success' : 'sending'} /></section>
        <h1><KineticTextReveal autoPlay blur distance={16} onRevealComplete={() => setAreActionsVisible(true)} splitBy="characters" stagger={0.035} text={'직원에게 궁금한 사항에 대해\n문의 알림을 보냈어요!'} /></h1>
        <p>더 자세한 상담을 받아보세요</p>
      </div>
      {areActionsVisible && <div className="stage-c-c5-response-actions">
        <Link className="stage-c-action-button" to={returnPath}>다른 것도 물어보기</Link>
        <div>
          <Link className="stage-c-action-button" to={returnPath}>직원에게 문의하기</Link>
          <button className="stage-c-action-button" onClick={exitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
        </div>
      </div>}
    </StageCDetailShell>
  )

}
