import { useContext } from 'react'
import { sessionContext, type SessionContextValue } from './SessionContext'

export function useSession(): SessionContextValue {
  const value = useContext(sessionContext)

  if (!value) {
    throw new Error('SessionProvider 안에서 사용해야 합니다.')
  }

  return value
}
