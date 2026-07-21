import type { FlashcardGrade } from '@/types'

/**
 * Advances an in-session review queue after a card is graded.
 *
 * The persisted SM-2 schedule (see scheduler.ts) always moves a card's due
 * date forward, even on "Again" — but within a single review session the
 * user still expects to see an "Again" card come back for another attempt
 * before the session ends, rather than only tomorrow. So the session queue
 * is tracked independently: grading Hard/Good/Easy retires the card from
 * this session, while Again reinserts it a few cards later.
 */
export function advanceReviewQueue(
  queue: string[],
  cardId: string,
  grade: FlashcardGrade,
  requeueOffset = 3,
): string[] {
  const rest = queue.filter((id) => id !== cardId)
  if (grade !== 'again') return rest

  const insertAt = Math.min(rest.length, requeueOffset)
  return [...rest.slice(0, insertAt), cardId, ...rest.slice(insertAt)]
}
