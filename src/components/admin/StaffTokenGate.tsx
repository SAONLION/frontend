import { useState, type FormEvent } from 'react'

type StaffTokenGateProps = {
  errorMessage: string | null
  onSubmit: (staffToken: string) => void
}

/** 토큰을 번들에 포함하지 않고 운영자가 현재 탭에서만 입력하도록 하는 SA 진입 화면. */
export function StaffTokenGate({ errorMessage, onSubmit }: StaffTokenGateProps) {
  const [staffToken, setStaffToken] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const token = staffToken.trim()
    if (token) onSubmit(token)
  }

  return (
    <section aria-labelledby="staff-token-gate-title" className="admin-token-gate">
      <h1 id="staff-token-gate-title">SA 대시보드</h1>
      <p>직원용 Staff-Token을 입력해 호출 보드를 확인하세요.</p>
      <form onSubmit={submit}>
        <label htmlFor="staff-token">Staff-Token</label>
        <input
          autoComplete="off"
          id="staff-token"
          onChange={(event) => setStaffToken(event.target.value)}
          required
          type="password"
          value={staffToken}
        />
        {errorMessage && <p className="admin-token-gate__error" role="alert">{errorMessage}</p>}
        <button type="submit">대시보드 열기</button>
      </form>
    </section>
  )
}
