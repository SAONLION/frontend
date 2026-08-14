import type { PropsWithChildren } from 'react'
import type { PriceInquiryRequestService } from './PriceInquiryRequestService'
import { priceInquiryRequestContext } from './priceInquiryRequestContextValue'

type PriceInquiryRequestProviderProps = PropsWithChildren<{ value: PriceInquiryRequestService }>

export function PriceInquiryRequestProvider({ children, value }: PriceInquiryRequestProviderProps) {
  return <priceInquiryRequestContext.Provider value={value}>{children}</priceInquiryRequestContext.Provider>
}
