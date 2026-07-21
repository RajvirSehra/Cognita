import { flashcardsRepo } from '@/storage/flashcardsRepo'
import { reviewLogRepo } from '@/storage/reviewLogRepo'
import { studySessionsRepo } from '@/storage/studySessionsRepo'
import type { AppData } from '@/types'
import { isAppData } from '@/utils/validation'

export const BACKUP_SCHEMA_VERSION = 1

export class BackupParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupParseError'
  }
}

export function exportAppData(): AppData {
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    studySessions: studySessionsRepo.getAll(),
    flashcards: flashcardsRepo.getAll(),
    reviewLogs: reviewLogRepo.getAll(),
  }
}

/** Parses and validates a backup file's text content. Never throws anything but BackupParseError. */
export function parseBackupFile(text: string): AppData {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new BackupParseError('This file is not valid JSON. It may be corrupted or not a Cognita backup.')
  }

  if (!isAppData(parsed)) {
    throw new BackupParseError(
      'This file does not match the expected Cognita backup format. Nothing was imported.',
    )
  }

  if (parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new BackupParseError(
      'This backup was created by a newer version of Cognita and cannot be imported here.',
    )
  }

  return parsed
}

/** Replaces all local data with the given backup. Caller is responsible for confirming with the user first. */
export function importAppData(data: AppData): void {
  studySessionsRepo.replaceAll(data.studySessions)
  flashcardsRepo.replaceAll(data.flashcards)
  reviewLogRepo.replaceAll(data.reviewLogs)
}
