import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ToastProvider } from '@/context/ToastContext'
import { StudyLogPage } from '@/pages/StudyLogPage'

function renderPage() {
  return render(
    <ToastProvider>
      <StudyLogPage />
    </ToastProvider>,
  )
}

describe('StudyLogPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an empty state with no sessions logged', () => {
    renderPage()
    expect(screen.getByText('No sessions yet')).toBeInTheDocument()
  })

  it('logs a new study session through the form', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Log a session' }))
    await user.type(screen.getByLabelText('Topic'), 'Organic chemistry')
    await user.type(screen.getByLabelText('Duration (minutes)'), '50')
    await user.click(screen.getByRole('button', { name: 'Log session' }))

    expect(screen.getByText('Organic chemistry', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('50m', { selector: 'span' })).toBeInTheDocument()
  })

  it('edits an existing session', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Log a session' }))
    await user.type(screen.getByLabelText('Topic'), 'History')
    await user.type(screen.getByLabelText('Duration (minutes)'), '30')
    await user.click(screen.getByRole('button', { name: 'Log session' }))

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const durationInput = screen.getByLabelText('Duration (minutes)')
    await user.clear(durationInput)
    await user.type(durationInput, '75')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByText('1h 15m', { selector: 'span' })).toBeInTheDocument()
  })

  it('deletes a session after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Log a session' }))
    await user.type(screen.getByLabelText('Topic'), 'Geography')
    await user.type(screen.getByLabelText('Duration (minutes)'), '15')
    await user.click(screen.getByRole('button', { name: 'Log session' }))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('Geography')).not.toBeInTheDocument()
    expect(screen.getByText('No sessions yet')).toBeInTheDocument()
  })

  it('filters sessions by search text', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Log a session' }))
    await user.type(screen.getByLabelText('Topic'), 'Algebra')
    await user.type(screen.getByLabelText('Duration (minutes)'), '20')
    await user.click(screen.getByRole('button', { name: 'Log session' }))

    await user.click(screen.getByRole('button', { name: 'Log a session' }))
    await user.type(screen.getByLabelText('Topic'), 'Poetry')
    await user.type(screen.getByLabelText('Duration (minutes)'), '20')
    await user.click(screen.getByRole('button', { name: 'Log session' }))

    await user.type(screen.getByPlaceholderText('Search sessions...'), 'Algebra')

    expect(screen.getByText('Algebra', { selector: 'p' })).toBeInTheDocument()
    expect(screen.queryByText('Poetry', { selector: 'p' })).not.toBeInTheDocument()
  })
})
