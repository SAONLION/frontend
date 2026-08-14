import type { KeyboardEvent } from 'react'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'

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
        <div className="stage-entry-headline stage-entry-intro-headline flex flex-col items-center gap-1 text-center">
          <h1 className="text-[32px] font-semibold leading-normal text-white">
            <KineticTextReveal
              autoPlay
              blur
              delay={0.2}
              distance={16}
              splitBy="characters"
              stagger={0.055}
              text={headline}
            />
          </h1>
          <p className="text-[18px] font-medium leading-normal text-[#d1d1d1]">{subtext}</p>
        </div>
      </div>
    </main>
  )
}
