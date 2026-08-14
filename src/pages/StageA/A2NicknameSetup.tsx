import { useState, type FormEvent } from 'react'
import CircleButton from '../../components/common/CircleButton'
import TextInput from '../../components/common/TextInput'
import { KineticTextReveal } from '../../components/ui/kinetic-text-reveal'

type A2NicknameSetupProps = {
  headline?: string
  onSubmit: (nickname: string) => void
  placeholder?: string
}

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
        <h1><KineticTextReveal autoPlay blur delay={0} distance={16} onRevealComplete={() => setIsFormVisible(true)} splitBy="characters" stagger={0.035} text={headline} /></h1>
        {isFormVisible && <TextInput
          ariaLabel="이름 또는 닉네임"
          className="stage-entry-nickname-input"
          maxLength={24}
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
