import { useMemo } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { StatCard } from '@/components/common/StatCard'
import { TopicBreakdownChart } from '@/components/statistics/TopicBreakdownChart'
import { WeeklyActivityChart } from '@/components/statistics/WeeklyActivityChart'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useStudySessions } from '@/hooks/useStudySessions'
import {
  averageDailyMinutes,
  dailyMinutesSeries,
  dueCardCount,
  monthlyMinutes,
  topicBreakdown,
  totalMinutes,
  weeklyMinutes,
} from '@/statistics/aggregates'
import { calculateCurrentStreak, calculateLongestStreak, getActiveDates } from '@/statistics/streaks'
import { formatDuration, todayISODate } from '@/utils/date'
import styles from './StatisticsPage.module.css'

export function StatisticsPage() {
  const { sessions } = useStudySessions()
  const { cards, reviewLogs } = useFlashcards()
  const today = todayISODate()

  const stats = useMemo(() => {
    const activeDates = getActiveDates(sessions, reviewLogs)
    return {
      currentStreak: calculateCurrentStreak(activeDates, today),
      longestStreak: calculateLongestStreak(activeDates),
      totalHours: totalMinutes(sessions) / 60,
      totalSessions: sessions.length,
      flashcardsReviewed: reviewLogs.length,
      totalFlashcards: cards.length,
      cardsDue: dueCardCount(cards, today),
      averageDaily: averageDailyMinutes(sessions, today),
      weekly: weeklyMinutes(sessions, today),
      monthly: monthlyMinutes(sessions, today),
      topics: topicBreakdown(sessions),
      dailySeries: dailyMinutesSeries(sessions, 7, today),
    }
  }, [sessions, cards, reviewLogs, today])

  if (sessions.length === 0 && cards.length === 0) {
    return <EmptyState title="No data yet" message="Statistics will appear once you log study sessions or review flashcards." />
  }

  return (
    <div className="stack gap-5">
      <section className={styles.grid}>
        <StatCard label="Current streak" value={stats.currentStreak} sublabel="days" variant="accent" />
        <StatCard label="Longest streak" value={stats.longestStreak} sublabel="days" />
        <StatCard label="Study hours" value={stats.totalHours.toFixed(1)} sublabel="total" />
        <StatCard label="Sessions" value={stats.totalSessions} sublabel="completed" />
        <StatCard label="Reviewed" value={stats.flashcardsReviewed} sublabel="flashcards" />
        <StatCard label="Flashcards" value={stats.totalFlashcards} sublabel="total" />
        <StatCard label="Cards due" value={stats.cardsDue} variant={stats.cardsDue > 0 ? 'warning' : 'default'} />
        <StatCard label="Daily average" value={formatDuration(Math.round(stats.averageDaily))} />
      </section>

      <section className="card">
        <h3>Last 7 days</h3>
        <WeeklyActivityChart series={stats.dailySeries} />
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>This week</h3>
          <span className="numeric text-accent">{formatDuration(stats.weekly)}</span>
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>This month</h3>
          <span className="numeric text-accent">{formatDuration(stats.monthly)}</span>
        </div>
      </section>

      {stats.topics.length > 0 && (
        <section className="card">
          <h3>Topic breakdown</h3>
          <TopicBreakdownChart entries={stats.topics} />
        </section>
      )}
    </div>
  )
}
