import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { GlassBottomActionDock, GlassChoiceChip, GlassInfoCard, GlassTopBar, StageCDetailShell } from '../../components/domain/StageCDetailShell'
import { FREE_QUERY_TOPICS, type FreeQueryTopic } from '../../constants/events'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { StageCState } from './StageCHubPage'
import { quickQueryTopics } from './stageCDefinitions'

const piiPattern = /(?:\b[\w.+-]+@[\w-]+\.[\w.-]+\b)|(?:\b(?:\+?82[- ]?)?0?1[0-9][ -]?\d{3,4}[ -]?\d{4}\b)/

export function StageCOtherPage() {
  const { sku = '' } = useParams()
  const navigate = useNavigate()
  const { dispatch } = useSession()
  const product = useStageCProduct(sku)
  const exitProduct = useProductExit(sku)
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<FreeQueryTopic>(FREE_QUERY_TOPICS.other)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (product === undefined) return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  if (product === null) return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />

  const submitQuery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = query.trim()
    if (!text) return setError('궁금한 내용을 입력하거나 퀵칩을 선택해 주세요.')
    if (piiPattern.test(text)) return setError('개인정보 없이 질문해 주세요.')
    if (submitting) return
    setSubmitting(true)
    dispatch({ type: SESSION_ACTIONS.recordFreeQuery, sku, topic, text })
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.otherAnswer, sku))
  }

  return (
    <StageCDetailShell className="stage-c-other-shell">
      <GlassTopBar action={<button aria-label="기타 질문 닫기" className="stage-c-close-control" onClick={() => navigate(stageCPath(STAGE_C_ROUTES.c1, sku))} type="button">×</button>} context="" />
      <GlassInfoCard className="stage-c-other-card">
        <h1>선택지에 없는 게 궁금하시면</h1>
        <p>아래에 편하게 적어주세요.</p>
        <form className="stage-c-query-form stage-c-glass-query-form" id="stage-c-free-query-form" onSubmit={submitQuery}>
          <label className="stage-c-visually-hidden" htmlFor="stage-c-free-query">궁금한 내용</label>
          <textarea aria-describedby={error ? 'stage-c-free-query-error' : undefined} id="stage-c-free-query" onChange={(event) => { setQuery(event.target.value); setTopic(FREE_QUERY_TOPICS.other); setError('') }} placeholder="예) 비 오는 날 들어도 괜찮을까요?" value={query} />
          <div aria-label="자주 묻는 질문" className="stage-c-quick-chips">
            {quickQueryTopics.map((item) => <GlassChoiceChip key={item.label} label={item.label} onClick={() => { setQuery(item.question); setTopic(item.topic); setError('') }} selected={topic === item.topic && query === item.question} />)}
          </div>
          {error && <p className="stage-c-form-error" id="stage-c-free-query-error" role="alert">{error}</p>}
        </form>
        <button className="stage-c-send-button" disabled={submitting} form="stage-c-free-query-form" type="submit">{submitting ? '보내는 중…' : '보내기'}</button>
      </GlassInfoCard>
      <GlassBottomActionDock className="stage-c-other-actions">
        <button className="stage-c-action-button" onClick={() => navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku))} type="button">착용 및 구매 문의</button>
        <button className="stage-c-action-button" onClick={exitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
      </GlassBottomActionDock>
    </StageCDetailShell>
  )
}
