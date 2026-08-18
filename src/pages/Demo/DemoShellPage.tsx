import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { clearStoredProductContext, clearStoredSessionId } from '../../features/session/sessionStorage'
import PhoneMockup from './PhoneMockup'
import { resolveAppEntryPath } from './appEntryPath'
import { BACKGROUND_IDS, BACKGROUND_PRESETS, resolveBackground, resolveBackgroundImage } from './backgrounds'
import { chassisSize, IPHONE_16_PRO } from './devicePresets'
import { useFitScale } from './useFitScale'
import { useIframePathSync } from './useIframePathSync'
import './Demo.css'

const DEFAULT_MAX_SCALE = 1

function readOptions() {
  const params = new URLSearchParams(window.location.search)
  const maxScale = Number(params.get('maxScale'))

  return {
    // iframe이 처음 띄울 화면. ?path=로 특정 화면부터 시작할 수 있다.
    appEntryPath: resolveAppEntryPath(params.get('path')),
    background: resolveBackground(params.get('bg')),
    backgroundImage: resolveBackgroundImage(params.get('bgImage')),
    // 큰 화면에서 목업을 더 키우고 싶을 때만 쓴다. 기본은 실제 기기 크기(1배).
    maxScale: Number.isFinite(maxScale) && maxScale > 0 ? maxScale : DEFAULT_MAX_SCALE,
    // 노치·측면 버튼·유리 반사가 거슬리면 ?chrome=0으로 모두 끈다.
    showsChrome: params.get('chrome') !== '0',
  }
}

export default function DemoShellPage() {
  const [options] = useState(readOptions)
  const [background, setBackground] = useState(options.background)
  const [reloadKey, setReloadKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // 화면이 아니라 섀시 바깥 크기로 재야 베젤과 측면 버튼까지 여백 안에 들어온다.
  const chassis = chassisSize(IPHONE_16_PRO)
  const { containerRef, scale } = useFitScale(chassis.width, chassis.height, {
    maxScale: options.maxScale,
  })
  // 앱이 이동하면 바깥 주소창의 ?path=가 따라온다. 그래서 새로고침해도 그 화면으로 돌아온다.
  useIframePathSync(iframeRef)

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  // 시연을 처음부터 다시 돌릴 때. 셸과 앱이 같은 오리진이라 저장소를 직접 비울 수 있다.
  const restart = useCallback(() => {
    clearStoredSessionId()
    clearStoredProductContext()
    setReloadKey((key) => key + 1)
  }, [])

  // 배경만 바꾸는 것이라 reloadKey를 건드리지 않는다 — iframe은 그대로 살아 있다.
  const cycleBackground = useCallback(() => {
    setBackground((current) => {
      const next = BACKGROUND_IDS.indexOf(current) + 1
      return BACKGROUND_IDS[next % BACKGROUND_IDS.length]
    })
  }, [])

  const stageStyle = options.backgroundImage
    ? ({ '--demo-background-image': options.backgroundImage } as CSSProperties)
    : undefined

  return (
    <div
      className="demo-stage"
      data-background={background}
      data-background-image={options.backgroundImage ? '' : undefined}
      style={stageStyle}
    >
      <div className="demo-stage__viewport" ref={containerRef}>
        <PhoneMockup
          appSrc={options.appEntryPath}
          device={IPHONE_16_PRO}
          iframeRef={iframeRef}
          reloadKey={reloadKey}
          scale={scale}
          showsChrome={options.showsChrome}
        />
      </div>
      <div className="demo-controls">
        <button className="demo-controls__button" onClick={cycleBackground} type="button">
          배경: {BACKGROUND_PRESETS[background]}
        </button>
        <button className="demo-controls__button" onClick={reload} type="button">
          새로고침
        </button>
        <button className="demo-controls__button" onClick={restart} type="button">
          처음부터
        </button>
      </div>
    </div>
  )
}
