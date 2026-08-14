/**
 * Shared SVG displacement used by the liquid-glass surface tokens.
 * Browsers without URL-backed backdrop filters keep the standard blur fallback.
 */
export function LiquidGlassFilterDefinitions() {
  return (
    <svg aria-hidden="true" className="liquid-glass-filter-definitions" focusable="false">
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          height="200%"
          id="liquid-glass-distortion"
          width="200%"
          x="-50%"
          y="-50%"
        >
          <feTurbulence
            baseFrequency="0.05 0.05"
            numOctaves="1"
            result="turbulence"
            seed="1"
            type="fractalNoise"
          />
          <feGaussianBlur in="turbulence" result="blurredNoise" stdDeviation="2" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            result="displaced"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="B"
          />
          <feGaussianBlur in="displaced" stdDeviation="2" />
        </filter>
      </defs>
    </svg>
  )
}
