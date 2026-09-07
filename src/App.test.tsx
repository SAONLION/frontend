import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App routes', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/admin')
  })

  it('opens the AdminApp shell for a direct /admin visit', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'SA 대시보드를 준비하고 있어요' })).toBeTruthy()
  })
})
