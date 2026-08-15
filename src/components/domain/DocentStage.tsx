import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import type { DocentCue } from '../../features/docent/docentCue';
import { markDocentReady } from '../../features/docent/docentReadiness';
import { getDocentStagePreloadState } from '../../features/docent/preloadDocentStage';

const loadDocentCanvas = () => import('./DocentCanvas')
const DocentCanvas = lazy(loadDocentCanvas);

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
  immediate = false,
  onReady,
}: {
  cue: DocentCue;
  className?: string;
  continuityKey?: string;
  immediate?: boolean;
  onReady?: () => void;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [shouldMountCanvas, setShouldMountCanvas] = useState(false);

  useEffect(() => {
    const hasWebGl = Boolean(document.createElement('canvas').getContext('webgl'));
    setSupported(hasWebGl);

    if (!hasWebGl) {
      return;
    }

    // Keep route text and primary imagery responsive before WebGL begins compiling shaders.
    const startDelay = immediate || cue === 'greet' || getDocentStagePreloadState() ? 0 : 420;
    const mountTimer = window.setTimeout(() => setShouldMountCanvas(true), startDelay);

    return () => window.clearTimeout(mountTimer);
  }, [cue, immediate]);

  return (
    <div className={`stage-c-docent-layer stage-c-docent-layer--${cue} ${className}`}>
      {supported === false ? (
        <div aria-hidden="true" className={FALLBACK_CLASSNAME} />
      ) : !shouldMountCanvas ? (
        <div aria-hidden="true" className={FALLBACK_CLASSNAME} />
      ) : (
        <DocentErrorBoundary>
          <Suspense fallback={<div aria-hidden="true" className={FALLBACK_CLASSNAME} />}>
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
