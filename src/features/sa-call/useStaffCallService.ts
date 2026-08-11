import { useContext } from 'react'
import { staffCallContext } from './staffCallContextValue'

export function useStaffCallService() {
  const value = useContext(staffCallContext)

  if (!value) {
    throw new Error('StaffCallProvider 안에서 사용해야 합니다.')
  }

  return value
}
