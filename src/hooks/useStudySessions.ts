import { useCallback, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { StorageError } from '@/storage/localStorageClient'
import { studySessionsRepo } from '@/storage/studySessionsRepo'
import type { NewStudySession } from '@/types'

export function useStudySessions() {
  const [sessions, setSessions] = useState(() => studySessionsRepo.getAll())
  const { showToast } = useToast()

  const refresh = useCallback(() => setSessions(studySessionsRepo.getAll()), [])

  const withErrorHandling = useCallback(
    (action: () => void, failureMessage: string) => {
      try {
        action()
        refresh()
        return true
      } catch (error) {
        showToast(error instanceof StorageError ? error.message : failureMessage, 'error')
        return false
      }
    },
    [refresh, showToast],
  )

  const addSession = useCallback(
    (input: NewStudySession) => withErrorHandling(() => studySessionsRepo.add(input), 'Could not save study session.'),
    [withErrorHandling],
  )

  const updateSession = useCallback(
    (id: string, patch: Partial<NewStudySession>) =>
      withErrorHandling(() => studySessionsRepo.update(id, patch), 'Could not update study session.'),
    [withErrorHandling],
  )

  const deleteSession = useCallback(
    (id: string) => withErrorHandling(() => studySessionsRepo.remove(id), 'Could not delete study session.'),
    [withErrorHandling],
  )

  return { sessions, addSession, updateSession, deleteSession, refresh }
}
