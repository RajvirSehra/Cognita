import type { AppData, Flashcard, FlashcardGrade, ReviewLogEntry, StudySession } from '@/types'

const isString = (v: unknown): v is string => typeof v === 'string'
const isOptionalString = (v: unknown): v is string | undefined => v === undefined || typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

export function isStudySession(value: unknown): value is StudySession {
  if (!isObject(value)) return false
  return (
    isString(value.id) &&
    isString(value.date) &&
    isString(value.topic) &&
    isNumber(value.durationMinutes) &&
    isOptionalString(value.notes) &&
    isOptionalString(value.takeaway) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

export function isStudySessionArray(value: unknown): value is StudySession[] {
  return Array.isArray(value) && value.every(isStudySession)
}

const VALID_GRADES: FlashcardGrade[] = ['again', 'hard', 'good', 'easy']

export function isFlashcard(value: unknown): value is Flashcard {
  if (!isObject(value)) return false
  return (
    isString(value.id) &&
    isString(value.front) &&
    isString(value.back) &&
    isOptionalString(value.topic) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isNumber(value.easeFactor) &&
    isNumber(value.intervalDays) &&
    isNumber(value.repetitions) &&
    isString(value.dueDate) &&
    isOptionalString(value.lastReviewedAt)
  )
}

export function isFlashcardArray(value: unknown): value is Flashcard[] {
  return Array.isArray(value) && value.every(isFlashcard)
}

export function isReviewLogEntry(value: unknown): value is ReviewLogEntry {
  if (!isObject(value)) return false
  return (
    isString(value.id) &&
    isString(value.cardId) &&
    isString(value.reviewedAt) &&
    isString(value.grade) &&
    VALID_GRADES.includes(value.grade as FlashcardGrade) &&
    isNumber(value.previousIntervalDays) &&
    isNumber(value.newIntervalDays) &&
    isNumber(value.previousEaseFactor) &&
    isNumber(value.newEaseFactor)
  )
}

export function isReviewLogArray(value: unknown): value is ReviewLogEntry[] {
  return Array.isArray(value) && value.every(isReviewLogEntry)
}

export function isAppData(value: unknown): value is AppData {
  if (!isObject(value)) return false
  return (
    isNumber(value.schemaVersion) &&
    isString(value.exportedAt) &&
    isStudySessionArray(value.studySessions) &&
    isFlashcardArray(value.flashcards) &&
    isReviewLogArray(value.reviewLogs)
  )
}
