import { describe, expect, it } from 'vitest'
import { advanceReviewQueue } from '@/scheduling/reviewQueue'

describe('advanceReviewQueue', () => {
  it('removes the card from the queue on Hard, Good, or Easy', () => {
    const queue = ['a', 'b', 'c']
    expect(advanceReviewQueue(queue, 'a', 'hard')).toEqual(['b', 'c'])
    expect(advanceReviewQueue(queue, 'a', 'good')).toEqual(['b', 'c'])
    expect(advanceReviewQueue(queue, 'a', 'easy')).toEqual(['b', 'c'])
  })

  it('requeues the card a few positions later on Again, rather than dropping it', () => {
    const queue = ['a', 'b', 'c', 'd', 'e']
    const next = advanceReviewQueue(queue, 'a', 'again', 2)
    expect(next).toEqual(['b', 'c', 'a', 'd', 'e'])
    expect(next).toContain('a')
  })

  it('puts the card at the end if the queue is shorter than the requeue offset', () => {
    const queue = ['a', 'b']
    const next = advanceReviewQueue(queue, 'a', 'again', 5)
    expect(next).toEqual(['b', 'a'])
  })

  it('is a no-op shape when the card is the only one in the queue', () => {
    const next = advanceReviewQueue(['a'], 'a', 'again', 3)
    expect(next).toEqual(['a'])
  })
})
