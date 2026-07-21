import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { GradeButtons } from '@/components/flashcards/GradeButtons'
import type { Flashcard, FlashcardGrade } from '@/types'
import styles from './FlashcardReview.module.css'

interface FlashcardReviewProps {
  card: Flashcard
  revealed: boolean
  remaining: number
  onReveal: () => void
  onGrade: (grade: FlashcardGrade) => void
}

export function FlashcardReview({ card, revealed, remaining, onReveal, onGrade }: FlashcardReviewProps) {
  useKeyboardShortcut(' ', onReveal, { ignoreWhenTyping: true })

  return (
    <div className="stack gap-4">
      <p className="text-muted text-sm">{remaining} card{remaining === 1 ? '' : 's'} left this session</p>

      <div className={`card ${styles.cardFace} fade-in`} onClick={!revealed ? onReveal : undefined} role={!revealed ? 'button' : undefined} tabIndex={!revealed ? 0 : undefined}>
        {card.topic && <span className="badge badge-accent">{card.topic}</span>}
        <p className={styles.front}>{card.front}</p>
        {revealed && (
          <>
            <hr className="divider" />
            <p className={`${styles.back} fade-in`}>{card.back}</p>
          </>
        )}
        {!revealed && <p className={styles.hint}>Tap to reveal, or press space</p>}
      </div>

      {revealed ? (
        <GradeButtons onGrade={onGrade} />
      ) : (
        <button type="button" className="btn btn-primary btn-block" onClick={onReveal}>
          Reveal answer
        </button>
      )}
    </div>
  )
}
