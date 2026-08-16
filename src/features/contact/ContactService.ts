export type CaptureEmailContext = {
  sessionId?: string | null
  actionId?: number
  productId?: number
  contentTopic?: string
}

export type ContactService = {
  captureEmail: (email: string, context?: CaptureEmailContext) => void
  hasCapturedContact: boolean
}
