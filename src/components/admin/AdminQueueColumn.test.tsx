import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminQueueColumn } from './AdminQueueColumn'

const call = {
  callId: 1,
  color: 'Cognac',
  customerName: '고객',
  productName: '제품',
  requestReason: '직원 상담',
  sessionCode: 'ABCDE',
}

describe('AdminQueueColumn', () => {
  it('shows the correct empty message for a waiting queue', () => {
    render(<AdminQueueColumn calls={[]} label="대기" state="empty" status="waiting" />)

    expect(screen.getByText('대기 중인 고객 요청이 없어요.')).toBeTruthy()
  })

  it('does not enable completion without an API handler', () => {
    render(<AdminQueueColumn calls={[call]} label="대기" state="ready" status="waiting" />)

    const completeButton = screen.getByRole('button', { name: '고객 님의 요청 완료 처리' }) as HTMLButtonElement
    expect(completeButton.disabled).toBe(true)
  })

  it('forwards a completion action when an API handler is provided', () => {
    const onComplete = vi.fn()
    render(<AdminQueueColumn calls={[call]} label="대기" state="ready" status="waiting" onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: '고객 님의 요청 완료 처리' }))

    expect(onComplete).toHaveBeenCalledWith(1)
  })
})
