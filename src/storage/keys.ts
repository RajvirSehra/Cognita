export const STORAGE_KEYS = {
  studySessions: 'cognita:study-sessions',
  flashcards: 'cognita:flashcards',
  reviewLogs: 'cognita:review-logs',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
