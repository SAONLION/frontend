import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { exposeApiLogBridge } from './features/demo-tools/apiLogBridge'
import './index.css'

// 목업 셸(바깥 창)이 앱의 API 호출 기록을 읽을 수 있게 창에 걸어둔다.
exposeApiLogBridge()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
