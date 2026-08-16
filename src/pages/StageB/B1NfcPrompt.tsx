import { useEffect, useState, type KeyboardEvent } from 'react'
import type { JourneyCardResponse } from '../../api/journeyCard'
import { JourneyPassportCard } from '../../components/domain/JourneyPassportCard'
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
          className="flex flex-1 flex-col items-center"
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
          {/* 문구는 카드와 버튼 사이 남는 공간의 정중앙에 온다.
              등장 순서는 위에서 아래로: 카드 → 메인 문구 → 보조 문구 → 버튼. */}
          <div className="stage-b-journey-card-headline-slot">
          <ScreenHeadline
            className="stage-entry-nfc-headline"
            headline={headline}
            onSubtextRevealComplete={() => setAreActionsVisible(true)}
            reserveSubtextSpace
            reveal
            subtext={subtext}
            variant="md"
          />
          </div>
        </div>
        {/* 버튼이 뜨기 전에는 같은 높이의 빈 자리가 대신 들어가 레이아웃이 움직이지 않는다. */}
        <div className="stage-entry-actions stage-entry-actions--nfc">
          {areActionsVisible
            ? <PrimaryButton className="stage-b-staff-call-button" label={buttonLabel} onClick={onCallStaff} />
            : <div aria-hidden="true" className="stage-entry-actions__placeholder" />}
        </div>
      </div>
    </main>
  )
}
