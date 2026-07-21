import type { ReviewLogEntry, StudySession } from '@/types'
import { addDays, daysBetween, todayISODate, toISODate } from '@/utils/date'

/** A calendar day counts as "active" if the user logged a study session or reviewed a flashcard on it. */
export function getActiveDates(sessions: StudySession[], reviewLogs: ReviewLogEntry[]): Set<string> {
  const dates = new Set<string>()
  for (const session of sessions) dates.add(session.date)
  for (const log of reviewLogs) dates.add(toISODate(new Date(log.reviewedAt)))
  return dates
}

/**
 * Consecutive active days ending today. If today has no activity yet, the
 * streak still counts through yesterday (so logging today doesn't feel
 * mandatory before noon to "keep" a streak that isn't broken yet).
 */
export function calculateCurrentStreak(activeDates: Set<string>, today: string = todayISODate()): number {
  let cursor = today
  if (!activeDates.has(cursor)) {
    cursor = addDays(cursor, -1)
    if (!activeDates.has(cursor)) return 0
  }

  let streak = 0
  while (activeDates.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function calculateLongestStreak(activeDates: Set<string>): number {
  if (activeDates.size === 0) return 0
  const sorted = Array.from(activeDates).sort()

  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    current = daysBetween(sorted[i], sorted[i - 1]) === 1 ? current + 1 : 1
    longest = Math.max(longest, current)
  }
  return longest
}
