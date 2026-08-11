import { MOCK_STAFF_CALL_DELAY_MS, type StaffCallService } from '../../features/sa-call/StaffCallService'

const completionCache = new Map<string, Promise<'completed'>>()

export const mockStaffCallService: StaffCallService = {
  request({ sku, type }) {
    const key = `${sku}:${type}`
    const existing = completionCache.get(key)
    if (existing) return existing
    const completion = new Promise<'completed'>((resolve) => {
      window.setTimeout(() => resolve('completed'), MOCK_STAFF_CALL_DELAY_MS)
    })
    completionCache.set(key, completion)
    void completion.finally(() => completionCache.delete(key))
    return completion
  },
}
