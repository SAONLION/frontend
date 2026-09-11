import { useMemo, useReducer, type PropsWithChildren } from 'react'
import { sessionContext } from './SessionContext'
import { initialSessionState, sessionReducer } from './sessionReducer'

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState)

  // 이 컨텍스트를 29곳이 구독한다. 객체를 인라인으로 넘기면 세션 상태가 그대로여도
  // 부모가 다시 그려질 때마다 구독처 전부가 따라 그려진다.
  const value = useMemo(() => ({ state, dispatch }), [state])

  return <sessionContext.Provider value={value}>{children}</sessionContext.Provider>
}
