import type { PropsWithChildren, ReactNode } from 'react'
import { MobileShell } from '../common/MobileShell'

export function StageCDetailShell({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <MobileShell>
      <section className={`stage-c-detail-shell ${className}`.trim()}>{children}</section>
    </MobileShell>
  )
}

export function GlassTopBar({ context, action, className = '' }: { context: string; action: ReactNode; className?: string }) {
  return (
    <header className={`stage-c-glass-topbar ${className}`.trim()}>
      {context && <span>{context}</span>}
      {action}
    </header>
  )
}

export function GlassInfoCard({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`stage-c-glass-card ${className}`.trim()}>
      {children}
    </section>
  )
}

export function GlassSpeechBubble({ children }: PropsWithChildren) {
  return (
    <div className="stage-c-glass-speech">
      {children}
    </div>
  )
}

export function GlassBottomActionDock({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <footer className={`stage-c-glass-action-dock ${className}`.trim()}>
      {children}
    </footer>
  )
}

type GlassChoiceChipProps = {
  label: string
  selected: boolean
  onClick: () => void
  swatch?: string
}

export function GlassChoiceChip({ label, selected, onClick, swatch }: GlassChoiceChipProps) {
  return (
    <button
      aria-pressed={selected}
      className="stage-c-glass-choice-chip"
      onClick={onClick}
      type="button"
    >
      {swatch && <span aria-hidden="true" className="stage-c-choice-swatch" style={{ backgroundColor: swatch }} />}
      <span>{label}</span>
    </button>
  )
}

type GlassSegmentedControlProps = {
  label: string
  children: ReactNode
}

export function GlassSegmentedControl({ label, children }: GlassSegmentedControlProps) {
  return <div aria-label={label} className="stage-c-glass-segmented" role="group">{children}</div>
}
