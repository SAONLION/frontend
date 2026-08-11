import { createContext } from 'react'
import type { TryOnRequestService } from './TryOnRequestService'

export const tryOnRequestContext = createContext<TryOnRequestService | null>(null)
