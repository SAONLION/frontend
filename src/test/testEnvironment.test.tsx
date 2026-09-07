import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function TestSubject() {
  return <p>test environment ready</p>
}

describe('test environment', () => {
  it('renders React components in jsdom', () => {
    render(<TestSubject />)

    expect(screen.getByText('test environment ready')).toBeTruthy()
  })
})
