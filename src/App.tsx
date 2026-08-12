import F2AlternativeSkuRecommendation from './pages/StageF/F2AlternativeSkuRecommendation'

function App() {
  return (
    <F2AlternativeSkuRecommendation
      purpose="여행"
      priorityFactor="수납 공간"
      onViewProductDetail={() => console.log('view product detail')}
      onReserveOriginal={() => console.log('reserve original')}
      onGoBack={() => console.log('go back')}
    />
  )
}

export default App
