import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { FlashcardForm } from '@/components/flashcards/FlashcardForm'
import { FlashcardList } from '@/components/flashcards/FlashcardList'
import { FlashcardReview } from '@/components/flashcards/FlashcardReview'
import { useFlashcards } from '@/hooks/useFlashcards'
import { advanceReviewQueue } from '@/scheduling/reviewQueue'
import { getDueCards, getUpcomingCards } from '@/scheduling/scheduler'
import type { Flashcard, FlashcardGrade, NewFlashcard } from '@/types'
import { todayISODate } from '@/utils/date'
import styles from './FlashcardsPage.module.css'

type ViewMode = 'review' | 'manage'

export function FlashcardsPage() {
  const { cards, reviewLogs, addCard, updateCard, deleteCard, gradeCardById } = useFlashcards()
  const today = todayISODate()

  const dueCards = useMemo(() => getDueCards(cards, today), [cards, today])
  const upcomingCards = useMemo(() => getUpcomingCards(cards, today), [cards, today])

  const [view, setView] = useState<ViewMode>(dueCards.length > 0 ? 'review' : 'manage')
  const [sessionQueue, setSessionQueue] = useState<string[]>(() => dueCards.map((c) => c.id))
  // How many cards this review session started with — lets us tell "never had
  // anything due" apart from "just finished reviewing everything", since
  // `dueCards` itself recomputes (and often empties out) as cards get graded.
  const [sessionTotal, setSessionTotal] = useState(() => dueCards.length)
  const [revealed, setRevealed] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const cardsById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])
  const currentCard = sessionQueue.length > 0 ? cardsById.get(sessionQueue[0]) ?? null : null

  function startReview() {
    const due = getDueCards(cards, today)
    setSessionQueue(due.map((c) => c.id))
    setSessionTotal(due.length)
    setRevealed(false)
    setView('review')
  }

  /** Switches to the Review tab, starting a session if one isn't already under way. */
  function goToReview() {
    if (sessionQueue.length === 0) {
      const due = getDueCards(cards, today)
      setSessionQueue(due.map((c) => c.id))
      setSessionTotal(due.length)
    }
    setView('review')
  }

  function handleGrade(grade: FlashcardGrade) {
    if (!currentCard) return
    gradeCardById(currentCard.id, grade)
    setSessionQueue((prev) => advanceReviewQueue(prev, currentCard.id, grade))
    setRevealed(false)
  }

  function openNewCardForm() {
    setEditingCard(null)
    setFormOpen(true)
  }

  function openEditForm(card: Flashcard) {
    setEditingCard(card)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingCard(null)
  }

  function handleFormSubmit(input: NewFlashcard) {
    if (editingCard) {
      updateCard(editingCard.id, input)
    } else {
      addCard(input)
    }
    closeForm()
  }

  return (
    <div className="stack gap-5">
      <div className={styles.tabs}>
        <button type="button" className={`btn ${view === 'review' ? 'btn-primary' : 'btn-ghost'}`} onClick={goToReview}>
          Review {dueCards.length > 0 && `(${dueCards.length})`}
        </button>
        <button type="button" className={`btn ${view === 'manage' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('manage')}>
          Manage ({cards.length})
        </button>
      </div>

      {view === 'review' ? (
        currentCard ? (
          <FlashcardReview card={currentCard} revealed={revealed} remaining={sessionQueue.length} onReveal={() => setRevealed(true)} onGrade={handleGrade} />
        ) : sessionTotal === 0 ? (
          <EmptyState
            title="Nothing due today"
            message={cards.length === 0 ? 'Create your first flashcard to begin.' : 'You are caught up. Come back tomorrow, or add more cards.'}
            action={
              <button type="button" className="btn btn-primary" onClick={openNewCardForm}>
                Add a flashcard
              </button>
            }
          />
        ) : (
          <EmptyState
            title="Session complete"
            message="You reviewed every card due today."
            action={
              <button type="button" className="btn btn-primary" onClick={startReview}>
                Review again
              </button>
            }
          />
        )
      ) : (
        <div className="stack gap-5">
          <button type="button" className="btn btn-primary btn-block" onClick={openNewCardForm}>
            Add a flashcard
          </button>

          {cards.length === 0 ? (
            <EmptyState title="No flashcards yet" message="Add a flashcard to start building your spaced-repetition deck." />
          ) : (
            <>
              <FlashcardList title="Due" cards={dueCards} reviewLogs={reviewLogs} onEdit={openEditForm} onDelete={setDeletingId} />
              <FlashcardList title="Upcoming" cards={upcomingCards} reviewLogs={reviewLogs} onEdit={openEditForm} onDelete={setDeletingId} />
            </>
          )}
        </div>
      )}

      {formOpen && (
        <Modal title={editingCard ? 'Edit flashcard' : 'Add a flashcard'} onClose={closeForm}>
          <FlashcardForm initial={editingCard} onSubmit={handleFormSubmit} onCancel={closeForm} />
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete flashcard"
          message="This permanently deletes this flashcard and its review history. This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            deleteCard(deletingId)
            setSessionQueue((prev) => prev.filter((id) => id !== deletingId))
            setDeletingId(null)
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}
