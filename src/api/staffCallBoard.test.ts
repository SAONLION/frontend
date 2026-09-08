import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('./client', () => ({
  apiClient: {
    get: mocks.get,
    patch: mocks.patch,
  },
}))

import { completeStaffCall, getStaffCallBoard } from './staffCallBoard'

describe('StaffCallBoard API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests both queues with the Swagger completed limit parameter', async () => {
    const board = { completed: [], waiting: [] }
    mocks.get.mockResolvedValue({ data: board })

    await expect(getStaffCallBoard('token-1')).resolves.toEqual(board)

    expect(mocks.get).toHaveBeenCalledWith('/api/v1/staff/staff-calls', {
      headers: { 'X-Staff-Token': 'token-1' },
      params: { completedLimit: 20 },
    })
  })

  it('completes a waiting call without an invented request body', async () => {
    const completed = { callId: 12, displayMessage: '완료', status: 'completed', updatedAt: '2026-09-07T18:01:10+09:00' }
    mocks.patch.mockResolvedValue({ data: completed })

    await expect(completeStaffCall('token-1', 12)).resolves.toEqual(completed)

    expect(mocks.patch).toHaveBeenCalledWith('/api/v1/staff/staff-calls/12/complete', undefined, {
      headers: { 'X-Staff-Token': 'token-1' },
    })
  })
})
