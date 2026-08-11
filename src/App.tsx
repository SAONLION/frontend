import A2NicknameSetup from './pages/StageA/A2NicknameSetup'

function App() {
  return <A2NicknameSetup onSubmit={(nickname) => console.log('nickname:', nickname)} />
}

export default App
