import type { ReactNode } from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: ReactNode
  sublabel?: string
  variant?: 'default' | 'accent' | 'warning'
}

export function StatCard({ label, value, sublabel, variant = 'default' }: StatCardProps) {
  return (
    <div className={`card ${styles.statCard}`}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} numeric ${variant === 'accent' ? 'text-accent' : variant === 'warning' ? 'text-warning' : ''}`}>
        {value}
      </p>
      {sublabel && <p className={styles.sublabel}>{sublabel}</p>}
    </div>
  )
}
