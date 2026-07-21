import { STORAGE_KEYS } from '@/storage/keys'
import { readJSON, writeJSON } from '@/storage/localStorageClient'
import type { NewStudySession, StudySession } from '@/types'
import { generateId } from '@/utils/id'
import { isStudySessionArray } from '@/utils/validation'

function load(): StudySession[] {
  return readJSON<StudySession[]>(STORAGE_KEYS.studySessions, [], isStudySessionArray)
}

function save(sessions: StudySession[]): void {
  writeJSON(STORAGE_KEYS.studySessions, sessions)
}

export const studySessionsRepo = {
  getAll(): StudySession[] {
    return load()
  },

  add(input: NewStudySession): StudySession {
    const now = new Date().toISOString()
    const session: StudySession = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    const sessions = [...load(), session]
    save(sessions)
    return session
  },

  update(id: string, patch: Partial<NewStudySession>): StudySession | null {
    const sessions = load()
    const index = sessions.findIndex((s) => s.id === id)
    if (index === -1) return null

    const updated: StudySession = {
      ...sessions[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    const next = [...sessions]
    next[index] = updated
    save(next)
    return updated
  },

  remove(id: string): void {
    save(load().filter((s) => s.id !== id))
  },

  replaceAll(sessions: StudySession[]): void {
    save(sessions)
  },
}
