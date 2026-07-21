import { AppShell } from '@/components/layout/AppShell'
import { isKnownRoute } from '@/components/layout/routes'
import { ToastProvider } from '@/context/ToastContext'
import { useHashRoute } from '@/hooks/useHashRoute'
import { DashboardPage } from '@/pages/DashboardPage'
import { FlashcardsPage } from '@/pages/FlashcardsPage'
import { SearchPage } from '@/pages/SearchPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { StatisticsPage } from '@/pages/StatisticsPage'
import { StudyLogPage } from '@/pages/StudyLogPage'

function renderPage(route: string, navigate: (route: string) => void) {
  switch (route) {
    case 'dashboard':
      return <DashboardPage onNavigate={navigate} />
    case 'log':
      return <StudyLogPage />
    case 'flashcards':
      return <FlashcardsPage />
    case 'statistics':
      return <StatisticsPage />
    case 'search':
      return <SearchPage />
    case 'settings':
      return <SettingsPage />
    default:
      return <DashboardPage onNavigate={navigate} />
  }
}

function AppContent() {
  const [route, navigate] = useHashRoute()
  const activeRoute = isKnownRoute(route) ? route : 'dashboard'

  return (
    <AppShell activeRoute={activeRoute} onNavigate={navigate}>
      {renderPage(activeRoute, navigate)}
    </AppShell>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
