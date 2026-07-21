import { createNewCardScheduling } from '@/scheduling/scheduler'
import { STORAGE_KEYS } from '@/storage/keys'
import { readJSON, writeJSON } from '@/storage/localStorageClient'
import type { Flashcard, NewFlashcard } from '@/types'
import { generateId } from '@/utils/id'
import { isFlashcardArray } from '@/utils/validation'

function load(): Flashcard[] {
  return readJSON<Flashcard[]>(STORAGE_KEYS.flashcards, [], isFlashcardArray)
}

function save(cards: Flashcard[]): void {
  writeJSON(STORAGE_KEYS.flashcards, cards)
}

export const flashcardsRepo = {
  getAll(): Flashcard[] {
    return load()
  },

  add(input: NewFlashcard): Flashcard {
    const now = new Date()
    const nowIso = now.toISOString()
    const card: Flashcard = {
      id: generateId(),
      front: input.front,
      back: input.back,
      topic: input.topic,
      createdAt: nowIso,
      updatedAt: nowIso,
      ...createNewCardScheduling(now),
    }
    const cards = [...load(), card]
    save(cards)
    return card
  },

  update(id: string, patch: Partial<NewFlashcard>): Flashcard | null {
    const cards = load()
    const index = cards.findIndex((c) => c.id === id)
    if (index === -1) return null

    const updated: Flashcard = {
      ...cards[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    const next = [...cards]
    next[index] = updated
    save(next)
    return updated
  },

  replaceCard(updated: Flashcard): void {
    const cards = load()
    const index = cards.findIndex((c) => c.id === updated.id)
    if (index === -1) return
    const next = [...cards]
    next[index] = updated
    save(next)
  },

  remove(id: string): void {
    save(load().filter((c) => c.id !== id))
  },

  replaceAll(cards: Flashcard[]): void {
    save(cards)
  },
}
