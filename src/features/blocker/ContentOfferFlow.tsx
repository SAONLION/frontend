import { useEffect, useLayoutEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { useReturnToB1 } from '../../app/useReturnToB1'
import { createContact } from '../../api/contacts'
import { CONTENT_OFFER_ROUTES, SESSION_END_ROUTE } from '../../constants/appRoutes'
import CircleButton from '../../components/common/CircleButton'
import PrimaryButton from '../../components/common/PrimaryButton'
import SecondaryButton from '../../components/common/SecondaryButton'
import ScreenHeadline from '../../components/common/ScreenHeadline'
import { DocentStage } from '../../components/domain/DocentStage'
import { useProductContent } from '../../services/product-content/useProductContent'
import { SESSION_ACTIONS } from '../session/sessionTypes'
import { useSession } from '../session/useSession'
import './ContentOfferFlow.css'

export type ContentOfferScreen = keyof typeof CONTENT_OFFER_ROUTES

type ContentOfferRouteState = { actionId?: number; productId?: number | null }

function getRouteState(value: unknown): ContentOfferRouteState {
  if (!value || typeof value !== 'object') return {}
  const candidate = value as Record<string, unknown>
  return {
    actionId: typeof candidate.actionId === 'number' ? candidate.actionId : undefined,
    productId: typeof candidate.productId === 'number' ? candidate.productId : null,
  }
}

/** F2-2·F2-3·F3-3의 URL을 갖는 독립 화면. */
export function ContentOfferPage({ screen }: { screen: ContentOfferScreen }) {
  const { state, dispatch } = useSession()
  const { getProduct } = useProductContent()
  const location = useLocation()
  const navigate = usePreparedNavigate()
  const returnToB1 = useReturnToB1()
  const routeState = getRouteState(location.state)
  const productId = routeState.productId ?? state.productId
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [hasConsent, setHasConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productName, setProductName] = useState('관심 있던 제품')
  const [isFollowUpVisible, setIsFollowUpVisible] = useState(false)

  // 화면 전환 또는 제품명 비동기 갱신 뒤에도 제목이 먼저 다시 끝난다.
  useLayoutEffect(() => {
    setIsFollowUpVisible(false)
  }, [productName, screen])

  useEffect(() => {
    if (!state.currentSku) return
    let active = true
    void getProduct(state.currentSku).then((product) => {
      if (active && product) {
        setProductName(product.name)
      }
    })
    return () => { active = false }
  }, [getProduct, state.currentSku])

  const goTo = (target: ContentOfferScreen) => {
    navigate(CONTENT_OFFER_ROUTES[target], { state: { actionId: routeState.actionId, productId } })
  }

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage('이메일 주소를 확인해주세요.')
      return
    }
    if (!state.sessionId) {
      setMessage('세션을 확인하지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    let isLeaving = false
    try {
      await createContact(state.sessionId, {
        email: normalizedEmail,
        actionId: routeState.actionId,
        productId: productId ?? undefined,
        contentTopic: 'personalized_product_content',
      })
      dispatch({ type: SESSION_ACTIONS.recordContactOffer, blockerCode: 'CB6' })
      dispatch({ type: SESSION_ACTIONS.recordContactCaptured, channel: 'email', blockerCode: 'CB6' })
      if (state.currentSku) dispatch({ type: SESSION_ACTIONS.recordContentSent, sku: state.currentSku })
      isLeaving = true
      goTo('sent')
    } catch (error: unknown) {
      console.error('콘텐츠 발송 요청에 실패했습니다.', error)
      setMessage('발송 요청을 전달하지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      // usePreparedNavigate가 최소 전환 피드백을 보이는 동안 같은 연락처 요청을 다시 보내지 않는다.
      if (!isLeaving) setIsSubmitting(false)
    }
  }

  if (screen === 'email') return (
    <main className="content-offer-flow stage-entry-page--stage-b" data-screen="f2-2">
      <form className="content-offer-flow__panel content-offer-flow__panel--email" onSubmit={submitEmail}>
        <div className="content-offer-flow__email-stack">
          <div className="content-offer-flow__docent-frame"><DocentStage className="content-offer-flow__docent" cue="listen" continuityKey="content-offer-email" /></div>
          <ScreenHeadline className="content-offer-flow__headline" headline={['콘텐츠를 받아보기 위해서는', '이메일 입력이 필요해요']} onRevealComplete={() => setIsFollowUpVisible(true)} reveal variant="md" />
          <div aria-hidden={!isFollowUpVisible} className={`content-offer-flow__revealed-content${isFollowUpVisible ? ' content-offer-flow__revealed-content--visible' : ''}`}>
            <label className="sr-only" htmlFor="content-offer-email">이메일</label>
            <input autoComplete="email" disabled={!isFollowUpVisible || isSubmitting} id="content-offer-email" inputMode="email" placeholder="이메일" tabIndex={isFollowUpVisible ? 0 : -1} type="email" value={email} onChange={(event) => { setEmail(event.target.value); setMessage('') }} />
            {message && <p className="content-offer-flow__error" role="alert">{message}</p>}
            <label className="content-offer-flow__consent">
              <input checked={hasConsent} disabled={!isFollowUpVisible || isSubmitting} tabIndex={isFollowUpVisible ? 0 : -1} type="checkbox" onChange={(event) => setHasConsent(event.target.checked)} />
              <span>본인은 제품 관련 콘텐츠 제공을 위해 ㈜엠씨엠코리아의 개인정보처리방침에 따라 본인의 이메일 주소가 1회에 한해 수집·이용되며, 목적 달성 후 즉시 파기됨에 동의합니다.</span>
            </label>
          </div>
        </div>
        <div className="content-offer-flow__submit-slot">
          {isFollowUpVisible && <CircleButton ariaLabel="콘텐츠 발송 요청" className="content-offer-flow__submit content-offer-flow__revealed-control" disabled={!email.trim() || !hasConsent} direction="right" isPending={isSubmitting} type="submit" />}
        </div>
      </form>
    </main>
  )

  if (screen === 'sent') return (
    <main className="content-offer-flow stage-entry-page--stage-b" data-screen="f2-3">
      <section className="content-offer-flow__panel content-offer-flow__panel--center content-offer-flow__panel--sent">
        <div className="content-offer-flow__sent-content">
          <div className="content-offer-flow__docent-frame content-offer-flow__docent-frame--sent"><DocentStage className="content-offer-flow__docent" cue="request-success" continuityKey="content-offer-sent" /></div>
          <ScreenHeadline className="content-offer-flow__headline" headline={['등록하신 이메일로', `${productName} 관련 콘텐츠를 보내드릴게요!`]} onRevealComplete={() => setIsFollowUpVisible(true)} reveal variant="md" />
        </div>
        {isFollowUpVisible && <div className="content-offer-flow__completion-actions content-offer-flow__revealed-control">
          <SecondaryButton label="다른 제품 보기 →" pendingOnClick onClick={returnToB1} />
          <PrimaryButton label="종료하기" pendingOnClick onClick={() => navigate(SESSION_END_ROUTE)} />
        </div>}
      </section>
    </main>
  )

  return (
    <main className="content-offer-flow stage-entry-page--stage-b" data-screen="f3-3">
      <section className="content-offer-flow__panel content-offer-flow__panel--center content-offer-flow__panel--sent">
        <div className="content-offer-flow__sent-content">
          <div className="content-offer-flow__docent-frame content-offer-flow__docent-frame--staff"><DocentStage cameraMode="close" className="content-offer-flow__docent" cue="request-success" continuityKey="content-offer-staff" /></div>
          <ScreenHeadline className="content-offer-flow__headline" headline={['곧 직원이 더 자세하게', '안내해 드릴거예요!']} onRevealComplete={() => setIsFollowUpVisible(true)} reveal subtext="직원에게 더 자세한 상담을 받아보세요" variant="md" />
        </div>
        {isFollowUpVisible && <div className="content-offer-flow__completion-actions content-offer-flow__revealed-control">
          <SecondaryButton label="다른 제품 보기 →" pendingOnClick onClick={returnToB1} />
        </div>}
      </section>
    </main>
  )
}
