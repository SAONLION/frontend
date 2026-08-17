import { useEffect, useRef } from 'react'
import { respondToAction } from '../../api/pendingActions'
import { BlockerSheet } from '../../components/domain/BlockerSheet'
import { toCustomerBlockerCode } from './serverBlocker'
import { usePendingActionPolling } from './usePendingActionPolling'
import { SESSION_ACTIONS } from '../session/sessionTypes'
import { useSession } from '../session/useSession'

const DISMISS_RESPONSE_KEY = 'dismissed'
const SHEET_TITLE_ID = 'blocker-sheet-title'

/**
 * 서버가 감지한 Blocker 팝업을 폴링해 어느 화면에서든 띄운다.
 *
 * Blocker 감지의 소유자는 서버다. 프론트엔드는 감지하지 않고, 노출·응답만 세션 타임라인에 기록한다.
 * 서버가 트리거 ID를 주지 않아 `T-SERVER`로 기록한다.
 */
export function PendingActionWatcher() {
  const { action, clear } = usePendingActionPolling()
  const { dispatch } = useSession()
  const recordedIds = useRef(new Set<number>())

  const code = action ? toCustomerBlockerCode(action.blockerType) : null

  useEffect(() => {
    if (!action || !code || recordedIds.current.has(action.actionId)) return
    recordedIds.current.add(action.actionId)
    dispatch({ type: SESSION_ACTIONS.recordBlockerDetected, code, triggerId: 'T-SERVER' })
    dispatch({ type: SESSION_ACTIONS.recordActionImpression, code, triggerId: 'T-SERVER' })
  }, [action, code, dispatch])

  if (!action || !code) return null

  const respond = (responseKey: string) => {
    dispatch(
      responseKey === DISMISS_RESPONSE_KEY
        ? { type: SESSION_ACTIONS.recordActionDeclined, code }
        : { type: SESSION_ACTIONS.recordActionAccepted, code },
    )
    clear(action.actionId)
    void respondToAction(action.actionId, responseKey).catch((error: unknown) => {
      console.error('팝업 응답 기록에 실패했습니다.', error)
    })
  }

  return (
    <BlockerSheet
      actions={action.options}
      body={action.popupBody}
      labelledById={SHEET_TITLE_ID}
      title={action.popupTitle}
      onDismiss={() => respond(DISMISS_RESPONSE_KEY)}
      onSelect={respond}
    />
  )
}
