import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import cardTexture from '../../assets/images/stage-b-journey-card-texture.webp'
import emblemWatermark from '../../assets/images/stage-b-journey-card-emblem-watermark.webp'
import stampTexture from '../../assets/images/stage-b-journey-card-texture-overlay.webp'
import swatchPin from '../../assets/images/stage-b-journey-card-swatch-pin.svg'
import dividerFold from '../../assets/images/stage-b-journey-card-divider-fold.svg'
import dividerBottom1 from '../../assets/images/stage-b-journey-card-divider-bottom-1.svg'
import dividerBottom2 from '../../assets/images/stage-b-journey-card-divider-bottom-2.svg'
import completionStamp from '../../assets/images/stage-b-journey-card-completion-stamp.webp'
import type { JourneyCardCollageImage, JourneyCardResponse } from '../../api/journeyCard'
import { formatJourneyCardDate, JOURNEY_CARD_COLLAGE_SLOTS } from '../../api/journeyCard'

// 여권 카드 안 콜라주 사진 4칸의 위치·크기 (Figma 디자인 기준 고정값).
// 서버도 최대 4장까지만 만든다(모델샷 1장 + 제품샷으로 채움). 슬롯 수와 일치하므로 잘리는 사진은 없다.
type CollageSlotProps = { image?: { imageUrl: string; shotType: string }; index?: number }

// 우표 가장자리의 반원 홈. 슬롯의 실제 픽셀 길이 기준으로 네 변의 간격을 맞춘다.
const STAMP_PERFORATION_RADIUS = 4.2
// 두 반원 사이의 빈 폭을 최소 반지름만큼 남긴다: 중심 간격 = 지름 + 반지름.
const STAMP_PERFORATION_SPACING = STAMP_PERFORATION_RADIUS * 3

type StampDimensions = { width: number; height: number }

const COLLAGE_SLOT_1: StampDimensions = { width: 78.075, height: 109.541 }
const COLLAGE_SLOT_2: StampDimensions = { width: 58.191, height: 70.178 }
const COLLAGE_SLOT_3: StampDimensions = { width: 89.857, height: 70.174 }

function getStampPerforationPositions(length: number): readonly number[] {
  // 모서리 → 반원 시작점의 빈 공간을 반지름만큼 둔다.
  // 따라서 첫·마지막 반원의 중심은 각각 양 끝에서 2r 떨어진다.
  const edgeCenterOffset = STAMP_PERFORATION_RADIUS * 2
  const usableLength = length - edgeCenterOffset * 2
  if (usableLength <= 0) return [length / 2]

  const count = Math.max(2, Math.floor(usableLength / STAMP_PERFORATION_SPACING) + 1)
  const spacing = usableLength / (count - 1)
  return Array.from({ length: count }, (_, index) => edgeCenterOffset + index * spacing)
}

const FAVORITE_COLOR_SWATCHES: Record<string, string> = {
  BLACK: '#242424',
  BEIGE: '#d6c3a6',
  COGNAC: '#9a5828',
  CINNAMON: '#874837',
  WHITE: '#ece9df',
  SOFT_PINK: '#dca3a0',
  PINK: '#dca3a0',
}

