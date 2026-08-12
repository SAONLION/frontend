import type { KeyboardEvent } from 'react'
import ScreenHeadline from '../../components/common/ScreenHeadline'

type A1DocentIntroProps = {
  headline?: string
  onContinue: () => void
  subtext?: string
}

export default function A1DocentIntro({
  headline = '안녕하세요',
  onContinue,
  subtext = 'MCM의 나이비스 AI 도슨트입니다',
}: A1DocentIntroProps) {
  const continueOnKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onContinue()
  }

  return (
    <main
      aria-label="화면을 누르면 닉네임 설정으로 이동"
      className="stage-entry-page stage-entry-page--tap-to-continue"
      onClick={onContinue}
      onKeyDown={continueOnKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="stage-entry-content stage-entry-content--intro">
        <div aria-hidden="true" className="stage-entry-docent stage-entry-docent--wide" />
        <ScreenHeadline className="stage-entry-intro-headline" headline={headline} subtext={subtext} />
      </div>
    </main>
  )
}
