import { respondToAction } from '../../api/pendingActions'
import type { PendingActionDetailDTO } from '../../api/types'
import { usePendingActionPolling } from './usePendingActionPolling'

type PendingActionPopupProps = {
  action: PendingActionDetailDTO
  onRespond: (responseKey: string) => void
}

function PendingActionPopup({ action, onRespond }: PendingActionPopupProps) {
  return (
    <div className="pending-action-overlay">
      <section aria-label={action.popupTitle} aria-modal="true" className="pending-action-popup" role="dialog">
        <button aria-label="닫기" className="pending-action-popup__close" type="button" onClick={() => onRespond('dismissed')}>×</button>
        <h2>{action.popupTitle}</h2>
        <p>{action.popupBody}</p>
        <div className="pending-action-popup__options">
          {action.options.map((option) => (
            <button key={option.key} type="button" onClick={() => onRespond(option.key)}>{option.label}</button>
          ))}
        </div>
      </section>
    </div>
  )
}

// 서버가 감지한 Blocker(CB1/CB3/CB5/CB6) 팝업을 폴링해 어느 화면에서든 띄운다.
export function PendingActionWatcher() {
  const { action, clear } = usePendingActionPolling()

  if (!action) return null

  const respond = (responseKey: string) => {
    clear()
    void respondToAction(action.actionId, responseKey).catch((error: unknown) => {
      console.error('팝업 응답 기록에 실패했습니다.', error)
    })
  }

  return <PendingActionPopup action={action} onRespond={respond} />
}
