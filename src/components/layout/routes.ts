export interface RouteDef {
  id: string
  label: string
  navLabel: string
}

export const ROUTES: RouteDef[] = [
  { id: 'dashboard', label: 'Dashboard', navLabel: 'Home' },
  { id: 'log', label: 'Study Log', navLabel: 'Log' },
  { id: 'flashcards', label: 'Flashcards', navLabel: 'Cards' },
  { id: 'statistics', label: 'Statistics', navLabel: 'Stats' },
  { id: 'search', label: 'Search', navLabel: 'Search' },
  { id: 'settings', label: 'Settings', navLabel: 'Settings' },
]

export function isKnownRoute(id: string): boolean {
  return ROUTES.some((route) => route.id === id)
}
