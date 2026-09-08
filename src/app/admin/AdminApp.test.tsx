import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AdminApp from './AdminApp'

vi.mock('../../components/domain/DocentStage', () => ({
  DocentStage: () => <div data-testid="docent-stage" />,
}))

vi.mock('../../features/admin-call-queue/useAdminCallBoard', () => ({
  useAdminCallBoard: () => ({
    completed: [],
    completedState: 'empty',
    completingCallId: null,
    complete: vi.fn(),
    refresh: vi.fn(),
    waiting: [],
    waitingState: 'empty',
  }),
}))

describe('AdminApp', () => {
  it('renders without customer session or product providers', () => {
    render(<AdminApp />)

    expect(screen.getByLabelText('SA 도슨트')).toBeTruthy()
    expect(screen.queryByText('SA CLIENT SERVICE')).toBeNull()
    expect(screen.getByRole('heading', { name: 'SA 대시보드' })).toBeTruthy()
    expect(screen.getByLabelText('Staff-Token')).toBeTruthy()
  })

  it('opens the queue after the operator enters a token', () => {
    render(<AdminApp />)

    fireEvent.change(screen.getByLabelText('Staff-Token'), { target: { value: 'test-token' } })
    fireEvent.click(screen.getByRole('button', { name: '대시보드 열기' }))

    expect(screen.getByRole('heading', { name: '대기' })).toBeTruthy()
  })
})
