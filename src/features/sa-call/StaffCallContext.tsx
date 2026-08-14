import type { PropsWithChildren } from 'react'
import type { StaffCallService } from './StaffCallService'
import { staffCallContext } from './staffCallContextValue'

type StaffCallProviderProps = PropsWithChildren<{
  value: StaffCallService
}>

export function StaffCallProvider({ children, value }: StaffCallProviderProps) {
  return <staffCallContext.Provider value={value}>{children}</staffCallContext.Provider>
}
