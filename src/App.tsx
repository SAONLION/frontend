import B2TagRecognizing from './pages/StageB/B2TagRecognizing'

function App() {
  return <B2TagRecognizing onRecognized={() => console.log('tag recognized')} />
}

export default App
