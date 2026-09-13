import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  sendPersonalizedEmail: vi.fn(),
}))

vi.mock('../../api/email', () => ({
  sendPersonalizedEmail: mocks.sendPersonalizedEmail,
}))

import {
  notifyJourneyCompleted,
  registerPersonalizedMailRecipient,
  resetPersonalizedMail,
} from './personalizedMailStore'

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('personalizedMailStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetPersonalizedMail()
    mocks.sendPersonalizedEmail.mockResolvedValue({ pcId: 1, sentStatus: 'PENDING' })
  })

  it('주소 등록이 먼저, 4칸 완성이 나중이면 완성 시점에 보낸다', async () => {
    registerPersonalizedMailRecipient('s1', 'a@b.com')
    expect(mocks.sendPersonalizedEmail).not.toHaveBeenCalled()

    notifyJourneyCompleted('s1')
    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledWith('s1', { email: 'a@b.com', consentMarketing: true })
    await flush()
  })

  it('4칸이 이미 찬 뒤 주소가 등록되면 즉시 보낸다', () => {
    notifyJourneyCompleted('s1')
    expect(mocks.sendPersonalizedEmail).not.toHaveBeenCalled()

    registerPersonalizedMailRecipient('s1', 'a@b.com')
    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledTimes(1)
  })

  it('완성이 반복 관찰돼도 한 번만 보낸다', async () => {
    registerPersonalizedMailRecipient('s1', 'a@b.com')
    notifyJourneyCompleted('s1')
    await flush()
    notifyJourneyCompleted('s1')
    notifyJourneyCompleted('s1')
    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledTimes(1)
  })

  it('발송 실패는 보낸 것으로 치지 않고 다음 완성 관찰에서 다시 시도한다', async () => {
    mocks.sendPersonalizedEmail.mockRejectedValueOnce(new Error('boom'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    registerPersonalizedMailRecipient('s1', 'a@b.com')
    notifyJourneyCompleted('s1')
    await flush()
    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledTimes(1)

    notifyJourneyCompleted('s1')
    await flush()
    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledTimes(2)

    consoleError.mockRestore()
  })

  it('세션이 리셋되면 이전 주소로 보내지 않는다', () => {
    registerPersonalizedMailRecipient('s1', 'a@b.com')
    resetPersonalizedMail()
    notifyJourneyCompleted('s2')
    expect(mocks.sendPersonalizedEmail).not.toHaveBeenCalled()
  })
})
