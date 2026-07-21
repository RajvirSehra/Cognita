import type { Flashcard, StudySession } from '@/types'

export type SearchResult =
  | { type: 'session'; id: string; title: string; snippet: string; topic: string; date: string }
  | { type: 'flashcard'; id: string; title: string; snippet: string; topic?: string }

function matches(query: string, ...fields: Array<string | undefined>): boolean {
  return fields.some((field) => field?.toLowerCase().includes(query))
}

export function searchAll(query: string, sessions: StudySession[], flashcards: Flashcard[]): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const sessionResults: SearchResult[] = sessions
    .filter((s) => matches(q, s.topic, s.notes, s.takeaway))
    .map((s) => ({
      type: 'session',
      id: s.id,
      title: s.topic,
      snippet: s.takeaway || s.notes || `${s.durationMinutes} min session`,
      topic: s.topic,
      date: s.date,
    }))

  const flashcardResults: SearchResult[] = flashcards
    .filter((c) => matches(q, c.front, c.back, c.topic))
    .map((c) => ({
      type: 'flashcard',
      id: c.id,
      title: c.front,
      snippet: c.back,
      topic: c.topic,
    }))

  return [...sessionResults, ...flashcardResults]
}
