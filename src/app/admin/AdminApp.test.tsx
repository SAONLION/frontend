import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AdminApp from './AdminApp'

describe('AdminApp', () => {
  it('renders without customer session or product providers', () => {
    render(<AdminApp />)

    expect(screen.getByRole('img', { name: 'MCM' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '대기' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '완료' })).toBeTruthy()
    expect(screen.getAllByText('SA 호출 연동을 준비하고 있어요.')).toHaveLength(2)
  })
})
