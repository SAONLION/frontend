/**
 * 측면 버튼 하나. center/length는 섀시 전체 높이에 대한 비율이다.
 *
 * kind는 재질이다. 대부분은 돌출된 티타늄 버튼('metal')이지만, 16 Pro의 카메라 컨트롤은
 * 프레임에 박힌 사파이어 면('sapphire')이라 거의 돌출하지 않고 광택도 다르다.
 */
export type SideButton = {
  side: 'left' | 'right'
  center: number
  length: number
  kind: 'metal' | 'sapphire'
}

/**
 * 시연용 목업이 흉내 낼 기기.
 *
 * width/height는 **화면**의 논리 해상도(pt)다. iframe을 정확히 이 크기로 띄워야 앱 안의
 * dvh/svh와 미디어쿼리가 실기기와 동일하게 계산된다. 화면에 맞추는 일은 transform: scale이 맡는다.
 *
 * 나머지는 겉모습 값이라 iframe 안쪽 레이아웃에 영향을 주지 않는다.
 */
export type DevicePreset = {
  label: string
  width: number
  height: number
  /** 섀시 바깥 → 화면까지의 거리. 티타늄 밴드와 검은 유리 베젤을 합친 두께. */
  bezelX: number
  bezelY: number
  /** 유리 바깥 → 화면까지의 거리. bezel에서 이만큼을 뺀 폭이 금속 밴드로 보인다. */
  glassX: number
  glassY: number
  /** 화면 모서리 반경(pt). 도면의 corner profile 19.23mm는 원호 반경이 아니므로 쓰지 않는다. */
  screenRadius: number
  /** 다이내믹 아일랜드. top은 화면 상단 기준. */
  notchWidth: number
  notchHeight: number
  notchTop: number
  /** 홈 인디케이터. bottom은 화면 하단 기준. */
  homeIndicatorWidth: number
  homeIndicatorHeight: number
  homeIndicatorBottom: number
  /** 실기기의 safe area. PC 브라우저에서는 env()가 0이라 셸이 이 값을 iframe에 주입한다. */
  safeAreaTop: number
  safeAreaBottom: number
  sideButtons: readonly SideButton[]
}

/**
 * Apple 공식 Dimensional Drawing의 mm 치수를 pt로 환산한 값.
 * 1pt = 66.57mm / 402 ≈ 0.1656mm. 섀시 71.45 × 149.61mm, 유리 69.45 × 147.61mm,
 * 디스플레이 66.57 × 144.79mm.
 */
export const IPHONE_16_PRO: DevicePreset = {
  label: 'iPhone 16 Pro',
  width: 402,
  height: 874,
  bezelX: 14.73, // 2.44mm
  bezelY: 14.55, // 2.41mm
  glassX: 8.70, // 1.44mm
  glassY: 8.51, // 1.41mm
  screenRadius: 62,
  notchWidth: 125.2, // 20.73mm
  notchHeight: 36.6, // 6.07mm
  notchTop: 13.7, // 중심이 섀시 상단에서 7.71mm
  homeIndicatorWidth: 139,
  homeIndicatorHeight: 5,
  homeIndicatorBottom: 8,
  safeAreaTop: 59,
  safeAreaBottom: 34,
  sideButtons: [
    { side: 'left', center: 0.22779, length: 0.04612, kind: 'metal' }, // 액션 버튼 (34.08mm / 6.90mm)
    { side: 'left', center: 0.32237, length: 0.07486, kind: 'metal' }, // 볼륨 + (48.23mm / 11.20mm)
    { side: 'left', center: 0.41728, length: 0.07486, kind: 'metal' }, // 볼륨 − (62.43mm / 11.20mm)
    { side: 'right', center: 0.36983, length: 0.11831, kind: 'metal' }, // 전원 (55.33mm / 17.70mm)
    { side: 'right', center: 0.65631, length: 0.11430, kind: 'sapphire' }, // 카메라 컨트롤 (98.19mm / 17.10mm)
  ],
}

/** 섀시 바깥 크기. 목업을 화면에 맞출 때는 화면이 아니라 이 크기를 기준으로 잰다. */
export function chassisSize(device: DevicePreset) {
  return {
    width: device.width + device.bezelX * 2,
    height: device.height + device.bezelY * 2,
  }
}
