import { useParams } from 'react-router'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { recordInteraction } from '../../api/interactions'
import { requestPriceInquiry } from '../../api/priceInquiry'
import { hubTypeToInterestType } from '../../api/interestType'
import { ChoiceList } from '../../components/common/ChoiceList'
import { MobileShell } from '../../components/common/MobileShell'
import { ProductMedia } from '../../components/domain/ProductMedia'
import type { HubType } from '../../constants/events'
import {
  STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS,
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_SCREEN_IDS,
  stageCComingSoonPath,
  stageCPath,
  type StageCHubScreenId,
} from '../../constants/stageC'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { useDwellSeconds } from '../../features/product-explore/useDwellSeconds'
import { resolveProductDisplayName } from '../../features/product-explore/productDisplayName'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { stageCHubDefinitions } from './stageCDefinitions'

type StageCHubPageProps = {
  screenId: StageCHubScreenId
}

// 2차 허브 화면(C2~C5)은 각각 1차 관심사 하나에 대응한다.
const SUBHUB_SCREEN_HUB_TYPE: Partial<Record<StageCHubScreenId, HubType>> = {
  [STAGE_C_SCREEN_IDS.c2]: 'product',
  [STAGE_C_SCREEN_IDS.c3]: 'fit',
  [STAGE_C_SCREEN_IDS.c5]: 'other',
}

export function StageCHubPage({ screenId }: StageCHubPageProps) {
  const { sku = '' } = useParams()
  const navigate = usePreparedNavigate()
  const { state, dispatch } = useSession()
  const exitProduct = useProductExit(sku)
  // 이 허브 화면에 머문 시간. 선택하는 순간 인터랙션 로그에 함께 실어 보낸다.
  const dwellSeconds = useDwellSeconds(`${screenId}:${sku}`)

  const logInteraction = (hubType: HubType, subOption?: string) => {
    if (!state.sessionId || state.currentSkuId === null) return
    void recordInteraction(state.sessionId, {
      sku: state.currentSkuId,
      interestType: hubTypeToInterestType(hubType),
      subOption,
      durationSeconds: dwellSeconds(),
    }).catch((error: unknown) => {
      console.error('인터랙션 기록에 실패했습니다.', error)
    })
  }
  const product = useStageCProduct(sku)
  const screen = stageCHubDefinitions[screenId]
  // 사이즈마다 제품 이름이 다르므로 고른 사이즈의 이름을 보여준다.
  const displayName = product ? resolveProductDisplayName(product, state.selectedSizeCode) : ''
  const isProductIntro = screenId === STAGE_C_SCREEN_IDS.c1
  const headingClassName = isProductIntro
    ? 'stage-c-heading--intro'
    : screenId === STAGE_C_SCREEN_IDS.c3
      ? 'stage-c-heading--compact'
      : undefined

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />
  }

  const selectChoice = (choice: (typeof screen.choices)[number]) => {
    if ('hubType' in choice) {
      dispatch({ type: SESSION_ACTIONS.recordHubSelect, hubType: choice.hubType })
      logInteraction(choice.hubType)

      // 구매 조건은 하위 허브 없이 C4-1 가격 안내 요청 완료 화면으로 바로 이어진다.
      if (choice.hubType === 'purchase') {
        dispatch({ type: SESSION_ACTIONS.recordPriceInquiryRequest, sku })
        // 화면이 "요청을 보냈어요"라고 알리므로 실제 직원 호출을 서버에 남긴다.
        requestPriceInquiry(state.sessionId, state.productId)
        navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryCompleted, sku))
        return
      }

      navigate(`/stage-c/${sku}/${choice.destination}`)
      return
    }

    const subhubType = SUBHUB_SCREEN_HUB_TYPE[screenId] ?? 'other'

    if (choice.id === STAGE_C_SCREEN_IDS.c41) {
      dispatch({ type: SESSION_ACTIONS.recordPriceInquiryRequest, sku })
      requestPriceInquiry(state.sessionId, state.productId)
      logInteraction(subhubType, choice.id)
      navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryCompleted, sku))
      return
    }

    dispatch({ type: SESSION_ACTIONS.recordSubhubSelect, sub: choice.id })
    logInteraction(subhubType, choice.id)
    const detailRouteKey = STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS[
      choice.id as keyof typeof STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS
    ]

    if (detailRouteKey) {
      navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES[detailRouteKey], sku))
      return
    }
    navigate(stageCComingSoonPath(sku, choice.destination))
  }

  const requestPurchase = () => {
    dispatch({ type: SESSION_ACTIONS.recordSubhubSelect, sub: STAGE_C_SCREEN_IDS.c33 })
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku))
  }

  const otherChoice = isProductIntro ? screen.choices.find((choice) => choice.id === 'other') : undefined
  const primaryChoices = otherChoice ? screen.choices.filter((choice) => choice.id !== otherChoice.id) : screen.choices

  return (
    <MobileShell>
      <section className="stage-c-page" aria-labelledby="stage-c-heading">
        <div className="stage-c-product-context-pill">{displayName}</div>
        <ProductMedia enableCoverflow={isProductIntro || screenId === STAGE_C_SCREEN_IDS.c3} product={product} />
        <div className="stage-c-hub-content">
          {screen.intro && <p className="stage-c-intro">{screen.intro}</p>}
          <h1 className={headingClassName} id="stage-c-heading">
            {isProductIntro ? (
              <>
                <span title={`MCM의 대표 제품 ${displayName}이네요`}>MCM의 대표 제품 {displayName}이네요</span>
                <span>어떤 점이 궁금하신가요?</span>
              </>
            ) : screen.heading}
          </h1>
          <ChoiceList choices={primaryChoices} onSelect={selectChoice} />
          {otherChoice && (
            <button className="stage-c-other-link" onClick={() => selectChoice(otherChoice)} type="button">
              {otherChoice.label}
            </button>
          )}
        </div>
        <div className="stage-c-bottom-action-bar" aria-label="제품 탐색 액션">
          <button className="stage-c-action-button stage-c-action-button--primary" onClick={requestPurchase} type="button">
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

type StageCStateProps = { title: string; description: string }

export function StageCState({ title, description }: StageCStateProps) {
  return (
    <MobileShell>
      <section className="stage-c-state-page stage-c-fallback-screen" aria-live="polite">
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </MobileShell>
  )
}
