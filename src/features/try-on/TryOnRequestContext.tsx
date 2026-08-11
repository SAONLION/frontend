import type { PropsWithChildren } from 'react'
import type { TryOnRequestService } from './TryOnRequestService'
import { tryOnRequestContext } from './tryOnRequestContextValue'

type TryOnRequestProviderProps = PropsWithChildren<{
  value: TryOnRequestService
}>

export function TryOnRequestProvider({ children, value }: TryOnRequestProviderProps) {
  return <tryOnRequestContext.Provider value={value}>{children}</tryOnRequestContext.Provider>
}
