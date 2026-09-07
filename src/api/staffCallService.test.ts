import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STAFF_CALL_REASONS } from '../constants/staffCallReasons'

const mocks = vi.hoisted(() => ({
  createStaffCall: vi.fn(),
  getStaffCall: vi.fn(),
  setActiveStaffCallId: vi.fn(),
}))

vi.mock('./staffCalls', () => ({
  createStaffCall: mocks.createStaffCall,
  getStaffCall: mocks.getStaffCall,
}))

vi.mock('../features/sa-call/activeStaffCall', () => ({
  setActiveStaffCallId: mocks.setActiveStaffCallId,
}))

import { realStaffCallService } from './staffCallService'

describe('realStaffCallService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an information request, reports completion, and clears the active call', async () => {
    mocks.createStaffCall.mockResolvedValue({ callId: 17 })
    mocks.getStaffCall.mockResolvedValue({ status: 'completed', displayMessage: '직원 연결이 완료됐어요.' })
    const onProgress = vi.fn()

    await expect(realStaffCallService.request({
      sessionId: 'session-1',
      productId: 42,
      sku: 'sku-1',
      type: 'info',
      onProgress,
    })).resolves.toBe('completed')

    expect(mocks.createStaffCall).toHaveBeenCalledWith('session-1', {
      productId: 42,
      reason: STAFF_CALL_REASONS.productInfo,
    })
    expect(onProgress).toHaveBeenCalledWith({ status: 'completed', displayMessage: '직원 연결이 완료됐어요.' })
    expect(mocks.setActiveStaffCallId).toHaveBeenNthCalledWith(1, 17)
    expect(mocks.setActiveStaffCallId).toHaveBeenLastCalledWith(null)
  })

  it('fails before creating a request when there is no session', async () => {
    await expect(realStaffCallService.request({
      sessionId: null,
      productId: null,
      sku: 'sku-1',
      type: 'other',
    })).rejects.toThrow('세션이 아직 생성되지 않았습니다.')

    expect(mocks.createStaffCall).not.toHaveBeenCalled()
  })
})
