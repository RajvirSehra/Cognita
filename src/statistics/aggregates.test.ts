import { describe, expect, it } from 'vitest'
import {
  averageDailyMinutes,
  averageSessionMinutes,
  currentFocusTopic,
  dailyMinutesSeries,
  dueCardCount,
  monthlyMinutes,
  topicBreakdown,
  totalMinutes,
  uniqueCardsReviewedOnDate,
  weeklyMinutes,
} from '@/statistics/aggregates'
import type { Flashcard, ReviewLogEntry, StudySession } from '@/types'

function session(overrides: Partial<StudySession> & Pick<StudySession, 'date' | 'topic' | 'durationMinutes'>): StudySession {
  return {
    id: Math.random().toString(36),
    createdAt: `${overrides.date}T09:00:00.000Z`,
    updatedAt: `${overrides.date}T09:00:00.000Z`,
    ...overrides,
  }
}

describe('totalMinutes / averageSessionMinutes', () => {
  it('sums durations and averages them', () => {
    const sessions = [
      session({ date: '2026-01-01', topic: 'Math', durationMinutes: 30 }),
      session({ date: '2026-01-02', topic: 'Math', durationMinutes: 60 }),
    ]
    expect(totalMinutes(sessions)).toBe(90)
    expect(averageSessionMinutes(sessions)).toBe(45)
  })

  it('handles zero sessions without dividing by zero', () => {
    expect(totalMinutes([])).toBe(0)
    expect(averageSessionMinutes([])).toBe(0)
  })
})

describe('weeklyMinutes / monthlyMinutes', () => {
  const sessions = [
    session({ date: '2026-06-15', topic: 'A', durationMinutes: 60 }), // today, Monday
    session({ date: '2026-06-10', topic: 'A', durationMinutes: 60 }), // earlier same month, before this week
    session({ date: '2026-05-01', topic: 'A', durationMinutes: 90 }), // last month
  ]

  it('only counts sessions from the current week', () => {
    // 2026-06-15 is a Monday, so the week starts on 2026-06-15 itself.
    expect(weeklyMinutes(sessions, '2026-06-15')).toBe(60)
  })

  it('counts sessions from the current calendar month', () => {
    expect(monthlyMinutes(sessions, '2026-06-15')).toBe(120)
  })
})

describe('topicBreakdown', () => {
  it('aggregates minutes per topic and computes percentages', () => {
    const sessions = [
      session({ date: '2026-01-01', topic: 'Math', durationMinutes: 60 }),
      session({ date: '2026-01-02', topic: 'Math', durationMinutes: 20 }),
      session({ date: '2026-01-03', topic: 'History', durationMinutes: 20 }),
    ]
    const breakdown = topicBreakdown(sessions)
    expect(breakdown[0]).toMatchObject({ topic: 'Math', minutes: 80, sessionCount: 2 })
    expect(breakdown[1]).toMatchObject({ topic: 'History', minutes: 20, sessionCount: 1 })
    expect(breakdown[0].percentage).toBeCloseTo(80)
    expect(breakdown[1].percentage).toBeCloseTo(20)
  })
})

describe('currentFocusTopic', () => {
  it('picks the topic most studied in the last 7 days', () => {
    const sessions = [
      session({ date: '2026-06-14', topic: 'Physics', durationMinutes: 90 }),
      session({ date: '2026-06-01', topic: 'History', durationMinutes: 300 }),
    ]
    expect(currentFocusTopic(sessions, '2026-06-15')).toBe('Physics')
  })

  it('falls back to overall breakdown when nothing recent exists', () => {
    const sessions = [session({ date: '2026-01-01', topic: 'Old topic', durationMinutes: 10 })]
    expect(currentFocusTopic(sessions, '2026-06-15')).toBe('Old topic')
  })

  it('returns null when there are no sessions', () => {
    expect(currentFocusTopic([], '2026-06-15')).toBeNull()
  })
})

describe('averageDailyMinutes', () => {
  it('spreads total minutes across the span from first session to today', () => {
    const sessions = [session({ date: '2026-06-01', topic: 'A', durationMinutes: 60 })]
    // 2026-06-01 through 2026-06-15 inclusive = 15 days
    expect(averageDailyMinutes(sessions, '2026-06-15')).toBeCloseTo(60 / 15)
  })
})

describe('dailyMinutesSeries', () => {
  it('returns one entry per day, oldest first, ending today', () => {
    const sessions = [session({ date: '2026-06-15', topic: 'A', durationMinutes: 45 })]
    const series = dailyMinutesSeries(sessions, 3, '2026-06-15')
    expect(series.map((d) => d.date)).toEqual(['2026-06-13', '2026-06-14', '2026-06-15'])
    expect(series[2].minutes).toBe(45)
    expect(series[0].minutes).toBe(0)
  })
})

describe('uniqueCardsReviewedOnDate', () => {
  it('counts distinct cards, not review events', () => {
    const logs: ReviewLogEntry[] = [
      { id: '1', cardId: 'card-a', reviewedAt: '2026-06-15T08:00:00.000Z', grade: 'again', previousIntervalDays: 0, newIntervalDays: 1, previousEaseFactor: 2.5, newEaseFactor: 2.3 },
      { id: '2', cardId: 'card-a', reviewedAt: '2026-06-15T08:05:00.000Z', grade: 'good', previousIntervalDays: 1, newIntervalDays: 1, previousEaseFactor: 2.3, newEaseFactor: 2.3 },
      { id: '3', cardId: 'card-b', reviewedAt: '2026-06-15T09:00:00.000Z', grade: 'easy', previousIntervalDays: 0, newIntervalDays: 4, previousEaseFactor: 2.5, newEaseFactor: 2.6 },
    ]
    expect(uniqueCardsReviewedOnDate(logs, '2026-06-15')).toBe(2)
  })
})

describe('dueCardCount', () => {
  function card(dueDate: string): Flashcard {
    return {
      id: dueDate,
      front: 'f',
      back: 'b',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      dueDate,
    }
  }

  it('counts cards due today or earlier', () => {
    const cards = [card('2026-06-14'), card('2026-06-15'), card('2026-06-16')]
    expect(dueCardCount(cards, '2026-06-15')).toBe(2)
  })
})
