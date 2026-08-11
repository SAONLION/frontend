import { MOCK_STAFF_CALL_DELAY_MS, type StaffCallService } from '../../features/sa-call/StaffCallService'

export const mockStaffCallService: StaffCallService = {
  requestInfo: async () =>
    new Promise((resolve) => {
      window.setTimeout(() => resolve('completed'), MOCK_STAFF_CALL_DELAY_MS)
    }),
}
