import { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { DEFAULT_PRODUCT_SKU, stageBRecognizingPath } from '../../constants/appRoutes'
import { STAGE_C_ROUTES, STAGE_C_SCREEN_IDS, stageCComingSoonPath, stageCPath } from '../../constants/stageC'
import { SESSION_ACTIONS } from '../../features/session/sessionTypes'
import { useSession } from '../../features/session/useSession'
import B1NfcPrompt from './B1NfcPrompt'
import B2TagRecognizing from './B2TagRecognizing'

const TAG_RECOGNITION_DELAY_MS = 900

export function StageBNfcPromptPage() {
  const navigate = useNavigate()

  return (
    <B1NfcPrompt
      onCallStaff={() => navigate(stageCComingSoonPath(DEFAULT_PRODUCT_SKU, STAGE_C_SCREEN_IDS.stageE1))}
      onNfcDetected={() => navigate(stageBRecognizingPath(DEFAULT_PRODUCT_SKU))}
    />
  )
}

export function StageBRecognizingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { dispatch } = useSession()
  const recognized = useRef(false)
  const sku = searchParams.get('sku')?.trim() || DEFAULT_PRODUCT_SKU

  const completeRecognition = useCallback(() => {
    if (recognized.current) return
    recognized.current = true
    dispatch({ type: SESSION_ACTIONS.recordNfcTag, sku })
    navigate(stageCPath(STAGE_C_ROUTES.c1, sku), { replace: true })
  }, [dispatch, navigate, sku])

  useEffect(() => {
    const timer = window.setTimeout(completeRecognition, TAG_RECOGNITION_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [completeRecognition])

  return <B2TagRecognizing />
}
