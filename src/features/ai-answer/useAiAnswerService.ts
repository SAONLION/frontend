import { useContext } from 'react'
import { aiAnswerContext } from './aiAnswerContextValue'

export function useAiAnswerService() {
  const value = useContext(aiAnswerContext)
  if (!value) throw new Error('AiAnswerProvider 안에서 사용해야 합니다.')
  return value
}
