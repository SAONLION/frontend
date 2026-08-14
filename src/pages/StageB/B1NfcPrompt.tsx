import PrimaryButton from '../../components/common/PrimaryButton'
import ScreenHeadline from '../../components/common/ScreenHeadline'
import { DocentStage } from '../../components/domain/DocentStage'

type B1NfcPromptProps = {
  buttonLabel?: string
  headline?: readonly string[]
  onCallStaff: () => void
  onNfcDetected: () => void
  subtext?: string
}

export default function B1NfcPrompt({
  buttonLabel = '직원 호출',
  headline = ['마음에 드는 제품이 있나요?', '휴대폰을 태그에 가까이 대보세요'],
  onCallStaff,
  onNfcDetected,
  subtext = '제품에 대해 알려드릴게요',
}: B1NfcPromptProps) {
  return (
    <main className="stage-entry-page">
      <div className="stage-entry-content stage-entry-content--nfc">
        <DocentStage cue="guide" className="stage-entry-docent stage-entry-docent--wide" />
        <ScreenHeadline className="stage-entry-nfc-headline" headline={headline} subtext={subtext} variant="md" />
        <div className="stage-entry-actions">
          <PrimaryButton label="제품 태그 인식하기" onClick={onNfcDetected} />
          <PrimaryButton label={buttonLabel} onClick={onCallStaff} />
        </div>
      </div>
    </main>
  )
}
