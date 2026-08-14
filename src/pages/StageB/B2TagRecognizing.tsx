import ScreenHeadline from '../../components/common/ScreenHeadline'
import { DocentStage } from '../../components/domain/DocentStage'

type B2TagRecognizingProps = {
  headline?: string
  subtext?: string
}

export default function B2TagRecognizing({
  headline = '태그를 인식중이에요',
  subtext = '잠시만 기다려주세요',
}: B2TagRecognizingProps) {
  return (
    <main aria-live="polite" className="stage-entry-page">
      <div className="stage-entry-content stage-entry-content--recognizing">
        <DocentStage cue="scan" className="stage-entry-docent stage-entry-docent--wide" />
        <ScreenHeadline className="stage-entry-intro-headline" headline={headline} subtext={subtext} />
      </div>
    </main>
  )
}
