import E2RequestReceived from './pages/StageE/E2RequestReceived'

function App() {
  return (
    <E2RequestReceived
      selectedRequests={['가격 확인', '재고 문의']}
      onClose={() => console.log('close')}
    />
  )
}

export default App
