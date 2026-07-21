import { describe, expect, it } from 'vitest'
import { calculateCurrentStreak, calculateLongestStreak, getActiveDates } from '@/statistics/streaks'
import type { ReviewLogEntry, StudySession } from '@/types'

function session(date: string): StudySession {
  return {
    id: `s-${date}`,
    date,
    topic: 'Test',
    durationMinutes: 30,
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
  }
}

function reviewLog(dateTime: string): ReviewLogEntry {
  return {
    id: `r-${dateTime}`,
    cardId: 'card-1',
    reviewedAt: dateTime,
    grade: 'good',
    previousIntervalDays: 1,
    newIntervalDays: 3,
    previousEaseFactor: 2.5,
    newEaseFactor: 2.5,
  }
}

describe('getActiveDates', () => {
  it('unions study session dates and flashcard review dates', () => {
    const dates = getActiveDates([session('2026-01-01')], [reviewLog('2026-01-02T08:00:00.000Z')])
    expect(dates).toEqual(new Set(['2026-01-01', '2026-01-02']))
  })
})

describe('calculateCurrentStreak', () => {
  it('counts consecutive days ending today', () => {
    const active = new Set(['2026-01-01', '2026-01-02', '2026-01-03'])
    expect(calculateCurrentStreak(active, '2026-01-03')).toBe(3)
  })

  it('does not break the streak if today has no activity yet, as long as yesterday does', () => {
    const active = new Set(['2026-01-01', '2026-01-02'])
    expect(calculateCurrentStreak(active, '2026-01-03')).toBe(2)
  })

  it('returns 0 once a full day has passed with no activity', () => {
    const active = new Set(['2026-01-01'])
    expect(calculateCurrentStreak(active, '2026-01-03')).toBe(0)
  })

  it('returns 0 for no activity at all', () => {
    expect(calculateCurrentStreak(new Set(), '2026-01-03')).toBe(0)
  })
})

describe('calculateLongestStreak', () => {
  it('finds the longest run of consecutive days, not just the most recent one', () => {
    const active = new Set(['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-10', '2026-01-11'])
    expect(calculateLongestStreak(active)).toBe(3)
  })

  it('returns 0 for an empty set', () => {
    expect(calculateLongestStreak(new Set())).toBe(0)
  })

  it('returns 1 for a single active day', () => {
    expect(calculateLongestStreak(new Set(['2026-01-01']))).toBe(1)
  })
})
