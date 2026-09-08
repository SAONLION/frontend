import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App routes', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/admin')
  })

  it('opens the AdminApp shell for a direct /admin visit', async () => {
    render(<App />)

    expect(await screen.findByLabelText('SA 인증')).toBeTruthy()
    expect(screen.getByLabelText('Staff Token')).toBeTruthy()
  })
})
