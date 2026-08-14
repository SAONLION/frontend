import ScreenHeadline from '../../components/common/ScreenHeadline'

type B2TagRecognizingProps = {
  headline?: string
  subtext?: string
}

export default function B2TagRecognizing({
  headline = '태그를 인식중이에요',
  subtext = '잠시만 기다려주세요',
}: B2TagRecognizingProps) {
  return (
    <main aria-live="polite" className="stage-entry-page stage-entry-page--stage-b">
      <div className="stage-entry-content stage-entry-content--recognizing">
        <div aria-hidden="true" className="stage-entry-docent stage-entry-docent--wide" />
        <ScreenHeadline className="stage-entry-intro-headline" headline={headline} subtext={subtext} />
      </div>
    </main>
  )
}
