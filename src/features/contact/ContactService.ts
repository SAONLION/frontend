export type ContactService = {
  captureEmail: (email: string) => void
  hasCapturedContact: boolean
}
