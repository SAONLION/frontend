import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AdminApp from './AdminApp'

vi.mock('../../components/domain/DocentStage', () => ({
  DocentStage: () => <div data-testid="docent-stage" />,
}))

describe('AdminApp', () => {
  it('renders without customer session or product providers', () => {
    render(<AdminApp />)

    expect(screen.getByLabelText('SA 도슨트')).toBeTruthy()
    expect(screen.queryByText('SA CLIENT SERVICE')).toBeNull()
    expect(screen.getByRole('heading', { name: '대기' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '완료' })).toBeTruthy()
    expect(screen.getAllByText('SA 호출 연동을 준비하고 있어요.')).toHaveLength(2)
  })
})
