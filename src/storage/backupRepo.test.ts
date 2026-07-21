import { beforeEach, describe, expect, it } from 'vitest'
import { BACKUP_SCHEMA_VERSION, BackupParseError, exportAppData, importAppData, parseBackupFile } from '@/storage/backupRepo'
import { flashcardsRepo } from '@/storage/flashcardsRepo'
import { studySessionsRepo } from '@/storage/studySessionsRepo'

describe('backupRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('exports everything currently stored, tagged with the schema version', () => {
    studySessionsRepo.add({ date: '2026-01-01', topic: 'Math', durationMinutes: 30 })
    flashcardsRepo.add({ front: 'Q', back: 'A' })

    const backup = exportAppData()
    expect(backup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION)
    expect(backup.studySessions).toHaveLength(1)
    expect(backup.flashcards).toHaveLength(1)
    expect(backup.reviewLogs).toEqual([])
    expect(new Date(backup.exportedAt).toString()).not.toBe('Invalid Date')
  })

  it('round-trips export -> import', () => {
    studySessionsRepo.add({ date: '2026-01-01', topic: 'Math', durationMinutes: 30 })
    const backup = exportAppData()

    window.localStorage.clear()
    expect(studySessionsRepo.getAll()).toEqual([])

    importAppData(backup)
    expect(studySessionsRepo.getAll()).toHaveLength(1)
    expect(studySessionsRepo.getAll()[0].topic).toBe('Math')
  })

  it('replaces existing data rather than merging on import', () => {
    studySessionsRepo.add({ date: '2026-01-01', topic: 'Old', durationMinutes: 10 })
    const backupWithNothing = { schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: new Date().toISOString(), studySessions: [], flashcards: [], reviewLogs: [] }

    importAppData(backupWithNothing)
    expect(studySessionsRepo.getAll()).toEqual([])
  })

  it('rejects a file that is not valid JSON', () => {
    expect(() => parseBackupFile('{ this is not json')).toThrow(BackupParseError)
  })

  it('rejects valid JSON that does not match the backup shape', () => {
    expect(() => parseBackupFile(JSON.stringify({ hello: 'world' }))).toThrow(BackupParseError)
  })

  it('rejects a backup from a newer, unsupported schema version', () => {
    const future = JSON.stringify({
      schemaVersion: BACKUP_SCHEMA_VERSION + 1,
      exportedAt: new Date().toISOString(),
      studySessions: [],
      flashcards: [],
      reviewLogs: [],
    })
    expect(() => parseBackupFile(future)).toThrow(BackupParseError)
  })

  it('accepts a well-formed backup file', () => {
    const valid = JSON.stringify({
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      studySessions: [],
      flashcards: [],
      reviewLogs: [],
    })
    expect(parseBackupFile(valid).schemaVersion).toBe(BACKUP_SCHEMA_VERSION)
  })
})
