import { useMemo, useState, type PropsWithChildren } from 'react'
import { contactContext } from './ContactContext'
import type { ContactService } from './ContactService'

/** Keeps contact PII outside the session timeline and its analytics events. */
export function ContactProvider({ children }: PropsWithChildren) {
  const [email, setEmail] = useState<string | null>(null)
  const value = useMemo<ContactService>(() => ({
    captureEmail: (value) => setEmail(value),
    hasCapturedContact: email !== null,
  }), [email])

  return <contactContext.Provider value={value}>{children}</contactContext.Provider>
}
