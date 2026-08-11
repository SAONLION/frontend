import { BrowserRouter } from 'react-router'
import { AppRoutes } from './app/routes'
import { SessionProvider } from './features/session/SessionProvider'
import { mockProductContentProvider } from './mocks/providers/mockProductContentProvider'
import { ProductContentProvider } from './services/product-content/ProductContentProvider'
import { StaffCallProvider } from './features/sa-call/StaffCallContext'
import { mockStaffCallService } from './mocks/providers/mockStaffCallService'
import { TryOnRequestProvider } from './features/try-on/TryOnRequestContext'
import { mockTryOnRequestService } from './mocks/providers/mockTryOnRequestService'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ProductContentProvider value={mockProductContentProvider}>
        <StaffCallProvider value={mockStaffCallService}>
          <TryOnRequestProvider value={mockTryOnRequestService}>
            <SessionProvider>
              <AppRoutes />
            </SessionProvider>
          </TryOnRequestProvider>
        </StaffCallProvider>
      </ProductContentProvider>
    </BrowserRouter>
  )
}

export default App
