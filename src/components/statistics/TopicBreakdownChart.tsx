import type { TopicBreakdownEntry } from '@/statistics/aggregates'
import { formatDuration } from '@/utils/date'
import styles from './TopicBreakdownChart.module.css'

interface TopicBreakdownChartProps {
  entries: TopicBreakdownEntry[]
}

export function TopicBreakdownChart({ entries }: TopicBreakdownChartProps) {
  if (entries.length === 0) return null

  return (
    <ul className={`stack gap-3 ${styles.list}`}>
      {entries.map((entry) => (
        <li key={entry.topic} className={styles.row}>
          <div className={styles.labelRow}>
            <span>{entry.topic}</span>
            <span className="numeric text-muted">{formatDuration(entry.minutes)}</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${Math.max(entry.percentage, 2)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
