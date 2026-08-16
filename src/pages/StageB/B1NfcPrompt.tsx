import { useEffect, useState, type KeyboardEvent } from 'react'
import cardTexture from '../../assets/images/stage-b-journey-card-texture.png'
import emblemWatermark from '../../assets/images/stage-b-journey-card-emblem-watermark.png'
import stampTexture from '../../assets/images/stage-b-journey-card-texture-overlay.png'
import swatchPin from '../../assets/images/stage-b-journey-card-swatch-pin.svg'
import dividerFold from '../../assets/images/stage-b-journey-card-divider-fold.svg'
import dividerBottom1 from '../../assets/images/stage-b-journey-card-divider-bottom-1.svg'
import dividerBottom2 from '../../assets/images/stage-b-journey-card-divider-bottom-2.svg'
import type { JourneyCardResponse } from '../../api/journeyCard'
import { formatJourneyCardDate } from '../../api/journeyCard'
import PrimaryButton from '../../components/common/PrimaryButton'
import ScreenHeadline from '../../components/common/ScreenHeadline'
import { markDocentReady } from '../../features/docent/docentReadiness'

type B1NfcPromptProps = {
  buttonLabel?: string
  headline?: readonly string[]
  isOverlayOpen?: boolean
  journeyCard: JourneyCardResponse | null
  onCallStaff: () => void
  onNfcDetected: () => void
  subtext?: string
}

// ScreenHeadline은 headline 배열의 참조가 바뀌면 서브텍스트 노출 상태를 리셋한다.
// 기본 파라미터로 배열 리터럴을 쓰면 journeyCard 갱신 등으로 리렌더될 때마다 새 배열이
// 생성되어 서브텍스트가 다시 숨겨지므로, 모듈 스코프 상수로 참조를 고정한다.
const DEFAULT_HEADLINE = ['여권을 마음에 드는 제품으로', '채워보세요!'] as const

// 여권 카드 안 콜라주 사진 4칸의 위치·크기 (Figma 디자인 기준 고정값).
// collageImages는 최대 5장까지 올 수 있지만 디자인상 슬롯은 4칸뿐이라 5번째는 표시되지 않는다.
type CollageSlotProps = { image?: { imageUrl: string; shotType: string } }

function CollageSlot1({ image }: CollageSlotProps) {
  return (
    <div className="absolute left-[23.35px] top-[62.32px] h-[109.541px] w-[78.075px] overflow-hidden border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0.856px_3.423px_0px_rgba(0,0,0,0.18)]">
      {image && <img alt="" className="size-full object-cover" src={image.imageUrl} />}
    </div>
  )
}

function CollageSlot2({ image }: CollageSlotProps) {
  return (
    <div className="absolute left-[86.68px] top-[25.53px] h-[70.178px] w-[58.191px] overflow-hidden border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0px_3.423px_0px_rgba(0,0,0,0.25)]">
      {image && <img alt="" className="size-full object-cover" src={image.imageUrl} />}
    </div>
  )
}

function CollageSlot3({ image }: CollageSlotProps) {
  return (
    <div className="absolute left-[185.95px] top-[66.6px] h-[70.174px] w-[89.857px] overflow-hidden border-[0.838px] border-dashed border-[#beafad] shadow-[0px_0px_3.423px_0px_rgba(0,0,0,0.13)]">
      {image && <img alt="" className="size-full object-cover" src={image.imageUrl} />}
    </div>
  )
}

function CollageSlot4({ image }: CollageSlotProps) {
  return (
    <div className="absolute left-[115.35px] top-[73px] h-[101.911px] w-[100.412px] overflow-hidden border-[0.713px] border-dashed border-[#beafad]">
      {image && <img alt="" className="size-full object-cover" src={image.imageUrl} />}
    </div>
  )
}

