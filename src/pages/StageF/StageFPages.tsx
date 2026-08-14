import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import emblemImage from '../../assets/images/mcm-emblem.png'
import { BlockerPrompt } from '../../components/domain/BlockerPrompt'
import { DEFAULT_PRODUCT_SKU, STAGE_B_ROUTES, STAGE_F_ROUTES } from '../../constants/appRoutes'
import type { BlockerCode, BlockerPromptVariant, BlockerTriggerId } from '../../features/blocker/blockerTypes'
import { useContact } from '../../features/contact/useContact'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { useProductContent } from '../../services/product-content/useProductContent'
import { getMockValueContentCopy } from '../../mocks/fixtures/demoContent'
import type { Product } from '../../types/product'

const FALLBACK_PRODUCT: Product = {
  sku: DEFAULT_PRODUCT_SKU,
  name: '관심있던 제품',
  imageUrl: '',
  dimensions: '',
}

function useCurrentProduct(): Product {
  const { state } = useSession()
  const { getProduct } = useProductContent()
  const [product, setProduct] = useState<Product>(FALLBACK_PRODUCT)
  const sku = state.currentSku ?? DEFAULT_PRODUCT_SKU

  useEffect(() => {
    let active = true
    void getProduct(sku).then((resolved) => { if (active && resolved) setProduct(resolved) })
    return () => { active = false }
  }, [getProduct, sku])
  return product
}

function recordPrompt(dispatch: ReturnType<typeof useSession>['dispatch'], code: BlockerCode, triggerId: BlockerTriggerId) {
  dispatch({ type: SESSION_ACTIONS.recordBlockerDetected, code, triggerId })
  dispatch({ type: SESSION_ACTIONS.recordActionImpression, code, triggerId })
}

function usePromptImpression(code: BlockerCode, triggerId: BlockerTriggerId, enabled: boolean) {
  const { dispatch } = useSession()
  const recorded = useRef(false)
  useEffect(() => {
    if (!enabled || recorded.current) return
    recorded.current = true
    recordPrompt(dispatch, code, triggerId)
  }, [code, dispatch, enabled, triggerId])
}

function hasAcceptedAction(state: ReturnType<typeof useSession>['state'], code: BlockerCode): boolean {
  return state.events.some((event) => event.name === 'action_accepted' && event.code === code)
}

function useRouteContextGuard(allowed: boolean) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!allowed) navigate(STAGE_B_ROUTES.nfcPrompt, { replace: true })
  }, [allowed, navigate])
  return allowed
}

type MockScenario = { demoScenario: true; triggerId: BlockerTriggerId }

function getMockScenario(search: string, routeState: unknown): MockScenario | null {
  if (typeof routeState === 'object' && routeState !== null && 'demoScenario' in routeState && 'triggerId' in routeState) {
    const value = routeState as { demoScenario?: unknown; triggerId?: unknown }
    if (value.demoScenario === true && typeof value.triggerId === 'string') {
      return { demoScenario: true, triggerId: value.triggerId as BlockerTriggerId }
    }
  }
  const demo = new URLSearchParams(search).get('demo')
  const triggerId: Record<string, BlockerTriggerId> = { cb3: 'T-CB3-2', cb5: 'T-CB5-1', cb52: 'T-CB5-2', cb6: 'T-CB6-a' }
  return demo && triggerId[demo] ? { demoScenario: true, triggerId: triggerId[demo] } : null
}

function StageFProductBackdrop({ product }: { product: Product }) {
  return <div className="stage-f-product-backdrop"><span className="stage-f-context-pill">제품 공정 · 소재</span>{product.imageUrl && <img alt={product.name} src={product.imageUrl} />}</div>
}

