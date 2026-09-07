import '../../styles/admin.css'

/** SA 대시보드의 독립 실행 셸. */
export default function AdminApp() {
  return (
    <main className="admin-shell">
      <section aria-labelledby="admin-shell-title" className="admin-shell__status">
        <p className="admin-shell__eyebrow">MCM CLIENT SERVICE</p>
        <h1 id="admin-shell-title">SA 대시보드를 준비하고 있어요</h1>
        <p>고객 요청을 확인하고 처리할 운영 화면입니다.</p>
      </section>
    </main>
  )
}
