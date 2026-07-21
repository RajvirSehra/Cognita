import { beforeEach, describe, expect, it } from 'vitest'
import { studySessionsRepo } from '@/storage/studySessionsRepo'

describe('studySessionsRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts empty', () => {
    expect(studySessionsRepo.getAll()).toEqual([])
  })

  it('adds a session and persists it', () => {
    const created = studySessionsRepo.add({ date: '2026-01-01', topic: 'Biology', durationMinutes: 45 })
    expect(created.id).toBeTruthy()
    expect(studySessionsRepo.getAll()).toHaveLength(1)
    expect(studySessionsRepo.getAll()[0]).toMatchObject({ topic: 'Biology', durationMinutes: 45 })
  })

  it('survives being re-read as if from a fresh page load', () => {
    studySessionsRepo.add({ date: '2026-01-01', topic: 'Chemistry', durationMinutes: 30 })
    // A fresh call to getAll() re-reads from localStorage rather than any in-memory cache.
    expect(studySessionsRepo.getAll()).toHaveLength(1)
    expect(studySessionsRepo.getAll()[0].topic).toBe('Chemistry')
  })

  it('updates an existing session and bumps updatedAt', async () => {
    const created = studySessionsRepo.add({ date: '2026-01-01', topic: 'Physics', durationMinutes: 20 })
    await new Promise((resolve) => setTimeout(resolve, 2))
    const updated = studySessionsRepo.update(created.id, { durationMinutes: 40 })
    expect(updated?.durationMinutes).toBe(40)
    expect(updated?.updatedAt).not.toBe(created.updatedAt)
  })

  it('returns null when updating a session that does not exist', () => {
    expect(studySessionsRepo.update('missing-id', { durationMinutes: 10 })).toBeNull()
  })

  it('removes a session', () => {
    const created = studySessionsRepo.add({ date: '2026-01-01', topic: 'Art', durationMinutes: 10 })
    studySessionsRepo.remove(created.id)
    expect(studySessionsRepo.getAll()).toEqual([])
  })
})
