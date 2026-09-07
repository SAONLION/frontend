import '../../styles/admin.css'
import { AdminQueueColumn } from '../../components/admin/AdminQueueColumn'
import { DocentStage } from '../../components/domain/DocentStage'

/** SA 대시보드의 독립 실행 셸. */
export default function AdminApp() {
  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div aria-label="SA 도슨트" className="admin-dashboard__docent">
          <DocentStage cue="idle" immediate />
        </div>
      </header>
      <section aria-label="SA 호출 현황" className="admin-dashboard__queues">
        <AdminQueueColumn calls={[]} label="대기" state="connection-pending" status="waiting" />
        <AdminQueueColumn calls={[]} label="완료" state="connection-pending" status="completed" />
      </section>
    </main>
  )
}
