// 시연용 목업의 가짜 상태바. 시각 요소일 뿐이라 실제 시간·신호·배터리를 읽지 않는다.
// 시간은 Apple이 제품 사진에 쓰는 관례대로 9:41로 고정한다 — 발표 중 분이 바뀌지 않는 이점도 있다.
const MOCK_TIME = '9:41'

function CellularIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 18 12" width="18">
      <rect fill="currentColor" height="4" rx="1" width="3" x="0" y="8" />
      <rect fill="currentColor" height="6.5" rx="1" width="3" x="5" y="5.5" />
      <rect fill="currentColor" height="9" rx="1" width="3" x="10" y="3" />
      <rect fill="currentColor" height="12" rx="1" width="3" x="15" y="0" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 17 12" width="17">
      <path d="M8.5 11.3 6.05 8.55a3.7 3.7 0 0 1 4.9 0z" fill="currentColor" />
      <path d="M3.55 6.15a7.3 7.3 0 0 1 9.9 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <path d="M1 3.25a11.2 11.2 0 0 1 15 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="13" viewBox="0 0 27 13" width="27">
      <rect height="12" rx="3.8" stroke="currentColor" strokeOpacity="0.38" width="23" x="0.5" y="0.5" />
      <rect fill="currentColor" height="9" rx="2.5" width="18" x="2" y="2" />
      <path d="M25 4.6v3.8a2 2 0 0 0 0-3.8z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

export default function StatusBar() {
  return (
    <div aria-hidden="true" className="demo-status-bar">
      <span className="demo-status-bar__time">{MOCK_TIME}</span>
      <span className="demo-status-bar__indicators">
        <CellularIcon />
        <WifiIcon />
        <BatteryIcon />
      </span>
    </div>
  )
}
