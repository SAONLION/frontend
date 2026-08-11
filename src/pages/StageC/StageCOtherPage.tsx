import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { MobileShell } from '../../components/common/MobileShell'
import { EVENT_NAMES, FREE_QUERY_TOPICS } from '../../constants/events'
import { STAGE_C_SCREEN_IDS } from '../../constants/stageC'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { StageCState } from './StageCHubPage'
import { quickQueryTopics, stageCHubDefinitions } from './stageCDefinitions'

export function StageCOtherPage() {
  const { sku = '' } = useParams()
  const navigate = useNavigate()
  const { dispatch, state } = useSession()
  const product = useStageCProduct(sku)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const screen = stageCHubDefinitions[STAGE_C_SCREEN_IDS.c5]

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />
  }

  const submitQuery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = query.trim()

    if (!text) {
      setError('궁금한 내용을 입력하거나 퀵칩을 선택해 주세요.')
      return
    }

    dispatch({ type: SESSION_ACTIONS.recordFreeQuery, topic: FREE_QUERY_TOPICS.other, text })
    navigate(`/stage-c/${sku}/coming-soon/${STAGE_C_SCREEN_IDS.c51}`)
  }

  const requestPurchase = () => {
    dispatch({ type: SESSION_ACTIONS.recordSubhubSelect, sub: STAGE_C_SCREEN_IDS.c33 })
    navigate(`/stage-c/${sku}/coming-soon/${STAGE_C_SCREEN_IDS.c33}`)
  }

  const exitProduct = () => {
    const exitCount = state.events.filter((event) => event.name === EVENT_NAMES.productExit).length
    dispatch({ type: SESSION_ACTIONS.recordProductExit, sku })
    const destination = exitCount === 0 ? STAGE_C_SCREEN_IDS.stageD1 : STAGE_C_SCREEN_IDS.stageB1
    navigate(`/stage-c/${sku}/coming-soon/${destination}`)
  }

  return (
    <MobileShell>
      <section className="stage-c-page stage-c-page--other" aria-labelledby="stage-c-other-heading">
        <div className="stage-c-product-context-pill">비세토스 스타크 백팩</div>
        <div className="stage-c-other-spacer" aria-hidden="true" />
        <div className="stage-c-hub-content stage-c-hub-content--other">
          <h1 id="stage-c-other-heading">{screen.heading}</h1>
          <p className="stage-c-intro">{screen.intro}</p>
          <form className="stage-c-query-form" onSubmit={submitQuery}>
            <label className="stage-c-visually-hidden" htmlFor="stage-c-free-query">궁금한 내용</label>
            <textarea
              aria-describedby={error ? 'stage-c-free-query-error' : undefined}
              id="stage-c-free-query"
              onChange={(event) => {
                setQuery(event.target.value)
                if (error) setError('')
              }}
              placeholder="예) 비 오는 날 들어도 괜찮을까요?"
              value={query}
            />
            <div aria-label="자주 묻는 질문" className="stage-c-quick-chips">
              {quickQueryTopics.map((topic) => (
                <button key={topic} onClick={() => setQuery(topic)} type="button">
                  {topic}
                </button>
              ))}
            </div>
            {error && <p className="stage-c-form-error" id="stage-c-free-query-error" role="alert">{error}</p>}
            <button className="stage-c-send-button" type="submit">보내기</button>
          </form>
        </div>
        <div className="stage-c-bottom-action-bar" aria-label="제품 탐색 액션">
          <button className="stage-c-action-button" onClick={requestPurchase} type="button">
            {screen.purchaseActionLabel}
          </button>
          <button className="stage-c-action-button" onClick={exitProduct} type="button">
            다른 제품 보기 <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </MobileShell>
  )
}
