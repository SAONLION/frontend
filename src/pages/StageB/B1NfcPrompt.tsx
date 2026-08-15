import { useState } from 'react'
import PrimaryButton from '../../components/common/PrimaryButton'
import ScreenHeadline from '../../components/common/ScreenHeadline'

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
  const [areActionsVisible, setAreActionsVisible] = useState(false)

  return (
    <main className="stage-entry-page stage-entry-page--stage-b stage-entry-page--nfc">
      <div className="stage-entry-content stage-entry-content--nfc">
        <div aria-hidden="true" className="stage-entry-docent stage-entry-docent--wide" />
        <ScreenHeadline className="stage-entry-nfc-headline" headline={headline} onRevealComplete={() => setAreActionsVisible(true)} reveal subtext={subtext} variant="md" />
        {areActionsVisible && <div className="stage-entry-actions stage-entry-actions--nfc">
          <PrimaryButton label="제품 태그 인식하기" onClick={onNfcDetected} />
          <PrimaryButton className="stage-b-staff-call-button" label={buttonLabel} onClick={onCallStaff} />
        </div>}
      </div>
    </main>
  )
}
