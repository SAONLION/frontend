import { forwardRef, useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!image) return
    let cancelled = false
    const element = new Image()
    element.decoding = 'async'
    const reveal = () => {
      if (cancelled) return
      window.setTimeout(() => { if (!cancelled) setIsVisible(true) }, index * 110)
    }
    element.onload = () => { void element.decode().catch(() => undefined).then(reveal) }
    element.onerror = reveal
    element.src = image.imageUrl

    return () => { cancelled = true }
  }, [image, index])

  if (!image) return null

  return (
    <img
      alt=""
      className={`stage-b-journey-card-photo${isVisible ? ' stage-b-journey-card-photo--visible' : ''} size-full object-cover mix-blend-multiply`}
      src={image.imageUrl}
    />
  )
}

function CollageSlot1({ image, index }: CollageSlotProps) {
  return (
    <div className={`absolute left-[23.35px] top-[62.32px] h-[109.541px] w-[78.075px] overflow-hidden border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0.856px_3.423px_0px_rgba(0,0,0,0.18)]${image ? ' bg-white' : ''}`}>
      <CollagePhoto image={image} index={index} />
    </div>
  )
}

function CollageSlot2({ image, index }: CollageSlotProps) {
  return (
    <div className="absolute left-[86.68px] top-[25.53px] h-[70.178px] w-[58.191px] overflow-hidden border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0px_3.423px_0px_rgba(0,0,0,0.25)]">
      <CollagePhoto image={image} index={index} />
    </div>
  )
}

function CollageSlot3({ image, index }: CollageSlotProps) {
  return (
    <div className={`absolute left-[185.95px] top-[66.6px] h-[70.174px] w-[89.857px] overflow-hidden border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0px_3.423px_0px_rgba(0,0,0,0.13)]${image ? ' bg-white' : ''}`}>
      <CollagePhoto image={image} index={index} />
    </div>
  )
}

function CollageSlot4({ image, index }: CollageSlotProps) {
  return (
    <div className="absolute left-[115.35px] top-[73px] h-[101.911px] w-[100.412px] overflow-hidden border-[0.713px] border-dashed border-[#beafad] shadow-[0px_0px_3.423px_0px_rgba(0,0,0,0.18)]">
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
  const favoriteColorLabel = favoriteColor?.label ?? '—'
  const favoriteColorSwatch = getFavoriteColorSwatch(favoriteColor?.code, favoriteColor?.label)

  const isLoaded = journeyCard !== null
  // 4칸이 다 채워졌을 때만 "쾅" 찍히는 완성 도장을 보여준다.
  const isComplete = images.filter((image) => image !== undefined).length >= JOURNEY_CARD_COLLAGE_SLOTS

  return (
    <div
      className={`stage-b-journey-card${isLoaded ? ' stage-b-journey-card--loaded' : ''} relative mx-auto h-[407.7px] w-[299.7px] shrink-0 drop-shadow-[0px_3.6px_24px_rgba(0,0,0,0.93)]`}
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

      <div className="absolute left-[28.8px] top-[236.7px] h-[110.7px] w-[83.7px]" style={{ backgroundColor: favoriteColorSwatch }} />
      <img alt="" className="absolute left-[56.7px] top-[222.3px] size-[25.2px]" src={swatchPin} />
      <p className="absolute left-[38.7px] top-[308.7px] max-w-[60px] truncate whitespace-nowrap text-[8.1px] text-white">{favoriteColorLabel}</p>
      <p className="absolute left-[38.7px] top-[321.3px] whitespace-nowrap text-[6.3px] font-extralight text-white">favorite color</p>

      <img alt="" className="pointer-events-none absolute left-[23.4px] top-[169.2px] h-[14.648px] w-[44.292px] object-cover opacity-51" src={stampTexture} />

      <p className="absolute left-[133.2px] top-[236.7px] whitespace-nowrap font-mono text-[10.8px] font-bold text-black">BRAND</p>
      <p className="absolute left-[133.2px] top-[268.2px] whitespace-nowrap font-mono text-[10.8px] font-bold text-black">DATE</p>
      <p className="absolute left-[133.2px] top-[299.7px] whitespace-nowrap font-mono text-[10.8px] font-bold text-black">NAME</p>
      <p className="absolute left-[133.2px] top-[331.2px] whitespace-nowrap font-mono text-[10.8px] font-bold text-black">SESSION</p>

      <p className="stage-b-journey-card-value absolute left-[190.8px] top-[236.7px] max-w-[80px] truncate whitespace-nowrap font-mono text-[10.8px] text-black">{brand}</p>
      <p className="stage-b-journey-card-value absolute left-[190.8px] top-[268.2px] whitespace-nowrap font-mono text-[10.8px] text-black">{date}</p>
      <p className="stage-b-journey-card-value absolute left-[190.8px] top-[299.7px] max-w-[80px] truncate whitespace-nowrap font-mono text-[10.8px] text-black">{nickname}</p>
      <p className="stage-b-journey-card-value absolute left-[190.8px] top-[331.2px] whitespace-nowrap font-mono text-[10.8px] text-black">{sessionCode}</p>

      <img alt="" className="pointer-events-none absolute left-[-9px] top-[184px] w-[318px]" src={dividerFold} />
      <img alt="" className="pointer-events-none absolute left-0 top-[382px] w-[300px]" src={dividerBottom1} />
      <img alt="" className="pointer-events-none absolute left-0 top-[394.5px] w-[297px]" src={dividerBottom2} />
    </div>
  )
})
