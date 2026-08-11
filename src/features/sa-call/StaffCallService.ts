export const MOCK_STAFF_CALL_DELAY_MS = 800
export interface StaffCallService { requestInfo: (sku: string) => Promise<'completed'> }
