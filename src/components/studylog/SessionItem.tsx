import type { StudySession } from '@/types'
import { formatDuration } from '@/utils/date'
import styles from './SessionItem.module.css'

interface SessionItemProps {
  session: StudySession
  onEdit: () => void
  onDelete: () => void
}

export function SessionItem({ session, onEdit, onDelete }: SessionItemProps) {
  return (
    <li className={`card ${styles.item}`}>
      <div className={styles.main}>
        <div className={styles.headerRow}>
          <p className={styles.topic}>{session.topic}</p>
          <span className="numeric text-muted">{formatDuration(session.durationMinutes)}</span>
        </div>
        {session.takeaway && <p className={styles.text}>{session.takeaway}</p>}
        {session.notes && <p className={`${styles.text} text-muted`}>{session.notes}</p>}
      </div>
      <div className="row gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  )
}
