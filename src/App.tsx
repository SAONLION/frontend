import G4SendComplete from './pages/StageG/G4SendComplete'

function App() {
  return (
    <G4SendComplete
      productName="비세토스 트롤리"
      onReturnToStart={() => console.log('return to B1')}
      onEndSession={() => console.log('end session')}
    />
  )
}

export default App
