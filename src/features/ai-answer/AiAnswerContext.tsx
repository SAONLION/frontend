import type { PropsWithChildren } from 'react'
import type { AiAnswerService } from './AiAnswerService'
import { aiAnswerContext } from './aiAnswerContextValue'

export function AiAnswerProvider({ children, value }: PropsWithChildren<{ value: AiAnswerService }>) {
  return <aiAnswerContext.Provider value={value}>{children}</aiAnswerContext.Provider>
}