export function StageFPromptPage({ variant }: { variant: BlockerPromptVariant }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useSession()
  const product = useCurrentProduct()
  const code: BlockerCode = variant === 'cb3-staff' ? 'CB3' : 'CB5'
  const scenario = getMockScenario(location.search, location.state)
  const triggerId: BlockerTriggerId = variant === 'cb3-staff'
    ? 'T-CB3-2'
    : scenario?.triggerId === 'T-CB5-2' ? 'T-CB5-2' : 'T-CB5-1'
  const allowed = scenario?.triggerId === triggerId || (variant === 'cb5-value' && scenario?.triggerId === 'T-CB5-2')
  usePromptImpression(code, triggerId, allowed)
  const routeAllowed = useRouteContextGuard(allowed)

  const accept = useCallback(() => {
    dispatch({ type: SESSION_ACTIONS.recordActionAccepted, code })
    if (variant === 'cb3-staff') {
      dispatch({ type: SESSION_ACTIONS.recordSaCall, sku: state.currentSku ?? product.sku, callType: 'info' })
      navigate(STAGE_F_ROUTES.staffHandoff, { state: scenario })
      return
    }
    navigate(STAGE_F_ROUTES.valueContent, { state: scenario })
  }, [code, dispatch, navigate, product.sku, scenario, state.currentSku, variant])
  const decline = useCallback(() => {
    dispatch({ type: SESSION_ACTIONS.recordActionDeclined, code })
    navigate(STAGE_B_ROUTES.nfcPrompt)
  }, [code, dispatch, navigate])

  if (!routeAllowed) return null
  return <main className="stage-f-page stage-f-page--prompt"><StageFProductBackdrop product={product} /><BlockerPrompt variant={variant} productName={product.name} onAccept={accept} onDecline={decline} /></main>
}

export function StageFCb6OfferPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useSession()
  const { hasCapturedContact } = useContact()
  const product = useCurrentProduct()
  const scenario = getMockScenario(location.search, location.state)
  const triggerId: BlockerTriggerId | null = scenario
    && (scenario.triggerId === 'T-CB6-a' || scenario.triggerId === 'T-CB6-b' || scenario.triggerId === 'T-CB6-c')
    ? scenario.triggerId
    : null
  const allowed = useRouteContextGuard(triggerId !== null && !state.blocker.cb6Handled && !state.blocker.contactCaptured)
  const recorded = useRef(false)
  useEffect(() => {
    if (!triggerId || !allowed || recorded.current) return
    recorded.current = true
    dispatch({ type: SESSION_ACTIONS.recordBlockerDetected, code: 'CB6', triggerId })
    dispatch({ type: SESSION_ACTIONS.recordActionImpression, code: 'CB6', triggerId })
  }, [allowed, dispatch, triggerId])
  const decline = useCallback(() => {
    dispatch({ type: SESSION_ACTIONS.recordActionDeclined, code: 'CB6' })
    navigate(STAGE_B_ROUTES.nfcPrompt)
  }, [dispatch, navigate])
  const accept = useCallback(() => {
    if (hasCapturedContact) return navigate(STAGE_B_ROUTES.nfcPrompt)
    dispatch({ type: SESSION_ACTIONS.recordContactOffer, blockerCode: 'CB6' })
    dispatch({ type: SESSION_ACTIONS.recordActionAccepted, code: 'CB6' })
    navigate(STAGE_F_ROUTES.emailInput, { state: scenario })
  }, [dispatch, hasCapturedContact, navigate, scenario])

  if (!allowed) return null
  return <main className="stage-f-page stage-f-page--prompt"><StageFProductBackdrop product={product} /><BlockerPrompt variant="cb6-content" productName={product.name} onAccept={accept} onDecline={decline} /></main>
}

