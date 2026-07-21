import { computeNextSM2State, createInitialSM2State, type SM2State } from '@/scheduling/sm2'
import type { Flashcard, FlashcardGrade, ReviewLogEntry } from '@/types'
import { addDays, isOnOrBefore, todayISODate, toISODate } from '@/utils/date'

/** Scheduling fields set on a brand-new flashcard — due immediately. */
export function createNewCardScheduling(now: Date = new Date()): SM2State & { dueDate: string } {
  return { ...createInitialSM2State(), dueDate: toISODate(now) }
}

export interface GradeResult {
  card: Flashcard
  reviewLog: Omit<ReviewLogEntry, 'id'>
}

/** Applies a grade to a card, returning the updated card and a review-log entry. Pure — no I/O. */
export function gradeCard(card: Flashcard, grade: FlashcardGrade, now: Date = new Date()): GradeResult {
  const previousState: SM2State = {
    easeFactor: card.easeFactor,
    intervalDays: card.intervalDays,
    repetitions: card.repetitions,
  }
  const nextState = computeNextSM2State(previousState, grade)
  const nowIso = now.toISOString()
  const dueDate = addDays(toISODate(now), nextState.intervalDays)

  const updatedCard: Flashcard = {
    ...card,
    ...nextState,
    dueDate,
    lastReviewedAt: nowIso,
    updatedAt: nowIso,
  }

  const reviewLog: Omit<ReviewLogEntry, 'id'> = {
    cardId: card.id,
    reviewedAt: nowIso,
    grade,
    previousIntervalDays: previousState.intervalDays,
    newIntervalDays: nextState.intervalDays,
    previousEaseFactor: previousState.easeFactor,
    newEaseFactor: nextState.easeFactor,
  }

  return { card: updatedCard, reviewLog }
}

export function isCardDue(card: Flashcard, todayIso: string = todayISODate()): boolean {
  return isOnOrBefore(card.dueDate, todayIso)
}

export function getDueCards(cards: Flashcard[], todayIso: string = todayISODate()): Flashcard[] {
  return cards
    .filter((card) => isCardDue(card, todayIso))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : a.createdAt.localeCompare(b.createdAt)))
}

export function getUpcomingCards(cards: Flashcard[], todayIso: string = todayISODate()): Flashcard[] {
  return cards
    .filter((card) => !isCardDue(card, todayIso))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))
}
