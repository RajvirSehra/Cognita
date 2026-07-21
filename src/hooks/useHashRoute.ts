import { useCallback, useEffect, useState } from 'react'

function readHashRoute(): string {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash || 'dashboard'
}

/**
 * A minimal hash-based router. Cognita has a handful of fixed top-level
 * pages, so a full routing library would be dead weight — this hook is all
 * client-side navigation needs, and hash routes survive a PWA reload
 * without any server-side rewrite configuration.
 */
export function useHashRoute(): [string, (route: string) => void] {
  const [route, setRoute] = useState<string>(readHashRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(readHashRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((next: string) => {
    if (readHashRoute() === next) {
      setRoute(next)
      return
    }
    window.location.hash = `/${next}`
  }, [])

  return [route, navigate]
}