function JourneyPassportCard({ journeyCard }: { journeyCard: JourneyCardResponse | null }) {
  const images = journeyCard?.collageImages ?? []
  const brand = journeyCard?.brand ?? '—'
  const date = journeyCard ? formatJourneyCardDate(journeyCard.date) : '—'
  const nickname = journeyCard?.nickname || '—'
  const sessionCode = journeyCard?.sessionCode ?? '—'

  return (
    <div className="relative mx-auto h-[407.7px] w-[299.7px] shrink-0 drop-shadow-[0px_3.6px_24px_rgba(0,0,0,0.93)]">
      <img alt="" className="absolute inset-0 size-full rounded-[18px] object-cover" src={cardTexture} />

      <CollageSlot1 image={images[0]} />
      <CollageSlot2 image={images[1]} />
      <CollageSlot3 image={images[2]} />
      <CollageSlot4 image={images[3]} />

      <img alt="MCM" className="pointer-events-none absolute left-[218.7px] top-[10.8px] h-[46.8px] w-[60.911px] object-contain opacity-27 mix-blend-multiply" src={emblemWatermark} />

      {/* 서명 컬러 스와치 — journey-card API에 색상 필드가 없어 디자인 그대로 고정값으로 둔다 */}
      <div className="absolute left-[28.8px] top-[236.7px] h-[110.7px] w-[83.7px] bg-[#ab6730]" />
      <img alt="" className="absolute left-[56.7px] top-[222.3px] size-[25.2px]" src={swatchPin} />
      <p className="absolute left-[38.7px] top-[308.7px] whitespace-nowrap text-[8.1px] text-white">Cognac</p>
      <p className="absolute left-[38.7px] top-[321.3px] whitespace-nowrap text-[6.3px] font-extralight text-white">signiture color</p>

      <img alt="" className="pointer-events-none absolute left-[23.4px] top-[169.2px] h-[14.648px] w-[44.292px] object-cover opacity-51" src={stampTexture} />

      <p className="absolute left-[133.2px] top-[236.7px] whitespace-nowrap font-mono text-[10.8px] font-bold text-black">BRAND</p>
      <p className="absolute left-[133.2px] top-[268.2px] whitespace-nowrap font-mono text-[10.8px] font-bold text-black">DATE</p>
      <p className="absolute left-[133.2px] top-[299.7px] whitespace-nowrap font-mono text-[10.8px] font-bold text-black">NICKNAME</p>
      <p className="absolute left-[133.2px] top-[331.2px] whitespace-nowrap font-mono text-[10.8px] font-bold text-black">SESSION</p>

      <p className="absolute left-[190.8px] top-[236.7px] max-w-[80px] truncate whitespace-nowrap font-mono text-[10.8px] text-black">{brand}</p>
      <p className="absolute left-[190.8px] top-[268.2px] whitespace-nowrap font-mono text-[10.8px] text-black">{date}</p>
      <p className="absolute left-[190.8px] top-[299.7px] max-w-[80px] truncate whitespace-nowrap font-mono text-[10.8px] text-black">{nickname}</p>
      <p className="absolute left-[190.8px] top-[331.2px] whitespace-nowrap font-mono text-[10.8px] text-black">{sessionCode}</p>

      <img alt="" className="pointer-events-none absolute left-[-9px] top-[184px] w-[318px]" src={dividerFold} />
      <img alt="" className="pointer-events-none absolute left-0 top-[382px] w-[300px]" src={dividerBottom1} />
      <img alt="" className="pointer-events-none absolute left-0 top-[394.5px] w-[297px]" src={dividerBottom2} />
    </div>
  )
}

export default function B1NfcPrompt({
  buttonLabel = '직원 호출',
  headline = DEFAULT_HEADLINE,
  isOverlayOpen = false,
  journeyCard,
  onCallStaff,
  onNfcDetected,
  subtext = '휴대폰을 태그에 가까이 대보세요',
}: B1NfcPromptProps) {
  const [areActionsVisible, setAreActionsVisible] = useState(false)

  // 이 화면엔 도슨트가 없어서(App.tsx), 텍스트 리빌이 "도슨트 준비완료" 신호를 기다리다
  // 화면마다 2.5초 세이프티 타이머에 의존해 누적 지연되는 걸 막기 위해 즉시 신호를 보낸다.
  useEffect(() => {
    markDocentReady()
  }, [])

  const tapOnKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onNfcDetected()
  }

  return (
    <main className="stage-entry-page stage-entry-page--stage-b stage-entry-page--nfc">
      <div className="stage-entry-content stage-entry-content--nfc">
        <div
          aria-label="화면을 누르면 태그를 인식합니다"
          className="flex flex-1 flex-col items-center justify-center gap-4"
          onClick={onNfcDetected}
          onKeyDown={tapOnKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className="stage-b-journey-card-stage">
            <div className={`stage-b-journey-card-fold${isOverlayOpen ? ' stage-b-journey-card-fold--closed' : ''}`}>
              <JourneyPassportCard journeyCard={journeyCard} />
            </div>
          </div>
          <ScreenHeadline className="stage-entry-nfc-headline" headline={headline} onRevealComplete={() => setAreActionsVisible(true)} reveal subtext={subtext} variant="md" />
        </div>
        {areActionsVisible && <div className="stage-entry-actions stage-entry-actions--nfc">
          <PrimaryButton className="stage-b-staff-call-button" label={buttonLabel} onClick={onCallStaff} />
        </div>}
      </div>
    </main>
  )
}
