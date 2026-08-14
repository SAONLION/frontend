import { createContext } from 'react'
import type { ContactService } from './ContactService'

export const contactContext = createContext<ContactService | null>(null)
