import { useState, type CSSProperties } from 'react'

type BronzeGlowStyle = CSSProperties & {
  '--ambient-bronze-delay': string
  '--ambient-bronze-drift-x': string
  '--ambient-bronze-drift-y': string
  '--ambient-bronze-duration': string
  '--ambient-bronze-opacity': string
  '--ambient-bronze-size': string
  '--ambient-bronze-x': string
  '--ambient-bronze-y': string
}

const glowCount = 12

function createBronzeGlow(): BronzeGlowStyle {
  const driftX = (Math.random() - 0.5) * 18
  const driftY = (Math.random() - 0.5) * 15
  const size = 24 + Math.random() * 42

  return {
    '--ambient-bronze-delay': `${-(Math.random() * 24).toFixed(2)}s`,
    '--ambient-bronze-drift-x': `${driftX.toFixed(2)}%`,
    '--ambient-bronze-drift-y': `${driftY.toFixed(2)}%`,
    '--ambient-bronze-duration': `${(4.5 + Math.random() * 6).toFixed(2)}s`,
    '--ambient-bronze-opacity': `${(0.28 + Math.random() * 0.32).toFixed(2)}`,
    '--ambient-bronze-size': `${size.toFixed(2)}%`,
    '--ambient-bronze-x': `${(Math.random() * 100).toFixed(2)}%`,
    '--ambient-bronze-y': `${(Math.random() * 100).toFixed(2)}%`,
  }
}

/** Soft bronze light under the transparent Cosmic Dust particle field. */
export function AmbientBronzeBackground() {
  const [glowStyles] = useState(() => Array.from({ length: glowCount }, createBronzeGlow))

  return (
    <div aria-hidden="true" className="ambient-bronze-background">
      <span className="ambient-bronze-background__center-glow" />
      {glowStyles.map((style, index) => <span className="ambient-bronze-background__glow" key={index} style={style} />)}
    </div>
  )
}
