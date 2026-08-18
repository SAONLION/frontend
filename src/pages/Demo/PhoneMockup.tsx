import type { CSSProperties, Ref } from 'react'
import StatusBar from './StatusBar'
import type { DevicePreset } from './devicePresets'
import { applyDeviceSafeArea } from './injectSafeArea'

type PhoneMockupProps = {
  /** 화면 안에 띄울 문서. 같은 오리진이어야 리셋/리로드 제어가 가능하다. */
  appSrc: string
  device: DevicePreset
  iframeRef?: Ref<HTMLIFrameElement>
  /** 값이 바뀌면 iframe이 새로 마운트되어 앱이 처음부터 다시 뜬다. */
  reloadKey: number
  scale: number
  /** 노치·측면 버튼·유리 반사 등 기기 장식. 앱 화면과 겹쳐 보이면 끈다. */
  showsChrome: boolean
}

export default function PhoneMockup({
  appSrc,
  device,
  iframeRef,
  reloadKey,
  scale,
  showsChrome,
}: PhoneMockupProps) {
  const frameStyle = {
    '--device-width': `${device.width}px`,
    '--device-height': `${device.height}px`,
    '--device-bezel-x': `${device.bezelX}px`,
    '--device-bezel-y': `${device.bezelY}px`,
    '--device-glass-x': `${device.glassX}px`,
    '--device-glass-y': `${device.glassY}px`,
    '--device-screen-radius': `${device.screenRadius}px`,
    '--device-notch-width': `${device.notchWidth}px`,
    '--device-notch-height': `${device.notchHeight}px`,
    '--device-notch-top': `${device.notchTop}px`,
    '--device-home-width': `${device.homeIndicatorWidth}px`,
    '--device-home-height': `${device.homeIndicatorHeight}px`,
    '--device-home-bottom': `${device.homeIndicatorBottom}px`,
    transform: `scale(${scale})`,
  } as CSSProperties

  return (
    <div className="demo-phone" style={frameStyle}>
      {/* 측면 버튼은 섀시 옆면에 붙으므로 화면이 아니라 섀시 박스를 기준으로 놓는다. */}
      {showsChrome && device.sideButtons.map((button) => (
        <span
          aria-hidden="true"
          className={`demo-phone__side-button demo-phone__side-button--${button.side} demo-phone__side-button--${button.kind}`}
          key={`${button.side}-${button.center}`}
          style={{ top: `${button.center * 100}%`, height: `${button.length * 100}%` }}
        />
      ))}
      {/* 섀시(티타늄) → 유리(검은 베젤) → 화면. 화면 크기는 이 중첩에서 정확히 기기 논리 해상도가 된다. */}
      <div className="demo-phone__bezel">
        <div className="demo-phone__glass">
          <div className="demo-phone__screen">
            <iframe
              className="demo-phone__viewport"
              key={reloadKey}
              // 문서가 준비된 뒤에야 :root에 값을 심을 수 있다. reloadKey로 다시 마운트되면 또 실행된다.
              onLoad={(event) => applyDeviceSafeArea(event.currentTarget, device, showsChrome)}
              ref={iframeRef}
              src={appSrc}
              title="SAONLION 시연 화면"
            />
            {showsChrome && <StatusBar />}
            {showsChrome && device.notchWidth > 0 && (
              <div aria-hidden="true" className="demo-phone__notch">
                <span className="demo-phone__lens" />
              </div>
            )}
            {showsChrome && <div aria-hidden="true" className="demo-phone__home-indicator" />}
            {showsChrome && <div aria-hidden="true" className="demo-phone__glare" />}
            <div aria-hidden="true" className="demo-phone__screen-edge" />
          </div>
        </div>
        <div aria-hidden="true" className="demo-phone__rim" />
      </div>
      {/* 3D 매장 연출을 붙일 때 폰이 움직이는 주체가 되므로, 이동/회전은 이 래퍼의 transform에 얹는다. */}
    </div>
  )
}
