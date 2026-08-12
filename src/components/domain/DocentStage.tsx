import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';

const DocentCanvas = lazy(() => import('./DocentCanvas'));

export type DocentCue = 'idle' | 'greet';

const FALLBACK_CLASSNAME = 'flex h-full w-full items-center justify-center text-center text-[14px] text-[#d1d1d1]';

class DocentErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    if (this.state.failed) {
      return <div className={FALLBACK_CLASSNAME}>도슨트 안내가 준비되어 있어요.</div>;
    }

    return this.props.children;
  }
}

export function DocentStage({ cue, className = '' }: { cue: DocentCue; className?: string }) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(Boolean(document.createElement('canvas').getContext('webgl')));
  }, []);

  return (
    <div className={`pointer-events-none relative ${className}`}>
      {!supported ? (
        <div className={FALLBACK_CLASSNAME}>도슨트 안내가 준비되어 있어요.</div>
      ) : (
        <DocentErrorBoundary>
          <Suspense fallback={<div className={FALLBACK_CLASSNAME}>도슨트를 불러오는 중이에요.</div>}>
            <DocentCanvas cue={cue} />
          </Suspense>
        </DocentErrorBoundary>
      )}
    </div>
  );
}
