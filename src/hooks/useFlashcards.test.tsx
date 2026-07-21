import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ToastProvider } from '@/context/ToastContext'
import { useFlashcards } from '@/hooks/useFlashcards'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('useFlashcards', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adds a card that is due immediately', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper })

    act(() => {
      result.current.addCard({ front: 'Q', back: 'A' })
    })

    expect(result.current.cards).toHaveLength(1)
    expect(result.current.cards[0].repetitions).toBe(0)
  })

  it('grading a card updates its schedule and records a review log', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper })

    act(() => {
      result.current.addCard({ front: 'Q', back: 'A' })
    })
    const id = result.current.cards[0].id

    act(() => {
      result.current.gradeCardById(id, 'good')
    })

    expect(result.current.cards[0].repetitions).toBe(1)
    expect(result.current.reviewLogs).toHaveLength(1)
    expect(result.current.reviewLogs[0].grade).toBe('good')
  })

  it('deleting a card removes it', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper })

    act(() => {
      result.current.addCard({ front: 'Q', back: 'A' })
    })
    const id = result.current.cards[0].id

    act(() => {
      result.current.deleteCard(id)
    })

    expect(result.current.cards).toHaveLength(0)
  })
})
