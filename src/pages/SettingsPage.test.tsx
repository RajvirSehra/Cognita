import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastViewport } from '@/components/common/ToastViewport'
import { ToastProvider } from '@/context/ToastContext'
import { SettingsPage } from '@/pages/SettingsPage'
import { studySessionsRepo } from '@/storage/studySessionsRepo'

function renderPage() {
  return render(
    <ToastProvider>
      <SettingsPage />
      <ToastViewport />
    </ToastProvider>,
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
  })

  it('exports the current data as a downloadable JSON backup', async () => {
    studySessionsRepo.add({ date: '2026-01-01', topic: 'Test', durationMinutes: 30 })
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Export backup (JSON)' }))

    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(await screen.findByText('Backup exported.')).toBeInTheDocument()
  })

  it('shows a confirmation warning before importing, and replaces data on confirm', async () => {
    studySessionsRepo.add({ date: '2026-01-01', topic: 'Old data', durationMinutes: 10 })
    const user = userEvent.setup()
    renderPage()

    const backup = {
      schemaVersion: 1,
      exportedAt: '2026-01-01T00:00:00.000Z',
      studySessions: [
        {
          id: 'imported-1',
          date: '2026-02-01',
          topic: 'Imported topic',
          durationMinutes: 15,
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
      ],
      flashcards: [],
      reviewLogs: [],
    }
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(await screen.findByText('Replace all data?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Replace data' }))

    expect(studySessionsRepo.getAll()).toHaveLength(1)
    expect(studySessionsRepo.getAll()[0].topic).toBe('Imported topic')
  })

  it('shows a friendly error for a corrupted backup file', async () => {
    const user = userEvent.setup()
    renderPage()

    const file = new File(['{ not valid json'], 'backup.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(await screen.findByText(/not valid JSON/i)).toBeInTheDocument()
  })
})
