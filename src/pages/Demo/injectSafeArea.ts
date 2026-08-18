import type { DevicePreset } from './devicePresets'

/**
 * iframe 안의 앱에 실기기의 safe area를 심는다.
 *
 * PC 브라우저에서는 `env(safe-area-inset-*)`가 0이라, 앱이 상단 노치를 피하려고 써 둔
 * `max(1.25rem, ...)` 같은 식이 전부 작은 폴백값으로 무너진다. 그러면 닫기 버튼이나
 * 경고 배너가 다이내믹 아일랜드 밑으로 밀려 들어가 가려진다.
 *
 * 앱 CSS는 env()를 직접 읽지 않고 `--app-safe-area-*` 변수를 거치므로(index.css),
 * 그 변수만 덮어쓰면 실기기와 같은 자리로 내려온다. 셸과 앱이 같은 오리진이라 가능하다.
 */
export function applyDeviceSafeArea(
  iframe: HTMLIFrameElement,
  device: DevicePreset,
  enabled: boolean,
): void {
  const root = iframe.contentDocument?.documentElement
  if (!root) return

  if (!enabled) {
    root.style.removeProperty('--app-safe-area-top')
    root.style.removeProperty('--app-safe-area-bottom')
    return
  }

  root.style.setProperty('--app-safe-area-top', `${device.safeAreaTop}px`)
  root.style.setProperty('--app-safe-area-bottom', `${device.safeAreaBottom}px`)
}
