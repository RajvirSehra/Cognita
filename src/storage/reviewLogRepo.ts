import { STORAGE_KEYS } from '@/storage/keys'
import { readJSON, writeJSON } from '@/storage/localStorageClient'
import type { ReviewLogEntry } from '@/types'
import { generateId } from '@/utils/id'
import { isReviewLogArray } from '@/utils/validation'

function load(): ReviewLogEntry[] {
  return readJSON<ReviewLogEntry[]>(STORAGE_KEYS.reviewLogs, [], isReviewLogArray)
}

function save(logs: ReviewLogEntry[]): void {
  writeJSON(STORAGE_KEYS.reviewLogs, logs)
}

export const reviewLogRepo = {
  getAll(): ReviewLogEntry[] {
    return load()
  },

  add(entry: Omit<ReviewLogEntry, 'id'>): ReviewLogEntry {
    const log: ReviewLogEntry = { ...entry, id: generateId() }
    save([...load(), log])
    return log
  },

  getByCard(cardId: string): ReviewLogEntry[] {
    return load().filter((log) => log.cardId === cardId)
  },

  replaceAll(logs: ReviewLogEntry[]): void {
    save(logs)
  },
}
