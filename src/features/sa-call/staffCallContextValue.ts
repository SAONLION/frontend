import { createContext } from 'react'
import type { StaffCallService } from './StaffCallService'

export const staffCallContext = createContext<StaffCallService | null>(null)
