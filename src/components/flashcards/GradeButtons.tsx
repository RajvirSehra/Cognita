import type { FlashcardGrade } from '@/types'
import styles from './GradeButtons.module.css'

interface GradeButtonsProps {
  onGrade: (grade: FlashcardGrade) => void
}

const GRADES: Array<{ grade: FlashcardGrade; label: string; shortcut: string }> = [
  { grade: 'again', label: 'Again', shortcut: '1' },
  { grade: 'hard', label: 'Hard', shortcut: '2' },
  { grade: 'good', label: 'Good', shortcut: '3' },
  { grade: 'easy', label: 'Easy', shortcut: '4' },
]

export function GradeButtons({ onGrade }: GradeButtonsProps) {
  return (
    <div className={styles.grid}>
      {GRADES.map(({ grade, label, shortcut }) => (
        <button key={grade} type="button" className={`btn ${styles.gradeButton} ${styles[grade]}`} onClick={() => onGrade(grade)}>
          <span>{label}</span>
          <span className={`numeric ${styles.shortcut}`}>{shortcut}</span>
        </button>
      ))}
    </div>
  )
}
