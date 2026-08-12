import type { StaffCallType } from '../../constants/events'

export const MOCK_STAFF_CALL_DELAY_MS = 800
export type StaffCallRequest = { sku: string; type: StaffCallType }
export interface StaffCallService { request: (request: StaffCallRequest) => Promise<'completed'> }
