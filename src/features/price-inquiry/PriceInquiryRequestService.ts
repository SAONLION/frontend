export type PriceInquiryRequestService = {
  requestPriceInquiry: (sku: string) => Promise<'completed'>
}
