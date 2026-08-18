import { DEMO_SHELL_ROUTE, STAGE_A_ROUTES } from '../../constants/appRoutes'

/** ?path= 없이 열었을 때 목업이 띄우는 화면. 앱의 실제 첫 화면이다. */
export const DEFAULT_APP_ENTRY_PATH = STAGE_A_ROUTES.intro

/**
 * ?path=로 넘어온 시작 화면을 검증한다.
 *
 * 목업 안에서는 부모 주소창이 늘 고정이라 주소로 특정 화면에 들어갈 수 없다.
 * 이 옵션이 그 자리를 대신한다 — 리허설이나 시연 중 특정 화면부터 시작할 때 쓴다.
 *
 * 같은 오리진의 경로만 받는다. 루트와 /demo는 노트북에서 목업 셸이 잡는 경로라
 * 그대로 두면 iframe이 셸을 다시 열어 무한 중첩된다.
 */
export function resolveAppEntryPath(raw: string | null): string {
  if (!raw) return DEFAULT_APP_ENTRY_PATH

  const trimmed = raw.trim()
  if (!trimmed.startsWith('/')) return DEFAULT_APP_ENTRY_PATH

  let url: URL
  try {
    url = new URL(trimmed, window.location.origin)
  } catch {
    return DEFAULT_APP_ENTRY_PATH
  }

  // '//example.com/x'처럼 다른 오리진으로 풀리는 값을 걸러낸다.
  if (url.origin !== window.location.origin) return DEFAULT_APP_ENTRY_PATH
  if (url.pathname === '/' || url.pathname === DEMO_SHELL_ROUTE) return DEFAULT_APP_ENTRY_PATH

  // 쿼리와 해시는 그대로 살린다 — sku·tagId를 넘겨야 하는 화면이 있다.
  return `${url.pathname}${url.search}${url.hash}`
}
