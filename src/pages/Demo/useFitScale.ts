import { useCallback, useLayoutEffect, useRef, useState } from 'react'

const MIN_SCALE = 0.2

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
    setScale(Number.isFinite(fitted) ? Math.max(MIN_SCALE, fitted) : 1)
  }, [height, margin, maxScale, width])

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [measure])

  return { containerRef, scale }
}
