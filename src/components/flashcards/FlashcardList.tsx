import type { Flashcard, ReviewLogEntry } from '@/types'
import { formatDisplayDate, todayISODate } from '@/utils/date'
import styles from './FlashcardList.module.css'

interface FlashcardListProps {
  title: string
  cards: Flashcard[]
  reviewLogs: ReviewLogEntry[]
  onEdit: (card: Flashcard) => void
  onDelete: (id: string) => void
}

export function FlashcardList({ title, cards, reviewLogs, onEdit, onDelete }: FlashcardListProps) {
  if (cards.length === 0) return null
  const today = todayISODate()

  return (
    <div>
      <h3 className={styles.heading}>
        {title} <span className="text-muted numeric">({cards.length})</span>
      </h3>
      <ul className="stack gap-3">
        {cards.map((card) => {
          const reviewCount = reviewLogs.filter((log) => log.cardId === card.id).length
          return (
            <li key={card.id} className={`card ${styles.item}`}>
              <div className={styles.main}>
                <div className={styles.headerRow}>
                  <p className={styles.front}>{card.front}</p>
                  {card.topic && <span className="badge badge-accent">{card.topic}</span>}
                </div>
                <p className={`${styles.back} text-muted`}>{card.back}</p>
                <p className="text-muted text-sm">
                  Due {formatDisplayDate(card.dueDate, today)} &middot; {reviewCount} review{reviewCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="row gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(card)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(card.id)}>
                  Delete
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
