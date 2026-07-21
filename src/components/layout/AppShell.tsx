import { type ReactNode } from 'react'
import { NavBar } from '@/components/layout/NavBar'
import { ToastViewport } from '@/components/common/ToastViewport'
import { ROUTES } from '@/components/layout/routes'
import styles from './AppShell.module.css'

interface AppShellProps {
  activeRoute: string
  onNavigate: (route: string) => void
  children: ReactNode
}

export function AppShell({ activeRoute, onNavigate, children }: AppShellProps) {
  const activeLabel = ROUTES.find((route) => route.id === activeRoute)?.label ?? 'Cognita'

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`${styles.headerInner} container`}>
          <span className={styles.wordmark}>Cognita</span>
          <span className={styles.pageLabel}>{activeLabel}</span>
        </div>
      </header>
      <main className={`${styles.main} container`}>{children}</main>
      <ToastViewport />
      <NavBar activeRoute={activeRoute} onNavigate={onNavigate} />
    </div>
  )
}
