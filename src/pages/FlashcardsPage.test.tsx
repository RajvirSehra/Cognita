import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ToastProvider } from '@/context/ToastContext'
import { FlashcardsPage } from '@/pages/FlashcardsPage'

function renderPage() {
  return render(
    <ToastProvider>
      <FlashcardsPage />
    </ToastProvider>,
  )
}

async function addCard(user: ReturnType<typeof userEvent.setup>, front: string, back: string) {
  await user.click(screen.getByRole('button', { name: 'Add a flashcard' }))
  await user.type(screen.getByLabelText('Front'), front)
  await user.type(screen.getByLabelText('Back'), back)
  await user.click(screen.getByRole('button', { name: 'Add card' }))
}

describe('FlashcardsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an empty state with no cards', () => {
    renderPage()
    expect(screen.getByText('No flashcards yet')).toBeInTheDocument()
  })

  it('creates a flashcard through the manage view', async () => {
    const user = userEvent.setup()
    renderPage()

    await addCard(user, 'What is 2+2?', '4')

    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })

  it('runs a full review: reveal then grade Good removes the card from the session', async () => {
    const user = userEvent.setup()
    renderPage()

    await addCard(user, 'Capital of Japan?', 'Tokyo')
    await user.click(screen.getByRole('button', { name: /Review/ }))

    expect(screen.getByText('Capital of Japan?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reveal answer' }))
    expect(screen.getByText('Tokyo')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Good/ }))

    expect(screen.getByText('Session complete')).toBeInTheDocument()
  })

  it('requeues a card graded Again instead of ending the session', async () => {
    const user = userEvent.setup()
    renderPage()

    await addCard(user, 'Card one', 'Answer one')
    await addCard(user, 'Card two', 'Answer two')

    await user.click(screen.getByRole('button', { name: /Review/ }))

    // First card in the queue — grade it Again.
    await user.click(screen.getByRole('button', { name: 'Reveal answer' }))
    await user.click(screen.getByRole('button', { name: /^Again/ }))

    // The second card should now be showing, and the session isn't complete yet.
    expect(screen.getByText('2 cards left this session')).toBeInTheDocument()
    expect(screen.queryByText('Session complete')).not.toBeInTheDocument()

    // Grade the second card Good — the first (Again'd) card should come back around.
    await user.click(screen.getByRole('button', { name: 'Reveal answer' }))
    await user.click(screen.getByRole('button', { name: /^Good/ }))

    expect(screen.getByText('1 card left this session')).toBeInTheDocument()
    expect(screen.queryByText('Session complete')).not.toBeInTheDocument()
  })

  it('deletes a card from the manage view', async () => {
    const user = userEvent.setup()
    renderPage()

    await addCard(user, 'To delete', 'Answer')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('To delete')).not.toBeInTheDocument()
  })
})
