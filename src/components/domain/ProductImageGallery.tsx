import { useRef, useState, type CSSProperties } from 'react'

type ProductImageGalleryProps = {
  images: readonly string[]
  /** 첫 장(대표 컷)의 대체 텍스트. 나머지는 여기에 순번을 붙인다. */
  alt: string
  className?: string
  imageClassName?: string
  imageStyle?: CSSProperties
  label?: string
}

/**
 * 대표 컷과 제품 상세 컷을 한 장씩 스냅 스크롤로 넘겨보는 공통 갤러리.
 * 이미지가 한 장뿐이면 기존 화면과 동일하게 단일 <img>로 렌더링한다.
 */
export function ProductImageGallery({
  images: sourceImages,
  alt,
  className = '',
  imageClassName = 'stage-c-primary-cutout',
  imageStyle,
  label,
}: ProductImageGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  // 대표 컷이 상세 컷 목록에도 들어있는 데이터가 오면 같은 key가 두 번 렌더된다.
  const images = [...new Set(sourceImages)]

  if (images.length === 0) return null

  if (images.length === 1) {
    return <img alt={alt} className={imageClassName} decoding="async" fetchPriority="high" src={images[0]} style={imageStyle} />
  }

  const syncActiveFromScroll = () => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setActiveIndex(Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / track.clientWidth))))
  }

  return (
    <div className={`stage-c-media-gallery ${className}`.trim()}>
      <div
        aria-label={label ?? `${alt} 이미지`}
        className="stage-c-media-gallery__track"
        onScroll={syncActiveFromScroll}
        ref={trackRef}
        role="region"
        tabIndex={0}
      >
        {images.map((image, index) => (
          <img
            alt={index === 0 ? alt : `${alt} ${index + 1}번째 이미지`}
            className={imageClassName}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'auto'}
            key={image}
            loading={index === 0 ? 'eager' : 'lazy'}
            src={image}
            style={imageStyle}
          />
        ))}
      </div>
      <span aria-label={`${activeIndex + 1}번째 이미지, 전체 ${images.length}개`} className="stage-c-gallery-dots stage-c-media-dots">
        {images.map((image, index) => <i aria-hidden="true" className={index === activeIndex ? 'is-active' : ''} key={image} />)}
      </span>
    </div>
  )
}
