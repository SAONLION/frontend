/**
 * 개발 빌드에서 백엔드 호출을 기록한다.
 *
 * 매장 시연은 실기기 모바일에서 이뤄지는데 그 환경에서는 devtools 네트워크 탭을 열 수 없다.
 * 게다가 이 앱은 조회 실패를 조용히 폴백하도록 설계되어 있어, 화면만 봐서는 요청이 성공했는지
 * 실패했는지 알 수 없다. 이 기록이 그 단서가 된다.
 *
 * 기록은 `client.ts`의 인터셉터가 `import.meta.env.DEV`일 때만 남긴다.
 */

export type ApiCallRecord = {
  id: number
  method: string
  path: string
  /** 응답 전에는 null. 네트워크 오류는 0이다. */
  status: number | null
  code: string | null
  durationMs: number | null
  failed: boolean
}

const MAX_RECORDS = 40

let records: readonly ApiCallRecord[] = []
let nextId = 1
const startTimes = new Map<number, number>()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

/** 세션 ID는 길기만 하고 호출을 구분하는 데 도움이 안 되므로 가린다. */
function toDisplayPath(url: string | undefined): string {
  if (!url) return '(unknown)'
  const [path = '', query] = url.split('?')
  if (!query) return path
  const params = new URLSearchParams(query)
  if (params.has('sessionId')) params.set('sessionId', '…')
  return `${path}?${params.toString()}`
}

export function recordApiCallStart(method: string | undefined, url: string | undefined): number {
  const id = nextId
  nextId += 1
  startTimes.set(id, performance.now())
  records = [
    { id, method: (method ?? 'get').toUpperCase(), path: toDisplayPath(url), status: null, code: null, durationMs: null, failed: false },
    ...records,
  ].slice(0, MAX_RECORDS)
  emit()
  return id
}

export function recordApiCallEnd(id: number | undefined, status: number, code: string | null): void {
  if (id === undefined) return
  const startedAt = startTimes.get(id)
  startTimes.delete(id)
  const durationMs = startedAt === undefined ? null : Math.round(performance.now() - startedAt)

  records = records.map((record) => (
    record.id === id
      ? { ...record, status, code, durationMs, failed: status === 0 || status >= 400 }
      : record
  ))
  emit()
}

export function getApiCallRecords(): readonly ApiCallRecord[] {
  return records
}

export function clearApiCallLog(): void {
  records = []
  startTimes.clear()
  emit()
}

export function subscribeApiCallLog(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
