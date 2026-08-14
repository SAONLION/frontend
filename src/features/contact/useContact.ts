import { useContext } from 'react'
import { contactContext } from './ContactContext'
import type { ContactService } from './ContactService'

export function useContact(): ContactService {
  const value = useContext(contactContext)
  if (!value) throw new Error('ContactProvider 안에서 사용해야 합니다.')
  return value
}
