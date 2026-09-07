import { render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('heading', { name: '대기' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '완료' })).toBeTruthy()
    expect(screen.getByText('대기 중인 고객 요청이 없어요.')).toBeTruthy()
    expect(screen.getByText('완료된 요청이 아직 없어요.')).toBeTruthy()
  })
})
