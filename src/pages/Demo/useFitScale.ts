import { useCallback, useLayoutEffect, useRef, useState } from 'react'

const MIN_SCALE = 0.2

/**
 * 목업 가로폭이 **정수 물리 픽셀**에 떨어지도록 배율을 아주 조금 줄인다.
 *
 * 비정수 배율로 축소하면 브라우저가 가장자리를 반 픽셀에 걸쳐 그린다. 그러면 1px 선이
 * 한쪽에만 남거나(왼쪽엔 보이는데 오른쪽엔 없는 식) 화면 경계에 희미한 이음매가 생긴다.
 * 배율을 낮추는 폭은 물리 픽셀 하나 미만이라 눈에 띄지 않는다.
 */
function snapToDevicePixel(scale: number, width: number): number {
  const dpr = window.devicePixelRatio || 1
  const devicePixels = width * dpr
  if (!Number.isFinite(devicePixels) || devicePixels <= 0) return scale
  return Math.floor(scale * devicePixels) / devicePixels
}

type FitScaleOptions = {
  /** 목업 주변에 남길 여백(px). 스케일 계산에서 미리 빼둔다. */
  margin?: number
  /** 화면이 커도 이 배율 이상으로는 키우지 않는다. */
  maxScale?: number
}

/**
 * 컨테이너 크기에 맞춰 width x height 박스를 담을 배율을 계산한다.
 * 목업을 실제로 작게 만드는 대신 배율만 조절하는 이유는, iframe의 CSS 픽셀 기준이
 * 바뀌면 앱 레이아웃 자체가 실기기와 달라지기 때문이다.
 */
export function useFitScale(width: number, height: number, { margin = 40, maxScale = 1 }: FitScaleOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const measure = useCallback(() => {
    const element = containerRef.current
    if (!element) return
    const { width: availableWidth, height: availableHeight } = element.getBoundingClientRect()
    const fitted = Math.min(
      maxScale,
      (availableWidth - margin * 2) / width,
      (availableHeight - margin * 2) / height,
    )
    if (!Number.isFinite(fitted)) {
      setScale(1)
      return
    }
    setScale(snapToDevicePixel(Math.max(MIN_SCALE, fitted), width))
  }, [height, margin, maxScale, width])

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)

    // 프로젝터·외부 모니터로 창을 옮기면 devicePixelRatio가 바뀐다. 컨테이너 크기는
    // 그대로일 수 있어 ResizeObserver만으로는 배율 스냅이 낡은 값으로 남는다.
    const dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    dprQuery.addEventListener('change', measure)

    return () => {
      observer.disconnect()
      dprQuery.removeEventListener('change', measure)
    }
  }, [measure])

  return { containerRef, scale }
}
