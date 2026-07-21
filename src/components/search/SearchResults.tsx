import type { SearchResult } from '@/utils/search'
import { formatDisplayDate } from '@/utils/date'
import styles from './SearchResults.module.css'

interface SearchResultsProps {
  results: SearchResult[]
}

export function SearchResults({ results }: SearchResultsProps) {
  return (
    <ul className="stack gap-3">
      {results.map((result) => (
        <li key={`${result.type}-${result.id}`} className={`card ${styles.item}`}>
          <div className={styles.headerRow}>
            <span className={`badge ${result.type === 'session' ? 'badge-accent' : 'badge-warning'}`}>
              {result.type === 'session' ? 'Study session' : 'Flashcard'}
            </span>
            {result.type === 'session' && <span className="text-muted text-sm">{formatDisplayDate(result.date)}</span>}
          </div>
          <p className={styles.title}>{result.title}</p>
          <p className={`${styles.snippet} text-muted`}>{result.snippet}</p>
          {result.topic && <span className="text-muted text-sm">{result.topic}</span>}
        </li>
      ))}
    </ul>
  )
}
