import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { GlassInfoCard, StageCDetailShell } from '../../components/domain/StageCDetailShell'
import type { AiAnswerResult } from '../../features/ai-answer/AiAnswerService'
import { useAiAnswerService } from '../../features/ai-answer/useAiAnswerService'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { findLatestFreeQueryForSku, hasOtherStaffCallForQuery } from '../../features/session/freeQueryContext'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC'
import { StageCState } from './StageCHubPage'

type AnswerStatus = 'loading' | 'error' | 'resolved'
type AnswerView = { contextKey: string; status: AnswerStatus; title: string; lines: readonly string[] }
type PendingAnswerRequest = { queryId: string; sku: string; completion: Promise<AiAnswerResult> }

const initialAnswerView = (contextKey: string): AnswerView => ({
  contextKey,
  status: 'loading',
  title: '답변을 준비하고 있어요.',
  lines: [],
})

export function StageCAiAnswerPage() {
  const { sku = '' } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useSession()
  const service = useAiAnswerService()
  const product = useStageCProduct(sku)
  const exitProduct = useProductExit(sku)
  const queryContext = findLatestFreeQueryForSku(state, sku)
  const query = queryContext?.event
  const contextKey = query ? `${query.id}:${sku}` : `missing:${sku}`
  const hasOtherStaffCall = queryContext ? hasOtherStaffCallForQuery(state, sku, queryContext.index) : false
  const [answerView, setAnswerView] = useState<AnswerView>(() => initialAnswerView(contextKey))
  const [retryAttempt, setRetryAttempt] = useState(0)
  const requestRef = useRef<PendingAnswerRequest | null>(null)
  const staffRequested = useRef(false)
  const otherPath = stageCPath(STAGE_C_ROUTES.c5, sku)
  const staffPendingPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.otherStaffPending, sku)
  const view = answerView.contextKey === contextKey ? answerView : initialAnswerView(contextKey)

  const requestStaff = useCallback(() => {
    if (!query || staffRequested.current) return
    staffRequested.current = true
    if (!hasOtherStaffCall) {
      dispatch({ type: SESSION_ACTIONS.recordSaCall, sku, callType: 'other', queryId: query.id })
    }
    navigate(staffPendingPath)
  }, [dispatch, hasOtherStaffCall, navigate, query, sku, staffPendingPath])

  useEffect(() => {
    if (!query || !product) return
    let active = true
    const previous = requestRef.current
    const request = previous?.queryId === query.id && previous.sku === sku
      ? previous
      : { queryId: query.id, sku, completion: service.answer({ sku, topic: query.topic, text: query.text }) }

    if (request !== previous) {
      requestRef.current = request
      staffRequested.current = false
      setAnswerView(initialAnswerView(contextKey))
    }

    void request.completion.then((result) => {
      if (!active || requestRef.current !== request) return
      if (!result.resolved) {
        dispatch({ type: SESSION_ACTIONS.recordAiAnswer, queryId: query.id, sku, topic: query.topic, resolved: false })
        if (hasOtherStaffCall) navigate(staffPendingPath, { replace: true })
        else requestStaff()
        return
      }
      dispatch({ type: SESSION_ACTIONS.recordAiAnswer, queryId: query.id, sku, topic: query.topic, resolved: true })
      setAnswerView({ contextKey, status: 'resolved', title: result.title, lines: result.answerLines })
    }).catch(() => {
      if (active && requestRef.current === request) {
        setAnswerView({ ...initialAnswerView(contextKey), status: 'error', title: '답변을 불러오지 못했어요.' })
      }
    })

    return () => { active = false }
  }, [contextKey, dispatch, hasOtherStaffCall, navigate, product, query, requestStaff, retryAttempt, service, sku, staffPendingPath])

  if (product === undefined) return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  if (product === null) return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />
  if (!query) return <MissingQuestion path={otherPath} />

  const retry = () => {
    requestRef.current = null
    staffRequested.current = false
    setAnswerView(initialAnswerView(contextKey))
    setRetryAttempt((attempt) => attempt + 1)
  }

  return <StageCDetailShell className="stage-c-c5-response-shell">
    <header className="stage-c-c5-response-topbar">
      <Link aria-label="기타 질문 닫기" to={otherPath}>×</Link>
    </header>
    <div className="stage-c-c5-ai-content">
      <h1>{view.title}</h1>
      {view.status === 'loading' && <p aria-live="polite">답변을 준비하고 있어요.</p>}
      {view.status === 'error' && <p>잠시 후 다시 시도하거나 직원에게 문의해 주세요.</p>}
      {view.status === 'resolved' && (
        <section className="stage-c-c5-answer-card" aria-label="AI 답변">
          {view.lines.map((line) => <p key={line}>· {line}</p>)}
        </section>
      )}
    </div>
    <div className="stage-c-c5-response-actions">
      {view.status === 'error' ? <button className="stage-c-action-button" onClick={retry} type="button">다시 시도하기</button> : <Link className="stage-c-action-button" to={otherPath}>다른 것도 물어보기</Link>}
      <div>
        <button className="stage-c-action-button" onClick={requestStaff} type="button">직원에게 문의하기</button>
        <button className="stage-c-action-button" onClick={exitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
      </div>
    </div>
  </StageCDetailShell>
}

function MissingQuestion({ path }: { path: string }) {
  return <StageCDetailShell><GlassInfoCard><h1>질문 내용을 찾을 수 없어요.</h1><p>궁금한 점을 다시 입력해 주세요.</p><Link className="stage-c-glass-link-button" to={path}>기타 질문으로 돌아가기</Link></GlassInfoCard></StageCDetailShell>
}
