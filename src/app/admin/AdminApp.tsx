import '../../styles/admin.css'
import emblemImage from '../../assets/images/mcm-emblem.png'
import { AdminQueueColumn } from '../../components/admin/AdminQueueColumn'

/** SA 대시보드의 독립 실행 셸. */
export default function AdminApp() {
  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard__header">
        <img alt="MCM" className="admin-dashboard__emblem" src={emblemImage} />
        <p>SA CLIENT SERVICE</p>
      </header>
      <section aria-label="SA 호출 현황" className="admin-dashboard__queues">
        <AdminQueueColumn calls={[]} label="대기" state="connection-pending" status="waiting" />
        <AdminQueueColumn calls={[]} label="완료" state="connection-pending" status="completed" />
      </section>
    </main>
  )
}
