import '../../styles/admin.css'
import { useCallback, useState } from 'react'
import { AdminQueueColumn } from '../../components/admin/AdminQueueColumn'
import { DocentStage } from '../../components/domain/DocentStage'
import { StaffTokenGate } from '../../components/admin/StaffTokenGate'
import { useAdminCallBoard } from '../../features/admin-call-queue/useAdminCallBoard'

/** SA 대시보드의 독립 실행 셸. */
export default function AdminApp() {
  const [staffToken, setStaffToken] = useState<string | null>(null)
  const [authenticationError, setAuthenticationError] = useState<string | null>(null)
  const handleAuthenticationFailure = useCallback(() => {
    setStaffToken(null)
    setAuthenticationError('Staff-Token을 확인해 주세요.')
  }, [])
  const board = useAdminCallBoard(staffToken, handleAuthenticationFailure)

  const authenticate = (token: string) => {
    setAuthenticationError(null)
    setStaffToken(token)
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div aria-label="SA 도슨트" className="admin-dashboard__docent">
          <DocentStage cue="idle" immediate />
        </div>
      </header>
      {!staffToken ? <StaffTokenGate errorMessage={authenticationError} onSubmit={authenticate} /> : <section aria-label="SA 호출 현황" className="admin-dashboard__queues">
        <AdminQueueColumn
          calls={board.waiting}
          completingCallId={board.completingCallId}
          label="대기"
          state={board.waitingState}
          status="waiting"
          onComplete={board.complete}
          onRetry={board.refresh}
        />
        <AdminQueueColumn calls={board.completed} label="완료" state={board.completedState} status="completed" onRetry={board.refresh} />
      </section>}
    </main>
  )
}
