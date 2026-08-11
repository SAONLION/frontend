import { createContext } from 'react'
import type { AiAnswerService } from './AiAnswerService'

export const aiAnswerContext = createContext<AiAnswerService | null>(null)
