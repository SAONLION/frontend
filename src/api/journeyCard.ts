import { apiClient } from './client'

export type JourneyCardShotType = 'MODEL' | 'PRODUCT'
export type JourneyCardCollageImage = { imageUrl: string; shotType: JourneyCardShotType }

export type JourneyCardResponse = {
  brand: string
  date: string // "YY/MM/DD"
  nickname: string | null
  sessionCode: string
  collageImages: readonly JourneyCardCollageImage[]
}

// GET /api/v1/session/journey-card
export async function fetchJourneyCard(sessionId: string): Promise<JourneyCardResponse> {
  const { data } = await apiClient.get<JourneyCardResponse>('/api/v1/session/journey-card', {
    params: { sessionId },
  })
  return data
}

const MONTH_ABBREVIATIONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

// "26/08/16" -> "26AUG16"
export function formatJourneyCardDate(rawDate: string): string {
  const [yy, mm, dd] = rawDate.split('/')
  const monthAbbreviation = MONTH_ABBREVIATIONS[Number(mm) - 1]
  if (!yy || !dd || !monthAbbreviation) return rawDate
  return `${yy}${monthAbbreviation}${dd}`
}
