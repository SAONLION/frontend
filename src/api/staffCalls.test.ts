import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('./client', () => ({
  apiClient: { post: mocks.post },
}))

import { createStaffCall } from './staffCalls'

describe('staffCalls API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends a B1 general staff call without a sku', async () => {
    const response = { callId: 1, requestedAt: '2026-09-13T22:24:05+09:00', status: 'requested' }
    mocks.post.mockResolvedValue({ data: response })

    await expect(createStaffCall('session-1', { reason: '기타 문의' })).resolves.toEqual(response)

    expect(mocks.post).toHaveBeenCalledWith('/api/v1/session/staff-calls', { reason: '기타 문의' }, {
      params: { sessionId: 'session-1' },
    })
  })
})
