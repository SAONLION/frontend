import type { AdminCallCardData, AdminCallStatus } from '../../features/admin-call-queue/adminCallQueueTypes'

type AdminQueueCardProps = {
  call: AdminCallCardData
  isCompleting?: boolean
  status: AdminCallStatus
  onComplete?: (callId: number) => void
}

export function AdminQueueCard({ call, isCompleting = false, status, onComplete }: AdminQueueCardProps) {
  const isWaiting = status === 'waiting'
  const canComplete = isWaiting && onComplete !== undefined

  return (
    <article className="admin-queue-card">
      <div className="admin-queue-card__copy">
        <h3>{call.customerName} 님</h3>
        {call.productName && <p>{call.productName}</p>}
        <p>{call.requestLabel}</p>
      </div>
      {isWaiting && (
        <button
          aria-label={`${call.customerName} 님의 요청 완료 처리`}
          className="admin-queue-card__complete"
          disabled={!canComplete || isCompleting}
          title={canComplete ? '요청 완료 처리' : 'SA 호출 API 연동 준비 중'}
          type="button"
          onClick={() => onComplete?.(call.callId)}
        >
          <span aria-hidden="true">✓</span>
        </button>
      )}
    </article>
  )
}
