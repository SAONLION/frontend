import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import type { DocentCue } from '../../features/docent/docentCue';
import { markDocentReady } from '../../features/docent/docentReadiness';

const DocentCanvas = lazy(() => import('./DocentCanvas'));

export type { DocentCue } from '../../features/docent/docentCue';

const FALLBACK_CLASSNAME = 'stage-c-docent-fallback';

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

export function DocentStage({
  cue,
  className = '',
  continuityKey,
  onReady,
}: {
  cue: DocentCue;
  className?: string;
  continuityKey?: string;
  onReady?: () => void;
}) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(Boolean(document.createElement('canvas').getContext('webgl')));
  }, []);

  return (
    <div className={`stage-c-docent-layer stage-c-docent-layer--${cue} ${className}`}>
      {!supported ? (
        <div className={FALLBACK_CLASSNAME}>도슨트 안내가 준비되어 있어요.</div>
      ) : (
        <DocentErrorBoundary>
          <Suspense fallback={<div className={FALLBACK_CLASSNAME}>도슨트를 불러오는 중이에요.</div>}>
            <DocentCanvas cue={cue} continuityKey={continuityKey} onReady={() => {
              markDocentReady();
              onReady?.();
            }} />
          </Suspense>
        </DocentErrorBoundary>
      )}
    </div>
  );
}
