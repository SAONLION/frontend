import { useEffect, useState, type KeyboardEvent } from 'react'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'
import { getDocentReadyState, subscribeToDocentReady } from '../../features/docent/docentReadiness'

type A1DocentIntroProps = {
  headline?: string
  onContinue: () => void
  subtext?: string
}

export default function A1DocentIntro({
  headline = '안녕하세요',
  onContinue,
  subtext = 'MCM의 AI 도슨트입니다',
}: A1DocentIntroProps) {
  const [isDocentReady, setIsDocentReady] = useState(getDocentReadyState)
  const [isSubtextVisible, setIsSubtextVisible] = useState(false)

  useEffect(() => {
    if (isDocentReady) return

    const unsubscribe = subscribeToDocentReady(() => setIsDocentReady(true))
    const safetyTimer = window.setTimeout(() => setIsDocentReady(true), 2500)

    return () => {
      unsubscribe()
      window.clearTimeout(safetyTimer)
    }
  }, [isDocentReady])

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
        {isDocentReady && (
          <div className="stage-entry-headline stage-entry-intro-headline flex flex-col items-center gap-1 text-center">
            <h1 className="text-[32px] font-semibold leading-normal text-white">
              <KineticTextReveal
                autoPlay
                blur
                delay={0}
                distance={16}
                onRevealComplete={() => setIsSubtextVisible(true)}
                splitBy="characters"
                stagger={0.035}
                text={headline}
              />
            </h1>
            {isSubtextVisible && (
              <p className="text-[18px] font-medium leading-normal text-[#d1d1d1]">
                <KineticTextReveal
                  autoPlay
                  blur={false}
                  distance={8}
                  splitBy="words"
                  stagger={0.1}
                  text={subtext}
                />
              </p>
            )}
          </div>
        )}
        {/* 화면 어디를 눌러도 넘어간다는 힌트. 문구를 읽는 흐름을 방해하지 않도록
            본문이 다 나타난 뒤에 옅게 깜빡인다. */}
        {isSubtextVisible && <p className="stage-entry-tap-hint">화면을 터치하세요</p>}
      </div>
    </main>
  )
}
