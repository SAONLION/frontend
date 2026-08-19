import { useRef, useState, type CSSProperties, type WheelEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type ProductCoverflowProps = {
  alt: string
  images: readonly string[]
  imageClassName?: string
  imageStyle?: CSSProperties
  label?: string
  variant: 'product' | 'styling'
}

/**
 * 투명 누끼 제품 컷을 위한 작은 Cover Flow 갤러리.
 * 카드 표면을 아주 옅은 글래스로 만들어, 이미지 바깥의 투명 영역도 화면에서 사라지지 않게 한다.
 */
export function ProductCoverflow({
  alt,
  images: sourceImages,
  imageClassName,
  imageStyle,
  label,
  variant,
}: ProductCoverflowProps) {
  const images = [...new Set(sourceImages)]
  const [activeIndex, setActiveIndex] = useState(0)
  const wheelDistance = useRef(0)
  const lastWheelMoveAt = useRef(0)
  const reducedMotion = useReducedMotion()

  if (images.length === 0) return null

  if (images.length === 1) {
    return <img alt={alt} className={`stage-c-coverflow__single-image stage-c-coverflow__single-image--${variant} ${imageClassName ?? ''}`.trim()} decoding="async" fetchPriority="high" src={images[0]} style={imageStyle} />
  }

  const select = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(images.length - 1, index)))
  }

  const moveWithWheel = (event: WheelEvent<HTMLDivElement>) => {
    // 트랙패드의 가로 제스처와 Shift + 휠을 이미지 탐색으로 쓴다.
    // 일반 세로 스크롤은 이 화면의 본문 스크롤을 계속 쓸 수 있게 그대로 둔다.
    const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.shiftKey ? event.deltaY : 0
    if (horizontalDelta === 0) return

    event.preventDefault()
    if (Date.now() - lastWheelMoveAt.current < 240) {
      wheelDistance.current = 0
      return
    }
    wheelDistance.current += horizontalDelta
    // 트랙패드의 잔여 관성으로 한 번의 스와이프가 여러 장을 넘기지 않게 한다.
    if (Math.abs(wheelDistance.current) < 176) return

    select(activeIndex + (wheelDistance.current > 0 ? 1 : -1))
    wheelDistance.current = 0
    lastWheelMoveAt.current = Date.now()
  }

  return (
    <section
      aria-label={label ?? `${alt} 제품 이미지`}
      aria-roledescription="carousel"
      className={`stage-c-coverflow stage-c-coverflow--${variant}`}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          select(activeIndex - 1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          select(activeIndex + 1)
        }
      }}
      tabIndex={0}
    >
      <div className={`stage-c-coverflow__viewport stage-c-coverflow__viewport--${variant}`} onWheelCapture={moveWithWheel}>
        {images.map((image, index) => {
          const distance = index - activeIndex
          const isActive = distance === 0

          return (
            <motion.button
              animate={{
                // `blur(0px)`도 브라우저에는 별도 필터 합성 레이어로 취급될 수 있다.
                // 선택 컷은 원본을 그대로 그리도록 필터를 완전히 제거한다.
                filter: isActive ? 'none' : 'blur(1.5px)',
                opacity: Math.abs(distance) > 2 ? 0 : isActive ? 1 : 0.4,
                rotateY: reducedMotion ? 0 : -distance * 34,
                scale: reducedMotion ? (isActive ? 1 : 0.9) : isActive ? 1 : 0.78,
                x: distance * 116,
                z: reducedMotion || isActive ? 0 : -80,
              }}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`${index + 1}번째 이미지 보기`}
              className={`stage-c-coverflow__card stage-c-coverflow__card--${variant}${isActive ? ' is-active' : ''}`}
              drag={reducedMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              key={image}
              onClick={() => select(index)}
              onDragEnd={(_, info) => {
                if (info.offset.x < -164 || info.velocity.x < -1520) select(activeIndex + 1)
                if (info.offset.x > 164 || info.velocity.x > 1520) select(activeIndex - 1)
              }}
              style={{ zIndex: images.length - Math.abs(distance) }}
              transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.95 }}
              type="button"
            >
              <img
                alt={index === 0 ? alt : `${alt} ${index + 1}번째 이미지`}
                className={imageClassName}
                decoding="async"
                draggable={false}
                loading={index === activeIndex ? 'eager' : 'lazy'}
                src={image}
                style={imageStyle}
              />
            </motion.button>
          )
        })}
      </div>
      <span aria-label={`${activeIndex + 1}번째 이미지, 전체 ${images.length}개`} aria-live="polite" className="stage-c-gallery-dots stage-c-coverflow__indicators">
        {images.map((image, index) => <i aria-hidden="true" className={index === activeIndex ? 'is-active' : ''} key={image} />)}
      </span>
    </section>
  )
}
