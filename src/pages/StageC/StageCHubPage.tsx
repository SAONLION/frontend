import { useNavigate, useParams } from 'react-router'
import { ChoiceList } from '../../components/common/ChoiceList'
import { MobileShell } from '../../components/common/MobileShell'
import { ProductMedia } from '../../components/domain/ProductMedia'
import { EVENT_NAMES } from '../../constants/events'
import {
  STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS,
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_SCREEN_IDS,
  stageCComingSoonPath,
  stageCPath,
  type StageCHubScreenId,
} from '../../constants/stageC'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { stageCHubDefinitions } from './stageCDefinitions'

type StageCHubPageProps = {
  screenId: StageCHubScreenId
}

export function StageCHubPage({ screenId }: StageCHubPageProps) {
  const { sku = '' } = useParams()
  const navigate = useNavigate()
  const { dispatch, state } = useSession()
  const product = useStageCProduct(sku)
  const screen = stageCHubDefinitions[screenId]

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />
  }

  const selectChoice = (choice: (typeof screen.choices)[number]) => {
    if ('hubType' in choice) {
      dispatch({ type: SESSION_ACTIONS.recordHubSelect, hubType: choice.hubType })
      navigate(`/stage-c/${sku}/${choice.destination}`)
      return
    }

    dispatch({ type: SESSION_ACTIONS.recordSubhubSelect, sub: choice.id })
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

  const exitProduct = () => {
    const exitCount = state.events.filter((event) => event.name === EVENT_NAMES.productExit).length
    dispatch({ type: SESSION_ACTIONS.recordProductExit, sku })
    const destination = exitCount === 0 ? STAGE_C_SCREEN_IDS.stageD1 : STAGE_C_SCREEN_IDS.stageB1
    navigate(stageCComingSoonPath(sku, destination))
  }

  return (
    <MobileShell>
      <section className="stage-c-page" aria-labelledby="stage-c-heading">
        <div className="stage-c-product-context-pill">비세토스 스타크 백팩</div>
        <ProductMedia product={product} />
        <div className="stage-c-hub-content">
          {screen.intro && <p className="stage-c-intro">{screen.intro}</p>}
          <h1 className={screenId === STAGE_C_SCREEN_IDS.c1 ? 'stage-c-heading--intro' : undefined} id="stage-c-heading">{screen.heading}</h1>
          <ChoiceList choices={screen.choices} onSelect={selectChoice} />
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
      <section className="stage-c-state-page" aria-live="polite">
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </MobileShell>
  )
}
