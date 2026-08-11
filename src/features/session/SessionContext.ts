import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { SessionAction, SessionState } from './sessionTypes'

export type SessionContextValue = {
  state: SessionState
  dispatch: Dispatch<SessionAction>
}

export const sessionContext = createContext<SessionContextValue | null>(null)
