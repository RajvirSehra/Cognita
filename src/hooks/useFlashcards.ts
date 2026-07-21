import { useCallback, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { gradeCard } from '@/scheduling/scheduler'
import { flashcardsRepo } from '@/storage/flashcardsRepo'
import { StorageError } from '@/storage/localStorageClient'
import { reviewLogRepo } from '@/storage/reviewLogRepo'
import type { FlashcardGrade, NewFlashcard } from '@/types'

export function useFlashcards() {
  const [cards, setCards] = useState(() => flashcardsRepo.getAll())
  const [reviewLogs, setReviewLogs] = useState(() => reviewLogRepo.getAll())
  const { showToast } = useToast()

  const refresh = useCallback(() => {
    setCards(flashcardsRepo.getAll())
    setReviewLogs(reviewLogRepo.getAll())
  }, [])

  const withErrorHandling = useCallback(
    (action: () => void, failureMessage: string) => {
      try {
        action()
        refresh()
        return true
      } catch (error) {
        showToast(error instanceof StorageError ? error.message : failureMessage, 'error')
        return false
      }
    },
    [refresh, showToast],
  )

  const addCard = useCallback(
    (input: NewFlashcard) => withErrorHandling(() => flashcardsRepo.add(input), 'Could not save flashcard.'),
    [withErrorHandling],
  )

  const updateCard = useCallback(
    (id: string, patch: Partial<NewFlashcard>) =>
      withErrorHandling(() => flashcardsRepo.update(id, patch), 'Could not update flashcard.'),
    [withErrorHandling],
  )

  const deleteCard = useCallback(
    (id: string) => withErrorHandling(() => flashcardsRepo.remove(id), 'Could not delete flashcard.'),
    [withErrorHandling],
  )

  const gradeCardById = useCallback(
    (id: string, grade: FlashcardGrade) =>
      withErrorHandling(() => {
        const card = flashcardsRepo.getAll().find((c) => c.id === id)
        if (!card) return
        const { card: updatedCard, reviewLog } = gradeCard(card, grade)
        flashcardsRepo.replaceCard(updatedCard)
        reviewLogRepo.add(reviewLog)
      }, 'Could not save review.'),
    [withErrorHandling],
  )

  return { cards, reviewLogs, addCard, updateCard, deleteCard, gradeCardById, refresh }
}
