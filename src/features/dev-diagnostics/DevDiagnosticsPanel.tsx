import { useState, useSyncExternalStore } from 'react'
import { clearApiCallLog, getApiCallRecords, subscribeApiCallLog } from './apiCallLog'
import type { DataSourceRow } from './dataSources'
import { setStaffCallTestStatus, STAFF_CALL_TEST_STATUSES } from '../../api/internalTest'
import { getActiveStaffCallId, subscribeActiveStaffCall } from '../sa-call/activeStaffCall'
import {
  getActiveDegradations,
  getDegradationMessage,
  subscribeDegradation,
} from '../degradation/degradationStore'
import './DevDiagnostics.css'

type DevDiagnosticsPanelProps = {
  /** App이 실제로 주입한 Provider 값에서 계산해 넘긴다. 목록이 코드와 어긋나지 않게 하기 위함이다. */
  dataSources: readonly DataSourceRow[]
}

function StatusChip({ status, failed }: { status: number | null; failed: boolean }) {
  if (status === null) return <span className="dev-diagnostics__status dev-diagnostics__status--pending">···</span>
  if (status === 0) return <span className="dev-diagnostics__status dev-diagnostics__status--failed">NET</span>
  return (
    <span className={`dev-diagnostics__status${failed ? ' dev-diagnostics__status--failed' : ''}`}>{status}</span>
  )
}

/**
 * 개발 빌드 전용 진단 패널. 실기기에서 devtools를 열 수 없어 화면 안에 둔다.
 * production 번들에는 포함되지 않는다 — `App.tsx`가 `import.meta.env.DEV`로 import 자체를 막는다.
 */
export function DevDiagnosticsPanel({ dataSources }: DevDiagnosticsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const records = useSyncExternalStore(subscribeApiCallLog, getApiCallRecords, getApiCallRecords)
  const degradations = useSyncExternalStore(subscribeDegradation, getActiveDegradations, getActiveDegradations)
  const activeStaffCallId = useSyncExternalStore(subscribeActiveStaffCall, getActiveStaffCallId, getActiveStaffCallId)

  const failedCount = records.filter((record) => record.failed).length

  return (
    <div className={`dev-diagnostics${isOpen ? ' dev-diagnostics--open' : ''}`}>
      <button
        aria-expanded={isOpen}
        className="dev-diagnostics__badge"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        API {records.length}
        {failedCount > 0 && <em className="dev-diagnostics__badge-failed"> ● {failedCount}</em>}
      </button>

      {isOpen && (
        <section aria-label="개발 진단" className="dev-diagnostics__panel">
          <header>
            <strong>데이터 출처</strong>
          </header>
          <ul className="dev-diagnostics__sources">
            {dataSources.map((source) => (
              <li key={source.label}>
                <span>{source.label}</span>
                <span className={source.live ? 'dev-diagnostics__tag dev-diagnostics__tag--live' : 'dev-diagnostics__tag'}>
                  {source.live ? 'LIVE' : 'MOCK'}
                </span>
              </li>
            ))}
          </ul>

          {activeStaffCallId !== null && (
            <>
              <header><strong>직원 호출 #{activeStaffCallId} 시연</strong></header>
              <p className="dev-diagnostics__hint">
                SA 대시보드가 없어 상태가 바뀌지 않으면 약 3분 뒤 시간 초과된다.
                서버의 internal-test 엔드포인트가 꺼져 있으면 404가 난다.
              </p>
              <div className="dev-diagnostics__actions">
                {STAFF_CALL_TEST_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      void setStaffCallTestStatus(activeStaffCallId, status).catch((error: unknown) => {
                        console.error('시연용 상태 변경에 실패했습니다.', error)
                      })
                    }}
                    type="button"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </>
          )}

          {degradations.length > 0 && (
            <>
              <header><strong>폴백 중</strong></header>
              <ul className="dev-diagnostics__degradations">
                {degradations.map((key) => <li key={key}>{getDegradationMessage(key)}</li>)}
              </ul>
            </>
          )}

          <header>
            <strong>최근 호출</strong>
            <button onClick={clearApiCallLog} type="button">지우기</button>
          </header>
          {records.length === 0
            ? <p className="dev-diagnostics__empty">아직 호출이 없어요.</p>
            : (
              <ol className="dev-diagnostics__calls">
                {records.map((record) => (
                  <li key={record.id}>
                    <StatusChip failed={record.failed} status={record.status} />
                    <span className="dev-diagnostics__method">{record.method}</span>
                    <span className="dev-diagnostics__path">{record.path}</span>
                    <span className="dev-diagnostics__duration">
                      {record.durationMs === null ? '' : `${record.durationMs}ms`}
                    </span>
                    {record.code && <span className="dev-diagnostics__code">{record.code}</span>}
                  </li>
                ))}
              </ol>
            )}
        </section>
      )}
    </div>
  )
}
