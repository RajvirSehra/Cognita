import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ToastProvider } from '@/context/ToastContext'
import { useStudySessions } from '@/hooks/useStudySessions'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('useStudySessions', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts with sessions already in storage', () => {
    window.localStorage.setItem(
      'cognita:study-sessions',
      JSON.stringify([
        {
          id: '1',
          date: '2026-01-01',
          topic: 'Existing',
          durationMinutes: 10,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    )
    const { result } = renderHook(() => useStudySessions(), { wrapper })
    expect(result.current.sessions).toHaveLength(1)
  })

  it('adds a session and reflects it in state', () => {
    const { result } = renderHook(() => useStudySessions(), { wrapper })

    act(() => {
      result.current.addSession({ date: '2026-01-01', topic: 'New topic', durationMinutes: 30 })
    })

    expect(result.current.sessions).toHaveLength(1)
    expect(result.current.sessions[0].topic).toBe('New topic')
  })

  it('updates and deletes a session', () => {
    const { result } = renderHook(() => useStudySessions(), { wrapper })

    act(() => {
      result.current.addSession({ date: '2026-01-01', topic: 'Topic', durationMinutes: 30 })
    })
    const id = result.current.sessions[0].id

    act(() => {
      result.current.updateSession(id, { durationMinutes: 60 })
    })
    expect(result.current.sessions[0].durationMinutes).toBe(60)

    act(() => {
      result.current.deleteSession(id)
    })
    expect(result.current.sessions).toHaveLength(0)
  })
})