function toFavoriteColorKey(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function getFavoriteColorSwatch(code: string | undefined, label: string | undefined): string {
  const key = [code, label].find((value): value is string => Boolean(value && FAVORITE_COLOR_SWATCHES[toFavoriteColorKey(value)]))
  return key ? FAVORITE_COLOR_SWATCHES[toFavoriteColorKey(key)] : '#ab6730'
}

function getContrastTextColor(hex: string): '#1e1710' | '#ffffff' {
  const normalized = hex.replace('#', '')
  const channels = normalized.length === 3
    ? normalized.split('').map((channel) => Number.parseInt(`${channel}${channel}`, 16))
    : [normalized.slice(0, 2), normalized.slice(2, 4), normalized.slice(4, 6)].map((channel) => Number.parseInt(channel, 16))
  const [red, green, blue] = channels
  // 상대 휘도 기준. 밝은 베이지·핑크는 진한 글자, 어두운 가죽색은 흰 글자를 쓴다.
  const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255
  return luminance > 0.5 ? '#1e1710' : '#ffffff'
}

/**
 * 카드의 가장 왼쪽 슬롯 A는 모델컷 전용이다. 상품컷은 B·C·D만 채운다.
 * 모델컷이 없는 제품에서는 A를 비워, 제품컷이 모델컷 영역으로 섞이지 않게 한다.
 */
function arrangeCollageImages(images: readonly JourneyCardCollageImage[]): readonly (JourneyCardCollageImage | undefined)[] {
  const primaryModel = images.find((image) => image.shotType === 'MODEL')
  const productShots = images.filter((image) => image.shotType === 'PRODUCT')
  return [primaryModel, ...productShots].slice(0, JOURNEY_CARD_COLLAGE_SLOTS)
}

function withJourneyCorsCacheBust(imageUrl: string): string {
  const separator = imageUrl.includes('?') ? '&' : '?'
  // C 화면이 먼저 no-CORS로 가져온 원본 URL의 HTTP 캐시와 절대 섞이지 않게 한다.
  // 같은 여권을 여는 동안에는 URL을 고정하고, 새로 열면 새 CORS 응답을 받는다.
  return `${imageUrl}${separator}__journey_cors=${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * 사진은 디코딩이 끝난 뒤 순서대로 나타난다. 슬롯 자체는 항상 자리에 있어서
 * 사진이 채워져도 레이아웃이 움직이지 않는다(스탬프가 붙는 연출).
 */
function CollagePhoto({ image, index = 0 }: CollageSlotProps) {
  const [isVisible, setIsVisible] = useState(false)
  const imageLoadVersion = useRef(0)
  const imageElementRef = useRef<HTMLImageElement>(null)
  const imageUrl = image?.imageUrl
  const corsImageUrl = useMemo(() => imageUrl ? withJourneyCorsCacheBust(imageUrl) : undefined, [imageUrl])

  useEffect(() => {
    imageLoadVersion.current += 1
    setIsVisible(false)
    const element = imageElementRef.current
    if (!corsImageUrl || !element) return

    // `crossOrigin`을 src보다 먼저 지정하고, C 화면의 일반 이미지 캐시와 분리된 URL을 쓴다.
    element.crossOrigin = 'anonymous'
    element.src = corsImageUrl
  }, [corsImageUrl])

  if (!image) return null

  const reveal = () => {
    const loadVersion = imageLoadVersion.current
    window.setTimeout(() => {
      // 슬롯 이미지가 바뀐 뒤 이전 로드 이벤트가 늦게 도착해 새 사진을 먼저 보이게 하지 않는다.
      if (imageLoadVersion.current === loadVersion) setIsVisible(true)
    }, index * 110)
  }

  return (
    <img
      alt=""
      className={`stage-b-journey-card-photo${isVisible ? ' stage-b-journey-card-photo--visible' : ''} size-full object-contain object-center mix-blend-multiply`}
      decoding="async"
      onError={reveal}
      onLoad={(event) => { void event.currentTarget.decode().catch(() => undefined).then(reveal) }}
      ref={imageElementRef}
    />
  )
}

/** 제품 누끼 뒤에만 놓이는 우표 종이. SVG 마스크라 작은 카드에서도 톱니가 매끈하게 유지된다. */
function StampBackdrop({ fill = '#fffefb', width, height }: { fill?: string } & StampDimensions) {
  const maskId = useId()
  const horizontalPerforations = getStampPerforationPositions(width)
  const verticalPerforations = getStampPerforationPositions(height)

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
          <rect fill="white" height={height} width={width} />
          {horizontalPerforations.flatMap((position) => [
            <circle cx={position} cy="0" fill="black" key={`top-${position}`} r={STAMP_PERFORATION_RADIUS} />,
            <circle cx={position} cy={height} fill="black" key={`bottom-${position}`} r={STAMP_PERFORATION_RADIUS} />,
          ])}
          {verticalPerforations.flatMap((position) => [
            <circle cx="0" cy={position} fill="black" key={`left-${position}`} r={STAMP_PERFORATION_RADIUS} />,
            <circle cx={width} cy={position} fill="black" key={`right-${position}`} r={STAMP_PERFORATION_RADIUS} />,
          ])}
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <rect fill={fill} height={height} width={width} />
      </g>
    </svg>
  )
}

/** 사진 아래의 진한 림과 분리된, 우표 톱니 전체를 따르는 얇은 외곽선이다. */
function StampOutline({ width, height }: StampDimensions) {
  const horizontalPerforations = getStampPerforationPositions(width)
  const verticalPerforations = getStampPerforationPositions(height)
  const radius = STAMP_PERFORATION_RADIUS
  const topEdge = horizontalPerforations.reduce((path, position) => `${path} H${position - radius} A${radius} ${radius} 0 0 0 ${position + radius} 0`, 'M0 0') + ` H${width}`
  const bottomEdge = horizontalPerforations.reduce((path, position) => `${path} H${position - radius} A${radius} ${radius} 0 0 1 ${position + radius} ${height}`, `M0 ${height}`) + ` H${width}`
  const leftEdge = verticalPerforations.reduce((path, position) => `${path} V${position - radius} A${radius} ${radius} 0 0 1 0 ${position + radius}`, 'M0 0') + ` V${height}`
  const rightEdge = verticalPerforations.reduce((path, position) => `${path} V${position - radius} A${radius} ${radius} 0 0 0 ${width} ${position + radius}`, `M${width} 0`) + ` V${height}`

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-1 size-full" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      {[topEdge, bottomEdge, leftEdge, rightEdge].map((path) => (
        <path
          d={path}
          fill="none"
          key={path}
          stroke="#e1dfdc"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeWidth="0.9"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

function CollageSlot1({ image, index }: CollageSlotProps) {
  return (
    <div className={`stage-b-journey-card-collage-slot absolute z-10 isolate left-[23.35px] top-[62.32px] h-[109.541px] w-[78.075px] overflow-hidden${image ? '' : ' border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0.856px_3.423px_0px_rgba(0,0,0,0.18)]'}`}>
      {image && <StampBackdrop {...COLLAGE_SLOT_1} />}
      <CollagePhoto image={image} index={index} />
      {image && <StampOutline {...COLLAGE_SLOT_1} />}
    </div>
  )
}

function CollageSlot2({ image, index }: CollageSlotProps) {
  return (
    <div className={`stage-b-journey-card-collage-slot absolute z-30 isolate left-[86.68px] top-[25.53px] h-[70.178px] w-[58.191px] overflow-hidden${image ? '' : ' border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0px_3.423px_0px_rgba(0,0,0,0.25)]'}`}>
      {image && <StampBackdrop {...COLLAGE_SLOT_2} fill="#e5e5e3" />}
      <CollagePhoto image={image} index={index} />
      {image && <StampOutline {...COLLAGE_SLOT_2} />}
    </div>
  )
}

function CollageSlot3({ image, index }: CollageSlotProps) {
  return (
    <div className={`stage-b-journey-card-collage-slot absolute z-20 isolate left-[185.95px] top-[66.6px] h-[70.174px] w-[89.857px] overflow-hidden${image ? '' : ' border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0px_3.423px_0px_rgba(0,0,0,0.13)]'}`}>
      {image && <StampBackdrop {...COLLAGE_SLOT_3} />}
      <CollagePhoto image={image} index={index} />
      {image && <StampOutline {...COLLAGE_SLOT_3} />}
    </div>
  )
}

function CollageSlot4({ image, index }: CollageSlotProps) {
  return (
    <div className={`stage-b-journey-card-collage-slot absolute z-30 isolate left-[115.35px] top-[73px] h-[101.911px] w-[100.412px] overflow-hidden${image ? '' : ' border-[0.713px] border-dashed border-[#beafad] shadow-[0px_0px_3.423px_0px_rgba(0,0,0,0.18)]'}`}>
      <CollagePhoto image={image} index={index} />
    </div>
  )
}

type JourneyPassportCardProps = {
  journeyCard: JourneyCardResponse | null
}

export const JourneyPassportCard = forwardRef<HTMLDivElement, JourneyPassportCardProps>(function JourneyPassportCard(
  { journeyCard },
  ref,
) {
  const images = arrangeCollageImages(journeyCard?.collageImages ?? [])
  const brand = journeyCard?.brand ?? '—'
  const date = journeyCard ? formatJourneyCardDate(journeyCard.date) : '—'
  const nickname = journeyCard?.nickname || '—'
  const sessionCode = journeyCard?.sessionCode ?? '—'
  const favoriteColor = journeyCard?.favoriteColor
  const favoriteColorSwatch = favoriteColor ? getFavoriteColorSwatch(favoriteColor.code, favoriteColor.label) : undefined
  const favoriteColorTextColor = favoriteColorSwatch ? getContrastTextColor(favoriteColorSwatch) : undefined

  const isLoaded = journeyCard !== null
  // 4칸이 다 채워졌을 때만 "쾅" 찍히는 완성 도장을 보여준다.
  const isComplete = images.filter((image) => image !== undefined).length >= JOURNEY_CARD_COLLAGE_SLOTS

  return (
    <div
      className={`stage-b-journey-card${isLoaded ? ' stage-b-journey-card--loaded' : ''} relative mx-auto h-[407.7px] w-[299.7px] shrink-0`}
      ref={ref}
    >
      <img alt="" className="absolute inset-0 size-full rounded-[18px] object-cover" src={cardTexture} />

      <CollageSlot1 image={images[0]} index={0} />
      <CollageSlot2 image={images[1]} index={1} />
      <CollageSlot3 image={images[2]} index={2} />
      <CollageSlot4 image={images[3]} index={3} />

      {isComplete && (
        <img
          alt="완성 도장"
          className="stage-b-journey-card-completion-stamp pointer-events-none absolute z-40 left-[149.8px] top-[124.8px] h-39.5 w-37.5 object-contain"
          src={completionStamp}
        />
      )}

      <img alt="MCM" className="pointer-events-none absolute left-[218.7px] top-[10.8px] h-[46.8px] w-[60.911px] object-contain opacity-27 mix-blend-multiply" src={emblemWatermark} />

      {favoriteColor && (
        <>
          <div className="absolute left-[28.8px] top-[236.7px] h-[110.7px] w-[83.7px]" style={{ backgroundColor: favoriteColorSwatch }} />
          <img alt="" className="absolute left-[56.7px] top-[222.3px] size-[25.2px]" src={swatchPin} />
          <p className="absolute left-[38.7px] top-[308.7px] max-w-[60px] truncate whitespace-nowrap text-[8.1px]" style={{ color: favoriteColorTextColor }}>{favoriteColor.label}</p>
          <p className="absolute left-[38.7px] top-[321.3px] whitespace-nowrap text-[6.3px] font-extralight" style={{ color: favoriteColorTextColor }}>favorite color</p>
        </>
      )}

      <img alt="" className="pointer-events-none absolute left-[23.4px] top-[169.2px] h-[14.648px] w-[44.292px] object-cover opacity-51" src={stampTexture} />

      <p className="stage-b-journey-card-passport-text absolute left-[133.2px] top-[236.7px] whitespace-nowrap text-[10.8px] font-bold text-black">BRAND</p>
      <p className="stage-b-journey-card-passport-text absolute left-[133.2px] top-[268.2px] whitespace-nowrap text-[10.8px] font-bold text-black">DATE</p>
      <p className="stage-b-journey-card-passport-text absolute left-[133.2px] top-[299.7px] whitespace-nowrap text-[10.8px] font-bold text-black">NAME</p>
      <p className="stage-b-journey-card-passport-text absolute left-[133.2px] top-[331.2px] whitespace-nowrap text-[10.8px] font-bold text-black">SESSION</p>

      <p className="stage-b-journey-card-passport-text stage-b-journey-card-value absolute left-[190.8px] top-[236.7px] max-w-[80px] truncate whitespace-nowrap text-[10.8px] text-black">{brand}</p>
      <p className="stage-b-journey-card-passport-text stage-b-journey-card-value absolute left-[190.8px] top-[268.2px] whitespace-nowrap text-[10.8px] text-black">{date}</p>
      <p className="stage-b-journey-card-passport-text stage-b-journey-card-value absolute left-[190.8px] top-[299.7px] max-w-[80px] truncate whitespace-nowrap text-[10.8px] text-black">{nickname}</p>
      <p className="stage-b-journey-card-passport-text stage-b-journey-card-value absolute left-[190.8px] top-[331.2px] whitespace-nowrap text-[10.8px] text-black">{sessionCode}</p>

      <img alt="" className="pointer-events-none absolute left-[-9px] top-[184px] w-[318px]" src={dividerFold} />
      <img alt="" className="pointer-events-none absolute left-0 top-[382px] w-[300px]" src={dividerBottom1} />
      <img alt="" className="pointer-events-none absolute left-0 top-[394.5px] w-[297px]" src={dividerBottom2} />
    </div>
  )
})
