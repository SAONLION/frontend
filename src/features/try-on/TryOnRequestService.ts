export type TryOnRequest = {
  sku: string
  size: string
  color: string
}

export type TryOnRequestService = {
  requestTryOn: (request: TryOnRequest) => Promise<'completed'>
}
