import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { DocentStage } from '../../components/domain/DocentStage'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'
import { StageCDetailShell } from '../../components/domain/StageCDetailShell'
import { STAGE_C_PRODUCT_DETAIL_ROUTES, stageCPath } from '../../constants/stageC'
import { useProductExit } from '../../features/product-explore/useProductExit'
import { useStageCProduct } from '../../features/product-explore/useStageCProduct'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import { StageCState } from './StageCHubPage'
import { fitSearchPath, getFitSelection } from './stageCFitSelection'

type PurchaseStatusKind = 'price' | 'stock'

const STATUS_CONTENT: Record<PurchaseStatusKind, { title: string; description?: string }> = {
  price: {
    title: '직원에게 구매 안내 요청을 보냈어요!',
    description: '가격과 관련 정보들을 곧 안내해 드릴게요!',
  },
  stock: {
    title: '직원에게 해당 제품의 재고를 문의하고,\n다른 제품들을 추천받아보세요!',
  },
}

export function StageCPurchaseStatusPage({ kind }: { kind: PurchaseStatusKind }) {
  const { sku = '' } = useParams()
  const navigate = useNavigate()
  const { dispatch } = useSession()
  const product = useStageCProduct(sku)
  const exitProduct = useProductExit(sku)
  const content = STATUS_CONTENT[kind]
  const purchaseStartedRef = useRef(false)
  const [areActionsVisible, setAreActionsVisible] = useState(false)
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />
  }

  const selection = getFitSelection(product, new URLSearchParams())
  const requestPurchase = () => {
    if (!selection || purchaseStartedRef.current) return
    purchaseStartedRef.current = true
    dispatch({ type: SESSION_ACTIONS.recordPurchaseInquiry, sku })
    navigate(fitSearchPath(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitPurchaseInquiryCompleted, sku), selection))
  }

  return (
    <StageCDetailShell className="stage-c-purchase-status-shell">
      <div className="stage-c-purchase-status-content">
        <section aria-label="나이비스 AI 도슨트" className="stage-c-purchase-status-docent"><DocentStage cue="present" /></section>
        <h1 className={kind === 'price' ? 'stage-c-purchase-status-title--single-line' : undefined}><KineticTextReveal autoPlay blur className="justify-center" distance={16} onRevealComplete={() => { setIsDescriptionVisible(true); setAreActionsVisible(true) }} splitBy="characters" stagger={0.035} text={content.title} waitForDocent /></h1>
        {content.description && isDescriptionVisible && <p><KineticTextReveal autoPlay blur={false} className="justify-center" distance={8} splitBy="words" stagger={0.1} text={content.description} waitForDocent /></p>}
      </div>
      {areActionsVisible && <div className="stage-c-purchase-status-actions">
        {kind === 'stock' && (
          <button className="stage-c-action-button stage-c-action-button--primary" onClick={requestPurchase} type="button">
            구매 문의
          </button>
        )}
        <button className="stage-c-action-button" onClick={exitProduct} type="button">다른 제품 보기 <span aria-hidden="true">→</span></button>
      </div>}
    </StageCDetailShell>
  )
}
