import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'

const DocentCanvas = lazy(() => import('./DocentCanvas'))

export type DocentCue = 'idle' | 'greet'

class DocentErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    if (this.state.failed) {
      return <div className="stage-c-docent-fallback">도슨트 안내가 준비되어 있어요.</div>
    }

    return this.props.children
  }
}

export function DocentStage({ cue }: { cue: DocentCue }) {
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setSupported(Boolean(document.createElement('canvas').getContext('webgl')))
  }, [])

  return (
    <div className="stage-c-docent-layer">
      {!supported ? (
        <div className="stage-c-docent-fallback">도슨트 안내가 준비되어 있어요.</div>
      ) : (
        <DocentErrorBoundary>
          <Suspense fallback={<div className="stage-c-docent-fallback">도슨트를 불러오는 중이에요.</div>}>
            <DocentCanvas cue={cue} />
          </Suspense>
        </DocentErrorBoundary>
      )}
    </div>
  )
}
