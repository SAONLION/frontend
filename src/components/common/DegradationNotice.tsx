import { useSyncExternalStore } from 'react'
import {
  dismissDegraded,
  getDegradationMessage,
  getDegradationSnapshot,
  subscribeDegradation,
} from '../../features/degradation/degradationStore'

/**
 * 서버 값 대신 대체 데이터로 진행 중일 때 화면 상단에 알린다.
 * 한 시점에 하나만 보여준다 — 여러 개를 쌓으면 콘텐츠를 덮고 무엇이 문제인지도 흐려진다.
 */
export function DegradationNotice() {
  const key = useSyncExternalStore(subscribeDegradation, getDegradationSnapshot, getDegradationSnapshot)

  if (!key) return null

  return (
    <div className="degradation-notice" role="status">
      <p>{getDegradationMessage(key)}</p>
      <button aria-label="안내 닫기" onClick={() => dismissDegraded(key)} type="button">×</button>
    </div>
  )
}
