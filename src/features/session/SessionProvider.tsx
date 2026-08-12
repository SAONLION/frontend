import { useReducer, type PropsWithChildren } from 'react'
import { sessionContext } from './SessionContext'
import { initialSessionState, sessionReducer } from './sessionReducer'

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState)

  return <sessionContext.Provider value={{ state, dispatch }}>{children}</sessionContext.Provider>
}
