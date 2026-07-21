/**
 * Core domain types for Cognita.
 *
 * These types define the shape of everything persisted to localStorage.
 * Changing a field here is a schema change — bump `BACKUP_SCHEMA_VERSION`
 * in storage/backupRepo.ts and add a migration if existing user data must
 * be reshaped.
 */

export type ID = string

export interface StudySession {
  id: ID
  /** Calendar date the session took place, as YYYY-MM-DD (local date, not a timestamp). */
  date: string
  topic: string
  durationMinutes: number
  notes?: string
  takeaway?: string
  createdAt: string
  updatedAt: string
}

export type NewStudySession = Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>

export type FlashcardGrade = 'again' | 'hard' | 'good' | 'easy'

export interface Flashcard {
  id: ID
  front: string
  back: string
  topic?: string
  createdAt: string
  updatedAt: string

  /** SM-2 scheduling state. */
  easeFactor: number
  intervalDays: number
  repetitions: number
  /** Next due date, as YYYY-MM-DD. */
  dueDate: string
  lastReviewedAt?: string
}

export type NewFlashcard = Pick<Flashcard, 'front' | 'back' | 'topic'>

export interface ReviewLogEntry {
  id: ID
  cardId: ID
  reviewedAt: string
  grade: FlashcardGrade
  previousIntervalDays: number
  newIntervalDays: number
  previousEaseFactor: number
  newEaseFactor: number
}

export interface AppData {
  schemaVersion: number
  exportedAt: string
  studySessions: StudySession[]
  flashcards: Flashcard[]
  reviewLogs: ReviewLogEntry[]
}
