import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  sendPersonalizedEmail: vi.fn(),
}))

vi.mock('../../api/email', () => ({
  sendPersonalizedEmail: mocks.sendPersonalizedEmail,
}))

import {
  registerPersonalizedMailRecipient,
  resetPersonalizedMail,
  retryPendingPersonalizedMail,
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

  it('여권 콜라주가 덜 찼어도 주소를 받은 즉시 보낸다', () => {
    registerPersonalizedMailRecipient('s1', 'a@b.com')

    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledWith('s1', { email: 'a@b.com', consentMarketing: true })
  })

  it('재시도 지점을 여러 번 지나도 한 번만 보낸다', async () => {
    registerPersonalizedMailRecipient('s1', 'a@b.com')
    await flush()

    retryPendingPersonalizedMail('s1')
    retryPendingPersonalizedMail('s1')

    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledTimes(1)
  })

  it('주소가 없으면 재시도 지점에서 아무것도 보내지 않는다', () => {
    retryPendingPersonalizedMail('s1')

    expect(mocks.sendPersonalizedEmail).not.toHaveBeenCalled()
  })

  it('발송 실패는 보낸 것으로 치지 않고 다음 재시도 지점에서 다시 보낸다', async () => {
    mocks.sendPersonalizedEmail.mockRejectedValueOnce(new Error('boom'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    registerPersonalizedMailRecipient('s1', 'a@b.com')
    await flush()
    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledTimes(1)

    retryPendingPersonalizedMail('s1')
    await flush()
    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledTimes(2)

    consoleError.mockRestore()
  })

  it('세션이 리셋되면 이전 주소로 보내지 않는다', async () => {
    registerPersonalizedMailRecipient('s1', 'a@b.com')
    await flush()
    resetPersonalizedMail()

    retryPendingPersonalizedMail('s2')

    expect(mocks.sendPersonalizedEmail).toHaveBeenCalledTimes(1)
  })
})
