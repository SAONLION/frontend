import { useContext } from 'react'
import type { PriceInquiryRequestService } from './PriceInquiryRequestService'
import { priceInquiryRequestContext } from './priceInquiryRequestContextValue'

export function usePriceInquiryRequestService(): PriceInquiryRequestService {
  const value = useContext(priceInquiryRequestContext)

  if (!value) {
    throw new Error('PriceInquiryRequestProvider 안에서 사용해야 합니다.')
  }

  return value
}
