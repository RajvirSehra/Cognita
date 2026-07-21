import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      {message && <p className={styles.message}>{message}</p>}
      {action}
    </div>
  )
}
