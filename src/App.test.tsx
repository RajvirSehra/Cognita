import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('renders the dashboard by default', () => {
    render(<App />)
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
  })

  it('navigates between pages via the bottom nav', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Cards' }))
    expect(screen.getAllByText('Flashcards').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Log' }))
    expect(screen.getAllByText('Study Log').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Stats' }))
    expect(screen.getAllByText('Statistics').length).toBeGreaterThan(0)
  })

  it('falls back to the dashboard for an unknown route', () => {
    window.location.hash = '#/not-a-real-route'
    render(<App />)
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
  })
})
