import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePreparedNavigate } from '../../app/usePreparedNavigate'
import { ApiError } from '../../api/client'
import { fetchJourneyCard, type JourneyCardResponse } from '../../api/journeyCard'
import { getSkus, scanTag } from '../../api/products'
import { DEFAULT_PRODUCT_SKU, stageBRecognizingPath } from '../../constants/appRoutes'
import { pickDemoTag } from '../../constants/demoTags'
import { STAGE_C_ROUTES, stageCPath } from '../../constants/stageC'
import { clearDegraded, DEGRADATION_KEYS, markDegraded } from '../../features/degradation/degradationStore'
import { setServerProduct } from '../../features/product-explore/serverProduct'
import { reissueSession } from '../../features/session/reissueSession'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import B1NfcPrompt from './B1NfcPrompt'
import B2TagRecognizing from './B2TagRecognizing'

const TAG_RECOGNITION_DELAY_MS = 2_000
// 실물 NFC 태그가 아직 없어 스캔 시뮬레이션에서 쓰는 기본 태그(SKU) id. 스펙 예시값과 동일하게 맞춘다.
const DEFAULT_TAG_ID = 1

export function StageBNfcPromptPage() {
  const navigate = usePreparedNavigate()
  const { state, dispatch } = useSession()
  const [journeyCard, setJourneyCard] = useState<JourneyCardResponse | null>(null)

  useEffect(() => {
    if (!state.sessionId) return
    let cancelled = false

    async function load(sessionId: string) {
      try {
        const data = await fetchJourneyCard(sessionId)
        if (!cancelled) setJourneyCard(data)
        clearDegraded(DEGRADATION_KEYS.journeyCard)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          // 저장된 세션이 서버에 더 이상 없음 → 새 세션을 발급하면 sessionId 변경으로
          // 이 effect가 다시 실행되며 새 세션으로 재조회한다.
          try {
            const newSessionId = await reissueSession()
            if (!cancelled) dispatch({ type: SESSION_ACTIONS.setSessionId, sessionId: newSessionId })
          } catch (reissueError) {
            console.error('세션 재발급에 실패했습니다.', reissueError)
            markDegraded(DEGRADATION_KEYS.session)
          }
          return
        }
        console.error('여정 카드 조회에 실패했습니다.', error)
        markDegraded(DEGRADATION_KEYS.journeyCard)
      }
    }

    void load(state.sessionId)

    return () => {
      cancelled = true
    }
  }, [dispatch, state.sessionId])

  return (
    <B1NfcPrompt
      isOverlayOpen={state.activeOverlay === 'E'}
      journeyCard={journeyCard}
      onCallStaff={() => dispatch({ type: SESSION_ACTIONS.setActiveOverlay, overlay: 'E' })}
      onNfcDetected={() => {
        // 실물 태그가 없으므로 시연용 태그 풀에서 고른다. 직전 제품은 피해 매번 다른 제품이 나온다.
        const tag = pickDemoTag(state.currentSku)
        navigate(stageBRecognizingPath(tag.sku, tag.tagId))
      }}
    />
  )
}

export function StageBRecognizingPage() {
  const navigate = usePreparedNavigate()
  const [searchParams] = useSearchParams()
  const { state, dispatch } = useSession()
  const recognized = useRef(false)
  // 화면은 하이브리드 Provider를 쓴다 — 이름·컬러·이미지는 서버 값이 있으면 서버,
  // 없으면 이 sku 문자열로 찾은 fixture다. 그래서 sku는 여전히 fixture 조회 키로 필요하다.
  const sku = searchParams.get('sku')?.trim() || DEFAULT_PRODUCT_SKU
  const tagIdParam = Number(searchParams.get('tagId'))
  const tagId = Number.isInteger(tagIdParam) && tagIdParam > 0 ? tagIdParam : DEFAULT_TAG_ID

  const completeRecognition = useCallback(() => {
    if (recognized.current) return
    recognized.current = true

    const resolveTag = state.sessionId
      ? scanTag(tagId, state.sessionId)
        .then((result) => {
          clearDegraded(DEGRADATION_KEYS.tagScan)
          // 제품 콘텐츠 Provider가 세션 바깥에 있어 store로 건넨다.
          setServerProduct({
            id: result.product.id,
            name: result.product.name,
            category: result.product.category,
            imageUrl: result.product.imageUrl,
            sku,
          })
          dispatch({ type: SESSION_ACTIONS.setProductId, productId: result.product.id })
          return getSkus(result.product.id).catch((error: unknown) => {
            console.error('SKU 목록 조회에 실패했습니다.', error)
            return null
          })
        })
        .then((skus) => {
          const firstSku = skus?.[0]
          if (firstSku) dispatch({ type: SESSION_ACTIONS.setCurrentSkuId, skuId: firstSku.skuId })
        })
        .catch((error: unknown) => {
          console.error('제품 태그 조회에 실패했습니다.', error)
          // 화면은 로컬 fixture로 계속 진행되지만 productId가 없어 직원 호출이 실패한다.
          markDegraded(DEGRADATION_KEYS.tagScan)
        })
      : Promise.resolve()

    void resolveTag.finally(() => {
      dispatch({ type: SESSION_ACTIONS.recordNfcTag, sku })
      navigate(stageCPath(STAGE_C_ROUTES.c1, sku), { replace: true })
    })
  }, [dispatch, navigate, sku, state.sessionId, tagId])

  useEffect(() => {
    const timer = window.setTimeout(completeRecognition, TAG_RECOGNITION_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [completeRecognition])

  return <B2TagRecognizing />
}
