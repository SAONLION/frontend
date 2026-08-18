import { useState, type FormEvent } from 'react'
import CircleButton from '../../components/common/CircleButton'
import TextInput from '../../components/common/TextInput'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'

type A2NicknameSetupProps = {
  headline?: string
  onSubmit: (nickname: string) => void
  placeholder?: string
}

/**
 * 서버 `PATCH /sessions/{id}/nickname`의 상한이다. 초과하면 400 `INVALID_NICKNAME`이 온다.
 *
 * 이 값을 서버보다 크게 두면 **저장이 조용히 실패한다** — 화면은 다음으로 넘어가고
 * 닉네임은 로컬 상태에만 남아 서버·SA 대시보드와 값이 갈린다. 넘길 수 없는 값은 애초에
 * 입력되지 않게 막는다.
 */
const NICKNAME_MAX_LENGTH = 21

export default function A2NicknameSetup({
  headline = '고객님을 어떻게 불러드리면 좋을까요?',
  onSubmit,
  placeholder = '이름/닉네임',
}: A2NicknameSetupProps) {
  const [nickname, setNickname] = useState('')
  const [isFormVisible, setIsFormVisible] = useState(false)
  const normalizedNickname = nickname.trim()

  const submitNickname = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (normalizedNickname) onSubmit(normalizedNickname)
  }

  return (
    <main className="stage-entry-page">
      <form className="stage-entry-content stage-entry-content--nickname" onSubmit={submitNickname}>
        <div aria-hidden="true" className="stage-entry-docent stage-entry-docent--wide" />
        <h1><KineticTextReveal autoPlay blur delay={0} distance={16} onRevealComplete={() => setIsFormVisible(true)} splitBy="characters" stagger={0.035} text={headline} waitForDocent /></h1>
        {isFormVisible && <TextInput
          ariaLabel="이름 또는 닉네임"
          className="stage-entry-nickname-input"
          maxLength={NICKNAME_MAX_LENGTH}
          onChange={setNickname}
          placeholder={placeholder}
          value={nickname}
        />}
        {isFormVisible && <CircleButton
          ariaLabel="닉네임을 저장하고 제품 태그 안내로 이동"
          className="stage-entry-nickname-submit"
          disabled={!normalizedNickname}
          direction="right"
          type="submit"
        />}
      </form>
    </main>
  )
}
