import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AdminApp from './AdminApp'

describe('AdminApp', () => {
  it('renders without customer session or product providers', () => {
    render(<AdminApp />)

    expect(screen.getByRole('heading', { name: 'SA 대시보드를 준비하고 있어요' })).toBeTruthy()
    expect(screen.getByText('고객 요청을 확인하고 처리할 운영 화면입니다.')).toBeTruthy()
  })
})
