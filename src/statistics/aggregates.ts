import type { Flashcard, ReviewLogEntry, StudySession } from '@/types'
import { isOnOrBefore, parseISODate, startOfMonth, startOfWeek, startOfYear, todayISODate, toISODate } from '@/utils/date'

export function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
}

export function averageSessionMinutes(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0
  return totalMinutes(sessions) / sessions.length
}

function minutesSince(sessions: StudySession[], sinceIso: string): number {
  return totalMinutes(sessions.filter((s) => isOnOrBefore(sinceIso, s.date)))
}

export function weeklyMinutes(sessions: StudySession[], today: string = todayISODate()): number {
  return minutesSince(sessions, startOfWeek(today))
}

export function monthlyMinutes(sessions: StudySession[], today: string = todayISODate()): number {
  return minutesSince(sessions, startOfMonth(today))
}

export function yearlyMinutes(sessions: StudySession[], today: string = todayISODate()): number {
  return minutesSince(sessions, startOfYear(today))
}

export function minutesOnDate(sessions: StudySession[], dateIso: string): number {
  return totalMinutes(sessions.filter((s) => s.date === dateIso))
}

/** Average minutes per calendar day across the span from the first session to today. */
export function averageDailyMinutes(sessions: StudySession[], today: string = todayISODate()): number {
  if (sessions.length === 0) return 0
  const earliest = sessions.reduce((min, s) => (s.date < min ? s.date : min), sessions[0].date)
  const oneDay = 24 * 60 * 60 * 1000
  const spanDays = Math.max(1, Math.round((parseISODate(today).getTime() - parseISODate(earliest).getTime()) / oneDay) + 1)
  return totalMinutes(sessions) / spanDays
}

export interface TopicBreakdownEntry {
  topic: string
  minutes: number
  sessionCount: number
  percentage: number
}

export function topicBreakdown(sessions: StudySession[]): TopicBreakdownEntry[] {
  const byTopic = new Map<string, { minutes: number; sessionCount: number }>()
  for (const session of sessions) {
    const entry = byTopic.get(session.topic) ?? { minutes: 0, sessionCount: 0 }
    entry.minutes += session.durationMinutes
    entry.sessionCount += 1
    byTopic.set(session.topic, entry)
  }

  const grandTotal = totalMinutes(sessions)
  return Array.from(byTopic.entries())
    .map(([topic, { minutes, sessionCount }]) => ({
      topic,
      minutes,
      sessionCount,
      percentage: grandTotal === 0 ? 0 : (minutes / grandTotal) * 100,
    }))
    .sort((a, b) => b.minutes - a.minutes)
}

/** The topic most studied in the last 7 days, falling back to the most recent session's topic. */
export function currentFocusTopic(sessions: StudySession[], today: string = todayISODate()): string | null {
  if (sessions.length === 0) return null
  const sevenDaysAgo = parseISODate(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const windowStart = toISODate(sevenDaysAgo)

  const recent = sessions.filter((s) => isOnOrBefore(windowStart, s.date))
  const pool = recent.length > 0 ? recent : sessions
  const breakdown = topicBreakdown(pool)
  return breakdown[0]?.topic ?? null
}

export function reviewsOnDate(reviewLogs: ReviewLogEntry[], dateIso: string): ReviewLogEntry[] {
  return reviewLogs.filter((log) => log.reviewedAt.slice(0, 10) === dateIso)
}

export function uniqueCardsReviewedOnDate(reviewLogs: ReviewLogEntry[], dateIso: string): number {
  return new Set(reviewsOnDate(reviewLogs, dateIso).map((log) => log.cardId)).size
}

export function dueCardCount(cards: Flashcard[], today: string = todayISODate()): number {
  return cards.filter((card) => isOnOrBefore(card.dueDate, today)).length
}

export interface DailyMinutes {
  date: string
  minutes: number
}

/** Minutes studied on each of the last `days` calendar days, oldest first. */
export function dailyMinutesSeries(sessions: StudySession[], days: number, today: string = todayISODate()): DailyMinutes[] {
  const series: DailyMinutes[] = []
  const cursor = parseISODate(today)
  cursor.setDate(cursor.getDate() - (days - 1))
  for (let i = 0; i < days; i++) {
    const date = toISODate(cursor)
    series.push({ date, minutes: minutesOnDate(sessions, date) })
    cursor.setDate(cursor.getDate() + 1)
  }
  return series
}
