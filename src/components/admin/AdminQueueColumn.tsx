import { AdminQueueCard } from './AdminQueueCard'
import type { AdminCallCardData, AdminCallStatus, AdminQueueState } from '../../features/admin-call-queue/adminCallQueueTypes'

type AdminQueueColumnProps = {
  calls: readonly AdminCallCardData[]
  label: string
  state: AdminQueueState
  status: AdminCallStatus
  onComplete?: (callId: number) => void
  onRetry?: () => void
}

export function AdminQueueColumn({ calls, label, state, status, onComplete, onRetry }: AdminQueueColumnProps) {
  return (
    <section aria-labelledby={`admin-queue-${status}`} className="admin-queue-column" data-status={status}>
      <h2 id={`admin-queue-${status}`}>{label}</h2>
      <div className="admin-queue-column__body">
        {state === 'loading' && <AdminQueueSkeleton />}
        {state === 'connection-pending' && <QueueMessage message="SA 호출 연동을 준비하고 있어요." />}
        {state === 'error' && <QueueMessage actionLabel="다시 시도" message="호출 목록을 불러오지 못했어요." onAction={onRetry} />}
        {state === 'empty' && <QueueMessage message={status === 'waiting' ? '대기 중인 고객 요청이 없어요.' : '완료된 요청이 아직 없어요.'} />}
        {state === 'ready' && calls.map((call) => (
          <AdminQueueCard call={call} key={call.callId} status={status} onComplete={onComplete} />
        ))}
      </div>
    </section>
  )
}

function QueueMessage({ actionLabel, message, onAction }: { actionLabel?: string; message: string; onAction?: () => void }) {
  return (
    <div className="admin-queue-message" role="status">
      <p>{message}</p>
      {actionLabel && onAction && <button type="button" onClick={onAction}>{actionLabel}</button>}
    </div>
  )
}

function AdminQueueSkeleton() {
  return (
    <div aria-label="호출 목록을 불러오는 중" className="admin-queue-skeleton" role="status">
      <span />
      <span />
      <span />
    </div>
  )
}
