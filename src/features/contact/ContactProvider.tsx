import { useMemo, useState, type PropsWithChildren } from 'react'
import { createContact } from '../../api/contacts'
import { contactContext } from './ContactContext'
import type { ContactService } from './ContactService'

/** Keeps contact PII outside the session timeline and its analytics events. */
export function ContactProvider({ children }: PropsWithChildren) {
  const [email, setEmail] = useState<string | null>(null)
  const value = useMemo<ContactService>(() => ({
    captureEmail: (nextEmail, context) => {
      setEmail(nextEmail)
      if (context?.sessionId) {
        void createContact(context.sessionId, {
          email: nextEmail,
          actionId: context.actionId,
          productId: context.productId,
          contentTopic: context.contentTopic,
        }).catch((error: unknown) => {
          console.error('연락처 등록에 실패했습니다.', error)
        })
      }
    },
    hasCapturedContact: email !== null,
  }), [email])

  return <contactContext.Provider value={value}>{children}</contactContext.Provider>
}
