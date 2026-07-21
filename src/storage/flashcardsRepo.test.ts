import { beforeEach, describe, expect, it } from 'vitest'
import { flashcardsRepo } from '@/storage/flashcardsRepo'
import { reviewLogRepo } from '@/storage/reviewLogRepo'
import { gradeCard } from '@/scheduling/scheduler'

describe('flashcardsRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('creates a new card due immediately, with default SM-2 state', () => {
    const card = flashcardsRepo.add({ front: 'Capital of France', back: 'Paris' })
    expect(card.easeFactor).toBe(2.5)
    expect(card.repetitions).toBe(0)
    expect(card.dueDate <= new Date().toISOString().slice(0, 10)).toBe(true)
  })

  it('persists across reads', () => {
    flashcardsRepo.add({ front: 'Q', back: 'A' })
    expect(flashcardsRepo.getAll()).toHaveLength(1)
  })

  it('replaces a graded card in place', () => {
    const card = flashcardsRepo.add({ front: 'Q', back: 'A' })
    const { card: updated } = gradeCard(card, 'good')
    flashcardsRepo.replaceCard(updated)

    const stored = flashcardsRepo.getAll()[0]
    expect(stored.repetitions).toBe(1)
    expect(stored.id).toBe(card.id)
  })

  it('removes a card', () => {
    const card = flashcardsRepo.add({ front: 'Q', back: 'A' })
    flashcardsRepo.remove(card.id)
    expect(flashcardsRepo.getAll()).toEqual([])
  })
})

describe('reviewLogRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('appends review log entries and can filter by card', () => {
    reviewLogRepo.add({
      cardId: 'card-1',
      reviewedAt: '2026-01-01T00:00:00.000Z',
      grade: 'good',
      previousIntervalDays: 0,
      newIntervalDays: 1,
      previousEaseFactor: 2.5,
      newEaseFactor: 2.5,
    })
    reviewLogRepo.add({
      cardId: 'card-2',
      reviewedAt: '2026-01-02T00:00:00.000Z',
      grade: 'again',
      previousIntervalDays: 1,
      newIntervalDays: 1,
      previousEaseFactor: 2.5,
      newEaseFactor: 2.3,
    })

    expect(reviewLogRepo.getAll()).toHaveLength(2)
    expect(reviewLogRepo.getByCard('card-1')).toHaveLength(1)
    expect(reviewLogRepo.getByCard('card-1')[0].grade).toBe('good')
  })
})
