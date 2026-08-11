import { BrowserRouter } from 'react-router'
import { AppRoutes } from './app/routes'
import { SessionProvider } from './features/session/SessionProvider'
import { mockProductContentProvider } from './mocks/providers/mockProductContentProvider'
import { ProductContentProvider } from './services/product-content/ProductContentProvider'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ProductContentProvider value={mockProductContentProvider}>
        <SessionProvider>
          <AppRoutes />
        </SessionProvider>
      </ProductContentProvider>
    </BrowserRouter>
  )
}

export default App
