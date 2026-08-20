import { forwardRef, useEffect, useId, useRef, useState } from 'react'
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

/**
 * 사진은 디코딩이 끝난 뒤 순서대로 나타난다. 슬롯 자체는 항상 자리에 있어서
 * 사진이 채워져도 레이아웃이 움직이지 않는다(스탬프가 붙는 연출).
 */
function CollagePhoto({ image, index = 0 }: CollageSlotProps) {
  const [isVisible, setIsVisible] = useState(false)
  const imageLoadVersion = useRef(0)

  useEffect(() => {
    imageLoadVersion.current += 1
    setIsVisible(false)
  }, [image?.imageUrl])

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
      // 여권 저장 시 html2canvas가 이 S3 이미지를 캔버스로 내보낼 수 있어야 한다.
      // 한 번만 로드하는 실제 표시용 이미지에 CORS 모드를 지정한다.
      crossOrigin="anonymous"
      decoding="async"
      onError={reveal}
      onLoad={(event) => { void event.currentTarget.decode().catch(() => undefined).then(reveal) }}
      src={image.imageUrl}
    />
  )
}

/** 제품 누끼 뒤에만 놓이는 우표 종이. SVG 마스크라 작은 카드에서도 톱니가 매끈하게 유지된다. */
function StampBackdrop() {
  const maskId = useId()
  const perforations = [4, 12, 20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 96]

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect fill="white" height="100" width="100" />
          {perforations.flatMap((position) => [
            <circle cx={position} cy="0" fill="black" key={`top-${position}`} r="2.35" />,
            <circle cx={position} cy="100" fill="black" key={`bottom-${position}`} r="2.35" />,
            <circle cx="0" cy={position} fill="black" key={`left-${position}`} r="2.35" />,
            <circle cx="100" cy={position} fill="black" key={`right-${position}`} r="2.35" />,
          ])}
        </mask>
      </defs>
      <rect fill="#fffefb" height="100" mask={`url(#${maskId})`} width="100" />
      <rect fill="none" height="95.5" mask={`url(#${maskId})`} stroke="#e4ddd4" strokeWidth="0.65" width="95.5" x="2.25" y="2.25" />
    </svg>
  )
}

function CollageSlot1({ image, index }: CollageSlotProps) {
  return (
    <div className="stage-b-journey-card-collage-slot absolute left-[23.35px] top-[62.32px] h-[109.541px] w-[78.075px] overflow-hidden">
      {image && <StampBackdrop />}
      <CollagePhoto image={image} index={index} />
    </div>
  )
}

function CollageSlot2({ image, index }: CollageSlotProps) {
  return (
    <div className="stage-b-journey-card-collage-slot absolute left-[86.68px] top-[25.53px] h-[70.178px] w-[58.191px] overflow-hidden">
      <CollagePhoto image={image} index={index} />
    </div>
  )
}

function CollageSlot3({ image, index }: CollageSlotProps) {
  return (
    <div className="stage-b-journey-card-collage-slot absolute left-[185.95px] top-[66.6px] h-[70.174px] w-[89.857px] overflow-hidden">
      {image && <StampBackdrop />}
      <CollagePhoto image={image} index={index} />
    </div>
  )
}

function CollageSlot4({ image, index }: CollageSlotProps) {
  return (
    <div className="stage-b-journey-card-collage-slot absolute left-[115.35px] top-[73px] h-[101.911px] w-[100.412px] overflow-hidden">
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
          className="stage-b-journey-card-completion-stamp pointer-events-none absolute left-[149.8px] top-[124.8px] h-39.5 w-37.5 object-contain"
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
