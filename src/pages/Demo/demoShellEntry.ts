import { DEMO_SHELL_ROUTE } from '../../constants/appRoutes'

/**
 * 마우스로 조작하는 큰 화면인지. 노트북·데스크톱은 참, 폰·태블릿은 거짓이다.
 * 터치스크린이 달린 노트북도 주 포인터는 정밀하므로 참이 된다.
 */
function isDesktopViewer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/**
 * 이 문서를 목업 셸로 띄울지 결정한다.
 *
 * 루트(/)는 기기에 따라 갈린다 — 노트북이면 목업 셸, 폰이면 앱 그대로. 시연 링크와
 * 실사용 링크를 하나로 쓰기 위한 분기다. /demo는 기기와 무관하게 항상 목업이라
 * 폰에서도 목업을 강제로 확인할 수 있고, 그 외 경로는 언제나 앱이다.
 */
export function shouldRenderDemoShell(pathname: string): boolean {
  if (pathname === DEMO_SHELL_ROUTE) return true
  if (pathname !== '/') return false
  return isDesktopViewer()
}
