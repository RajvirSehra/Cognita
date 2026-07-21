import { useMemo } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { StatCard } from '@/components/common/StatCard'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useStudySessions } from '@/hooks/useStudySessions'
import { dueCardCount, currentFocusTopic, minutesOnDate, totalMinutes, uniqueCardsReviewedOnDate } from '@/statistics/aggregates'
import { calculateCurrentStreak, getActiveDates } from '@/statistics/streaks'
import { formatDisplayDate, formatDuration, todayISODate } from '@/utils/date'
import styles from './DashboardPage.module.css'

interface DashboardPageProps {
  onNavigate: (route: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { sessions } = useStudySessions()
  const { cards, reviewLogs } = useFlashcards()
  const today = todayISODate()

  const stats = useMemo(() => {
    const activeDates = getActiveDates(sessions, reviewLogs)
    const currentStreak = calculateCurrentStreak(activeDates, today)
    const reviewedToday = uniqueCardsReviewedOnDate(reviewLogs, today)
    const studiedToday = minutesOnDate(sessions, today) > 0 || reviewedToday > 0
    const dueToday = dueCardCount(cards, today)
    const recentSessions = [...sessions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)

    return {
      currentStreak,
      studiedToday,
      totalHours: totalMinutes(sessions) / 60,
      totalSessions: sessions.length,
      dueToday,
      reviewedToday,
      totalCards: cards.length,
      focusTopic: currentFocusTopic(sessions, today),
      recentSessions,
    }
  }, [sessions, cards, reviewLogs, today])

  const continueTarget = stats.dueToday > 0 ? 'flashcards' : 'log'
  const continueLabel = stats.dueToday > 0 ? `Review ${stats.dueToday} due card${stats.dueToday === 1 ? '' : 's'}` : 'Log a study session'

  return (
    <div className="stack gap-5">
      <section className={`card ${styles.today}`}>
        <p className={styles.status}>{stats.studiedToday ? "You've studied today." : "You haven't studied yet today."}</p>
        <h1 className={styles.headline}>What's next</h1>
        <button type="button" className="btn btn-primary btn-block" onClick={() => onNavigate(continueTarget)}>
          {continueLabel}
        </button>
      </section>

      <section className={styles.grid}>
        <StatCard label="Streak" value={`${stats.currentStreak}`} sublabel={stats.currentStreak === 1 ? 'day' : 'days'} variant="accent" />
        <StatCard label="Cards due" value={stats.dueToday} variant={stats.dueToday > 0 ? 'warning' : 'default'} />
        <StatCard label="Study hours" value={stats.totalHours.toFixed(1)} sublabel="total" />
        <StatCard label="Sessions" value={stats.totalSessions} sublabel="total" />
        <StatCard label="Reviewed" value={stats.reviewedToday} sublabel="today" />
        <StatCard label="Flashcards" value={stats.totalCards} sublabel="total" />
      </section>

      {stats.focusTopic && (
        <section className="card">
          <p className="text-muted text-sm" style={{ margin: 0 }}>
            Current focus
          </p>
          <h2 className={styles.focusTopic}>{stats.focusTopic}</h2>
        </section>
      )}

      <section>
        <h3>Recent sessions</h3>
        {stats.recentSessions.length === 0 ? (
          <EmptyState title="No sessions yet" message="Log your first study session to start your record." />
        ) : (
          <ul className="stack gap-3">
            {stats.recentSessions.map((session) => (
              <li key={session.id} className={`card ${styles.sessionRow}`}>
                <div>
                  <p className={styles.sessionTopic}>{session.topic}</p>
                  <p className="text-muted text-sm">{formatDisplayDate(session.date, today)}</p>
                </div>
                <span className="numeric text-muted">{formatDuration(session.durationMinutes)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
