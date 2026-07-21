import { describe, expect, it } from 'vitest'
import { searchAll } from '@/utils/search'
import type { Flashcard, StudySession } from '@/types'

const sessions: StudySession[] = [
  {
    id: 's1',
    date: '2026-01-01',
    topic: 'Linear algebra',
    durationMinutes: 45,
    notes: 'Covered eigenvectors',
    takeaway: 'Eigenvectors do not change direction under transformation',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 's2',
    date: '2026-01-02',
    topic: 'French vocabulary',
    durationMinutes: 20,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
]

const flashcards: Flashcard[] = [
  {
    id: 'c1',
    front: 'What is an eigenvector?',
    back: 'A vector whose direction is unchanged by a linear transformation',
    topic: 'Linear algebra',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    dueDate: '2026-01-02',
  },
  {
    id: 'c2',
    front: 'Bonjour',
    back: 'Hello',
    topic: 'French vocabulary',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    dueDate: '2026-01-02',
  },
]

describe('searchAll', () => {
  it('returns nothing for an empty query', () => {
    expect(searchAll('', sessions, flashcards)).toEqual([])
    expect(searchAll('   ', sessions, flashcards)).toEqual([])
  })

  it('matches study sessions by topic, notes, or takeaway', () => {
    const results = searchAll('eigenvector', sessions, flashcards)
    const sessionMatch = results.find((r) => r.type === 'session')
    expect(sessionMatch).toBeDefined()
  })

  it('matches flashcards by front, back, or topic', () => {
    const results = searchAll('bonjour', sessions, flashcards)
    expect(results.some((r) => r.type === 'flashcard' && r.id === 'c2')).toBe(true)
  })

  it('matches across both sessions and flashcards for a shared topic', () => {
    const results = searchAll('linear algebra', sessions, flashcards)
    expect(results.some((r) => r.type === 'session')).toBe(true)
    expect(results.some((r) => r.type === 'flashcard')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(searchAll('BONJOUR', sessions, flashcards).length).toBeGreaterThan(0)
  })

  it('returns no results for a query that matches nothing', () => {
    expect(searchAll('nonexistent-topic-xyz', sessions, flashcards)).toEqual([])
  })
})
