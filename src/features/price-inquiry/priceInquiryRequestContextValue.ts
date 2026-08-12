import { createContext } from 'react'
import type { PriceInquiryRequestService } from './PriceInquiryRequestService'

export const priceInquiryRequestContext = createContext<PriceInquiryRequestService | null>(null)
