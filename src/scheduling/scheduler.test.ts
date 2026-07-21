import { describe, expect, it } from 'vitest'
import { createNewCardScheduling, gradeCard, getDueCards, getUpcomingCards, isCardDue } from '@/scheduling/scheduler'
import type { Flashcard } from '@/types'
import { addDays, toISODate } from '@/utils/date'

function makeCard(overrides: Partial<Flashcard> = {}): Flashcard {
  const now = new Date('2026-01-01T10:00:00.000Z')
  return {
    id: 'card-1',
    front: 'Front',
    back: 'Back',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueDate: toISODate(now),
    ...overrides,
  }
}

describe('createNewCardScheduling', () => {
  it('makes new cards due immediately', () => {
    const now = new Date('2026-03-01T12:00:00.000Z')
    const scheduling = createNewCardScheduling(now)
    expect(scheduling.dueDate).toBe(toISODate(now))
    expect(scheduling.repetitions).toBe(0)
  })
})

describe('gradeCard', () => {
  it('returns an updated card and a matching review log entry', () => {
    const card = makeCard()
    const now = new Date('2026-01-05T09:00:00.000Z')
    const { card: updated, reviewLog } = gradeCard(card, 'good', now)

    expect(updated.id).toBe(card.id)
    expect(updated.repetitions).toBe(1)
    expect(updated.lastReviewedAt).toBe(now.toISOString())
    expect(updated.dueDate).toBe(addDays(toISODate(now), updated.intervalDays))

    expect(reviewLog.cardId).toBe(card.id)
    expect(reviewLog.grade).toBe('good')
    expect(reviewLog.previousIntervalDays).toBe(card.intervalDays)
    expect(reviewLog.newIntervalDays).toBe(updated.intervalDays)
  })

  it('does not mutate the original card', () => {
    const card = makeCard()
    const snapshot = { ...card }
    gradeCard(card, 'easy')
    expect(card).toEqual(snapshot)
  })
})

describe('isCardDue / getDueCards / getUpcomingCards', () => {
  const today = '2026-06-15'

  it('treats a card due today or earlier as due', () => {
    expect(isCardDue(makeCard({ dueDate: '2026-06-15' }), today)).toBe(true)
    expect(isCardDue(makeCard({ dueDate: '2026-06-10' }), today)).toBe(true)
    expect(isCardDue(makeCard({ dueDate: '2026-06-16' }), today)).toBe(false)
  })

  it('splits cards into due and upcoming, sorted by due date', () => {
    const cards = [
      makeCard({ id: 'a', dueDate: '2026-06-20' }),
      makeCard({ id: 'b', dueDate: '2026-06-10' }),
      makeCard({ id: 'c', dueDate: '2026-06-15' }),
      makeCard({ id: 'd', dueDate: '2026-06-12' }),
    ]

    const due = getDueCards(cards, today)
    const upcoming = getUpcomingCards(cards, today)

    expect(due.map((c) => c.id)).toEqual(['b', 'd', 'c'])
    expect(upcoming.map((c) => c.id)).toEqual(['a'])
  })
})
