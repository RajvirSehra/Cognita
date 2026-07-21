import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchResults } from '@/components/search/SearchResults'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useStudySessions } from '@/hooks/useStudySessions'
import { searchAll } from '@/utils/search'

export function SearchPage() {
  const { sessions } = useStudySessions()
  const { cards } = useFlashcards()
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchAll(query, sessions, cards), [query, sessions, cards])

  return (
    <div className="stack gap-4">
      <input
        type="search"
        className="input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sessions, flashcards, and topics..."
        aria-label="Global search"
        autoFocus
      />

      {query.trim() === '' ? (
        <EmptyState title="Search everything" message="Find study sessions, flashcards, and topics in one place." />
      ) : results.length === 0 ? (
        <EmptyState title="No matches" message={`Nothing found for "${query}".`} />
      ) : (
        <SearchResults results={results} />
      )}
    </div>
  )
}
