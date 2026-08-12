import CircleButton from '../../components/common/CircleButton'
import ScreenHeadline from '../../components/common/ScreenHeadline'
import { DocentStage } from '../../components/domain/DocentStage'

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
  return (
    <main className="stage-entry-page">
      <div className="stage-entry-content stage-entry-content--intro">
        <section aria-label="나이비스 AI 도슨트" className="stage-entry-docent stage-entry-docent--wide">
          <DocentStage cue="idle" />
        </section>
        <ScreenHeadline className="stage-entry-intro-headline" headline={headline} subtext={subtext} />
        <CircleButton ariaLabel="닉네임 설정으로 이동" className="stage-entry-next-button" onClick={onContinue} />
      </div>
    </main>
  )
}
