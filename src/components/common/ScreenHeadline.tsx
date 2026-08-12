type ScreenHeadlineProps = {
  align?: 'left' | 'center'
  className?: string
  headline: string | readonly string[]
  subtext: string
  variant?: 'lg' | 'md'
}

export default function ScreenHeadline({
  align = 'center',
  className = '',
  headline,
  subtext,
  variant = 'lg',
}: ScreenHeadlineProps) {
  const lines = Array.isArray(headline) ? headline : [headline]

  return (
    <div className={`stage-entry-headline stage-entry-headline--${align} stage-entry-headline--${variant} ${className}`.trim()}>
      <h1>
        {lines.map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}
      </h1>
      <p>{subtext}</p>
    </div>
  )
}