export function StageFEmailInputPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useSession()
  const scenario = getMockScenario(location.search, location.state)
  const allowed = useRouteContextGuard(hasAcceptedAction(state, 'CB6') && scenario?.triggerId.startsWith('T-CB6-') === true)
  const { captureEmail } = useContact()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return setError('이메일 주소를 확인해주세요.')
    captureEmail(normalized)
    dispatch({ type: SESSION_ACTIONS.recordContactCaptured, channel: 'email', blockerCode: 'CB6' })
    dispatch({ type: SESSION_ACTIONS.recordContentSent, sku: state.currentSku ?? DEFAULT_PRODUCT_SKU })
    navigate(STAGE_F_ROUTES.sendComplete, { state: scenario })
  }
  if (!allowed) return null
  return <main className="stage-f-page stage-f-page--center"><img alt="" className="stage-f-emblem" src={emblemImage} /><form className="stage-f-form" onSubmit={submit}><h1>콘텐츠를 받아보기 위해서는<br />이메일 입력이 필요해요</h1><label className="sr-only" htmlFor="contact-email">이메일</label><input autoComplete="email" id="contact-email" inputMode="email" placeholder="이메일" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} />{error && <p className="stage-f-error" role="alert">{error}</p>}<button aria-label="콘텐츠 발송 요청" className="stage-f-arrow" type="submit">→</button></form></main>
}

export function StageFSendCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useSession()
  const product = useCurrentProduct()
  const scenario = getMockScenario(location.search, location.state)
  const allowed = useRouteContextGuard(state.blocker.contactCaptured && scenario?.triggerId.startsWith('T-CB6-') === true)
  if (!allowed) return null
  return <main className="stage-f-page stage-f-page--center"><img alt="" className="stage-f-emblem" src={emblemImage} /><section className="stage-f-complete"><h1>등록하신 이메일로 {product.name} 관련<br />콘텐츠를 보내드릴게요!</h1><button className="stage-f-outline-button" type="button" onClick={() => navigate(STAGE_B_ROUTES.nfcPrompt)}>다른 제품 보기 →</button></section></main>
}

export function StageFValueContentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useSession()
  const product = useCurrentProduct()
  const scenario = getMockScenario(location.search, location.state)
  const allowed = useRouteContextGuard(hasAcceptedAction(state, 'CB5') && (scenario?.triggerId === 'T-CB5-1' || scenario?.triggerId === 'T-CB5-2'))
  const askStaff = () => {
    dispatch({ type: SESSION_ACTIONS.recordSaCall, sku: state.currentSku ?? product.sku, callType: 'info' })
    navigate(STAGE_F_ROUTES.staffHandoff, { state: scenario })
  }
  if (!allowed) return null
  return <main className="stage-f-page stage-f-page--value"><img alt={product.name} className="stage-f-value-image" src={product.imageUrl} /><section className="stage-f-value-copy"><h1>{product.name}</h1><p>{getMockValueContentCopy(product.name)}</p></section><div className="stage-f-bottom-actions"><button className="stage-f-outline-button" type="button" onClick={askStaff}>직원에게 더 물어보기</button><button className="stage-f-outline-button" type="button" onClick={() => navigate(STAGE_B_ROUTES.nfcPrompt)}>다른 제품 보기 →</button></div></main>
}

export function StageFStaffHandoffPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useSession()
  const scenario = getMockScenario(location.search, location.state)
  const allowed = useRouteContextGuard(
    (scenario?.triggerId === 'T-CB3-2' && hasAcceptedAction(state, 'CB3'))
    || ((scenario?.triggerId === 'T-CB5-1' || scenario?.triggerId === 'T-CB5-2') && hasAcceptedAction(state, 'CB5')),
  )
  if (!allowed) return null
  return <main className="stage-f-page stage-f-page--center"><img alt="" className="stage-f-emblem" src={emblemImage} /><section className="stage-f-complete"><h1>곧 직원이 더 자세하게<br />안내해 드릴거예요!</h1><p>직원에게 더 자세한 상담을 받아보세요</p><button className="stage-f-outline-button" type="button" onClick={() => navigate(STAGE_B_ROUTES.nfcPrompt)}>다른 제품 보기 →</button></section></main>
}
