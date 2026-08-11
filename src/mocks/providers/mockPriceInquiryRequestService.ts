import type { PriceInquiryRequestService } from '../../features/price-inquiry/PriceInquiryRequestService'

const PRICE_INQUIRY_REQUEST_DELAY_MS = 700
const pendingRequests = new Map<string, Promise<'completed'>>()

export const mockPriceInquiryRequestService: PriceInquiryRequestService = {
  requestPriceInquiry: (sku) => {
    const existingRequest = pendingRequests.get(sku)
    if (existingRequest) return existingRequest

    const request = new Promise<'completed'>((resolve) => {
      window.setTimeout(() => resolve('completed'), PRICE_INQUIRY_REQUEST_DELAY_MS)
    })
    pendingRequests.set(sku, request)
    return request
  },
}
