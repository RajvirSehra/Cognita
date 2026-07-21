import { ROUTES } from '@/components/layout/routes'
import styles from './NavBar.module.css'

interface NavBarProps {
  activeRoute: string
  onNavigate: (route: string) => void
}

export function NavBar({ activeRoute, onNavigate }: NavBarProps) {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={`${styles.inner} container`}>
        {ROUTES.map((route) => {
          const isActive = route.id === activeRoute
          return (
            <button
              key={route.id}
              type="button"
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              onClick={() => onNavigate(route.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              {route.navLabel}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
