import { useEffect, useState, type RefObject } from 'react'
import { DEFAULT_PRODUCT_SKU } from '../../constants/appRoutes'
import { getApiCallRecords, subscribeApiCallLog, type ApiCallRecord } from '../../features/demo-tools/apiCallLog'
import { readApiLogBridge, type ApiLogBridge } from '../../features/demo-tools/apiLogBridge'
import { buildScreenCatalog } from '../../features/demo-tools/screenCatalog'
import { getStoredProductContext } from '../../features/session/sessionStorage'
import '../../features/demo-tools/DemoTools.css'

/**
 * 숨은 디버그 패널. **목업 바깥 우측 상단.**
 *
 * 두 가지를 한다 — **모든 화면으로 이동**하고 **앱의 API 호출 기록을 확인**한다.
 * 목업 바깥이라 관객에게 보이지 않고, 진행자만 쓴다.
 *
 * 앱은 iframe 안에서 돌기 때문에 둘 다 같은 오리진 접근으로 처리한다.
 * 이동은 `contentWindow.location`, 기록은 앱이 창에 걸어둔 다리(`apiLogBridge`)를 쓴다.
 */

type Tab = 'screens' | 'api'

type ShellDebugPanelProps = {
  iframeRef: RefObject<HTMLIFrameElement | null>
}

/** 앱이 아직 안 떴을 수 있어 다리를 짧은 주기로 다시 찾는다. `useIframePathSync`와 같은 방식이다. */
const BRIDGE_POLL_MS = 500

function useAppApiRecords(iframeRef: RefObject<HTMLIFrameElement | null>, active: boolean) {
  const [records, setRecords] = useState<readonly ApiCallRecord[]>([])

  useEffect(() => {
    if (!active) return

    let unsubscribe: (() => void) | null = null
    let subscribedBridge: ApiLogBridge | null = null

    const attach = () => {
      const bridge = readApiLogBridge(iframeRef.current)
      if (bridge === subscribedBridge) return
      // 목업의 `새로고침`은 iframe 문서를 통째로 바꾼다. 이전 창의 구독을 그대로 두면
      // 새 앱이 보내는 pending-action 기록을 영원히 못 읽는다.
      unsubscribe?.()
      unsubscribe = null
      subscribedBridge = bridge
      if (!bridge) {
        setRecords([])
        return
      }
      setRecords(bridge.getRecords())
      unsubscribe = bridge.subscribe(() => setRecords(bridge.getRecords()))
    }

    attach()
    // iframe이 새로고침되면 이전 구독은 죽은 창을 가리킨다. 주기적으로 다시 붙인다.
    const timer = window.setInterval(() => {
      attach()
    }, BRIDGE_POLL_MS)

    return () => {
      window.clearInterval(timer)
      unsubscribe?.()
    }
  }, [active, iframeRef])

  return records
}

/** 좌측 하단 트리거는 iframe 바깥 셸에서 호출한다. 셸 자신의 기록도 따로 구독해야 한다. */
function useShellApiRecords(active: boolean) {
  const [records, setRecords] = useState<readonly ApiCallRecord[]>([])

  useEffect(() => {
    if (!active) return
    setRecords(getApiCallRecords())
    return subscribeApiCallLog(() => setRecords(getApiCallRecords()))
  }, [active])

  return records
}

export default function ShellDebugPanel({ iframeRef }: ShellDebugPanelProps) {
  const [tab, setTab] = useState<Tab | null>(null)
  const isApiTabActive = tab === 'api'
  const appRecords = useAppApiRecords(iframeRef, isApiTabActive)
  const shellRecords = useShellApiRecords(isApiTabActive)

  // `:sku` 자리는 앱이 저장해 둔 제품으로 채운다. 태그 전이면 시연 기본 제품을 쓴다.
  const catalog = buildScreenCatalog(getStoredProductContext()?.currentSku ?? DEFAULT_PRODUCT_SKU)
  const failedCount = [...appRecords, ...shellRecords].filter((record) => record.failed).length

  const go = (path: string) => {
    const frame = iframeRef.current
    if (!frame) return
    try {
      // replace를 쓴다. 셸의 뒤로가기가 화면 이동마다 한 칸씩 쌓이면 시연 중 헷갈린다.
      frame.contentWindow?.location.replace(path)
    } catch {
      // 다른 오리진이면 접근이 막힌다. 목업은 같은 오리진만 쓰지만 방어적으로 넘어간다.
    }
    setTab(null)
  }

  const toggle = (next: Tab) => setTab((current) => (current === next ? null : next))

  return (
    <div className="demo-tools demo-tools--debug" data-open={tab === null ? undefined : ''}>
      <div className="demo-tools__buttons">
        <button className="demo-tools__button" onClick={() => toggle('screens')} type="button">
          화면
        </button>
        <button className="demo-tools__button" onClick={() => toggle('api')} type="button">
          API{appRecords.length + shellRecords.length > 0 ? ` ${appRecords.length + shellRecords.length}` : ''}
          {failedCount > 0 && <em className="demo-tools__failed"> ●{failedCount}</em>}
        </button>
      </div>

      {tab === 'screens' && (
        <nav aria-label="화면 이동" className="demo-tools__panel">
          {catalog.map((section) => (
            <div key={section.group}>
              <p className="demo-tools__group">{section.group}</p>
              {section.links.map((link) => (
                <button className="demo-tools__link" key={link.path} onClick={() => go(link.path)} type="button">
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      )}

        {tab === 'api' && (
          <section aria-label="API 호출 기록" className="demo-tools__panel">
          <ApiRecordGroup label="셸 호출 기록 (좌측 하단 트리거 · 최근 40건)" records={shellRecords} />
          <ApiRecordGroup label="앱 호출 기록 (목업 화면 · 최근 40건)" records={appRecords} />
          </section>
        )}
    </div>
  )
}

function ApiRecordGroup({ label, records }: { label: string; records: readonly ApiCallRecord[] }) {
  return (
    <div>
      <p className="demo-tools__group">{label}</p>
      {records.length === 0
        ? <p className="demo-tools__empty">아직 호출이 없어요.</p>
        : records.map((record) => (
              <div className="demo-tools__row" data-failed={record.failed ? '' : undefined} key={record.id}>
                <span>{record.method} {record.path}</span>
                <span>
                  {record.status ?? '···'}
                  {record.code ? ` ${record.code}` : ''}
                  {record.durationMs === null ? '' : ` ${record.durationMs}ms`}
                </span>
              </div>
            ))}
    </div>
  )
}
