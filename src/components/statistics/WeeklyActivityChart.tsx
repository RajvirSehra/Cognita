import type { DailyMinutes } from '@/statistics/aggregates'
import { formatDisplayDate, todayISODate } from '@/utils/date'
import styles from './WeeklyActivityChart.module.css'

interface WeeklyActivityChartProps {
  series: DailyMinutes[]
}

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function WeeklyActivityChart({ series }: WeeklyActivityChartProps) {
  const today = todayISODate()
  const max = Math.max(...series.map((d) => d.minutes), 1)

  return (
    <div className={styles.chart}>
      {series.map((day) => {
        const date = new Date(`${day.date}T00:00:00`)
        return (
          <div key={day.date} className={styles.column} title={`${formatDisplayDate(day.date, today)}: ${day.minutes} min`}>
            <div className={styles.track}>
              <div className={styles.bar} style={{ height: `${day.minutes === 0 ? 2 : Math.max((day.minutes / max) * 100, 6)}%` }} />
            </div>
            <span className={styles.label}>{WEEKDAY_INITIALS[date.getDay()]}</span>
          </div>
        )
      })}
    </div>
  )
}
