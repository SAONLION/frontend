type ImageFrameProps = {
  alt: string
  className?: string
  src: string
}

export default function ImageFrame({ alt, className = '', src }: ImageFrameProps) {
  return (
    <div className={`stage-entry-image-frame ${className}`.trim()}>
      <img alt={alt} src={src} />
    </div>
  )
}
