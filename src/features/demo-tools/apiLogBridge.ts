import { getApiCallRecords, subscribeApiCallLog, type ApiCallRecord } from './apiCallLog'

/**
 * 앱(iframe 안)의 API 호출 기록을 목업 셸(바깥 창)이 읽을 수 있게 창에 걸어둔다.
 *
 * **왜 다리가 필요한가.** 시연 도구는 목업 **바깥**에 있어야 한다 — 관객이 보는 것은 폰 화면이고
 * 진행자가 쓰는 버튼이 그 안에 있으면 화면에 잡힌다. 그런데 호출 기록은 앱이 만든다.
 * 셸과 앱은 **같은 오리진이지만 다른 실행 컨텍스트**라 모듈 상태를 직접 공유하지 못한다.
 *
 * `useIframePathSync`가 이미 같은 방식으로 `contentWindow.location`을 읽고 있다.
 * 그 연장선에서 창 객체 하나를 접점으로 쓴다.
 */

export type ApiLogBridge = {
  getRecords: () => readonly ApiCallRecord[]
  subscribe: (listener: () => void) => () => void
}

/** 셸이 `contentWindow[API_LOG_BRIDGE_KEY]`로 찾는다. */
export const API_LOG_BRIDGE_KEY = '__tagonApiLog'

declare global {
  interface Window {
    [API_LOG_BRIDGE_KEY]?: ApiLogBridge
  }
}

/** 앱 쪽에서 한 번 부른다. iframe 안이 아니어도(폰에서 직접 열어도) 걸어두면 무해하다. */
export function exposeApiLogBridge(): void {
  window[API_LOG_BRIDGE_KEY] = {
    getRecords: getApiCallRecords,
    subscribe: subscribeApiCallLog,
  }
}

/** 셸 쪽에서 쓴다. 앱이 아직 안 떴으면 `null`이다. */
export function readApiLogBridge(frame: HTMLIFrameElement | null): ApiLogBridge | null {
  try {
    return frame?.contentWindow?.[API_LOG_BRIDGE_KEY] ?? null
  } catch {
    // 다른 오리진을 띄운 경우. 목업은 같은 오리진만 쓰지만 방어적으로 넘어간다.
    return null
  }
}
