import cardTexture from '../../assets/images/stage-b-journey-card-texture.webp'
import emblemWatermark from '../../assets/images/stage-b-journey-card-emblem-watermark.webp'
import stampTexture from '../../assets/images/stage-b-journey-card-texture-overlay.webp'
import swatchPin from '../../assets/images/stage-b-journey-card-swatch-pin.svg'
import dividerFold from '../../assets/images/stage-b-journey-card-divider-fold.svg'
import dividerBottom1 from '../../assets/images/stage-b-journey-card-divider-bottom-1.svg'
import dividerBottom2 from '../../assets/images/stage-b-journey-card-divider-bottom-2.svg'

/**
 * B1 여권 카드의 "틀"에 해당하는 자산.
 * 콜라주 사진과 텍스트는 API 응답에 딸려 오므로 여기서 기다리지 않는다 —
 * 그건 카드가 채워지는 연출로 보여준다.
 */
const FRAME_ASSETS = [
  cardTexture,
  emblemWatermark,
  stampTexture,
  swatchPin,
  dividerFold,
  dividerBottom1,
  dividerBottom2,
] as const

let framePreload: Promise<void> | null = null

function decode(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    // 실패해도 화면 이동을 막지 않는다. 텍스처 한 장이 늦는 것보다 멈추는 게 나쁘다.
    image.onload = () => { void image.decode().catch(() => undefined).then(() => resolve()) }
    image.onerror = () => resolve()
    image.src = src
  })
}

/** 카드 틀 이미지를 모두 디코딩할 때까지 기다린다. 한 번 끝나면 결과를 재사용한다. */
export function preloadJourneyCardFrame(): Promise<void> {
  framePreload ??= Promise.all(FRAME_ASSETS.map(decode)).then(() => undefined)
  return framePreload
}
