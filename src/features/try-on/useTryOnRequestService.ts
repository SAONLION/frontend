import { useContext } from 'react'
import type { TryOnRequestService } from './TryOnRequestService'
import { tryOnRequestContext } from './tryOnRequestContextValue'

export function useTryOnRequestService(): TryOnRequestService {
  const value = useContext(tryOnRequestContext)

  if (!value) {
    throw new Error('TryOnRequestProvider 안에서 사용해야 합니다.')
  }

  return value
}
