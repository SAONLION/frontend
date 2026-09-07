import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

const CustomerApp = lazy(() => import('./app/customer/CustomerApp'))
const AdminApp = lazy(() => import('./app/admin/AdminApp'))

function AppLoadingFallback() {
  return <main aria-busy="true" aria-label="화면을 준비하고 있어요" />
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<AppLoadingFallback />}>
        <Routes>
          <Route element={<AdminApp />} path="/admin/*" />
          <Route element={<CustomerApp />} path="/*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
