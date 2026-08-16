import { apiClient } from './client'
import type { ContactRequest, ContactResponse } from './types'

// POST /api/v1/session/contacts
export async function createContact(
  sessionId: string,
  input: { email: string; actionId?: number; productId?: number; contentTopic?: string },
): Promise<ContactResponse> {
  const body: ContactRequest = {
    email: input.email,
    actionId: input.actionId,
    productId: input.productId,
    contentTopic: input.contentTopic,
  }
  const { data } = await apiClient.post<ContactResponse>('/api/v1/session/contacts', body, {
    params: { sessionId },
  })
  return data
}
